import json

from openai import OpenAI

from app.core.config import settings
from app.models.pantry import PantryItem
from app.schemas.recommendations import RecipeIngredient, RecipePlan, RecipeRequest


RECIPE_INSTRUCTIONS = """
You are Grocify's helpful meal-planning assistant. Create one practical, appetizing recipe that uses
the pantry items supplied by the user, prioritizing those with the fewest days remaining. Respect all
allergies strictly. Honor preferences, servings, and budget. Any nutrition and cost values are estimates.
Do not claim medical certainty or provide medical advice. Keep the recipe achievable for a home cook and
return only the requested structured data.
""".strip()


def _build_pantry_fallback_recipe(request: RecipeRequest, pantry_items: list[PantryItem]) -> RecipePlan:
    """Build a structured, pantry-first rescue recipe when OpenAI is unavailable or out of quota."""
    allergies = {a.strip().lower() for a in request.allergies if a.strip()}
    safe_pantry = [
        item
        for item in sorted(pantry_items, key=lambda entry: entry.days_left)
        if not any(allergy in item.name.lower() or allergy in item.category.lower() for allergy in allergies)
    ]
    chosen = safe_pantry[:4] if safe_pantry else sorted(pantry_items, key=lambda entry: entry.days_left)[:3]

    pref = (request.preferences or "").strip()
    pref_lower = pref.lower()
    appliances = [a.strip() for a in request.appliances if a.strip()]
    appliance_note = f" using {', '.join(appliances)}" if appliances else ""
    lead_names = [item.name for item in chosen[:2]]
    lead_label = " & ".join(lead_names) if lead_names else "Pantry"

    if "indian" in pref_lower:
        title = f"Spiced {lead_label} Masala Skillet"
        pantry_extras = [
            RecipeIngredient(name="Garlic & Ginger Paste", amount="1 tbsp", from_pantry=False),
            RecipeIngredient(name="Garam Masala & Turmeric", amount="1.5 tsp", from_pantry=False),
        ]
        steps = [
            f"Prep ingredients ({request.max_prep_minutes}m max prep){appliance_note}. Heat 1 tbsp oil and sauté garlic, ginger, and warm spices for 1 minute.",
            f"Add {', '.join(item.name for item in chosen[:2])} and cook for 4–5 minutes until tender.",
            "Stir in remaining pantry ingredients and simmer 6–8 minutes so flavors meld.",
            f"Adjust seasoning to taste and serve warm for {request.servings} serving(s).",
        ]
    elif "italian" in pref_lower or "pasta" in pref_lower:
        title = f"Rustic {lead_label} Herb Skillet"
        pantry_extras = [
            RecipeIngredient(name="Garlic Cloves", amount="2 cloves", from_pantry=False),
            RecipeIngredient(name="Fresh Basil", amount="0.5 bunch", from_pantry=False),
        ]
        steps = [
            f"Warm olive oil{appliance_note} and sauté minced garlic for 45 seconds.",
            f"Toss in {', '.join(item.name for item in chosen)} and cook 6–8 minutes until lightly browned.",
            "Finish with fresh herbs, cracked black pepper, and serve warm.",
        ]
    else:
        title = f"{lead_label} Rescue Power Bowl"
        pantry_extras = [
            RecipeIngredient(name="Lemons", amount="1 pc", from_pantry=False),
            RecipeIngredient(name="Garlic Bulbs", amount="2 cloves", from_pantry=False),
        ]
        steps = [
            f"Prep and chop your nearest-expiry pantry items ({', '.join(item.name for item in chosen[:3])}).",
            f"Cook{appliance_note} for 5–8 minutes until heated through.",
            "Fold in leafy greens or fresh produce at the end to preserve texture and nutrients.",
            f"Divide into {request.servings} portion(s) and finish with fresh lemon juice.",
        ]

    ingredients = [
        RecipeIngredient(
            name=item.name,
            amount=f"{max(1, round(item.quantity / 2, 1))} {item.unit}",
            from_pantry=True,
        )
        for item in chosen
    ] + [
        extra
        for extra in pantry_extras
        if not any(allergy in extra.name.lower() for allergy in allergies)
    ]

    total_cals = sum(float((item.nutrition or {}).get("calories", 140)) for item in chosen)
    per_serving_cals = max(180, round(total_cals / max(1, request.servings)) + 120)
    est_cost = min(float(request.budget), round(max(2.5, len(pantry_extras) * 1.95), 2))
    urgent_count = sum(1 for item in chosen if item.days_left <= 3)

    return RecipePlan(
        title=title,
        summary=(
            f"Pantry-first{' ' + pref if pref else ''} recipe prioritizing {urgent_count or len(chosen)} "
            f"expiring/available ingredient(s) within your ${float(request.budget):.2f} budget."
        ),
        prep_minutes=min(10, request.max_prep_minutes),
        cook_minutes=15,
        estimated_calories_per_serving=per_serving_cals,
        estimated_cost=est_cost,
        ingredients=ingredients,
        steps=steps,
        substitutions=[
            "Swap any leafy green or grain with whatever staple you have on hand.",
            "Use dried herbs if fresh aromatics are unavailable.",
        ],
        nutrition_note=(
            "Generated by Grocify's pantry-first fallback engine (OpenAI quota unavailable). "
            "Nutrition and cost values are estimates."
        ),
    )


def generate_recipe(request: RecipeRequest, pantry_items: list[PantryItem]) -> RecipePlan:
    if not settings.openai_api_key:
        return _build_pantry_fallback_recipe(request, pantry_items)

    pantry_context = [
        {
            "name": item.name,
            "quantity": item.quantity,
            "unit": item.unit,
            "category": item.category,
            "days_left": item.days_left,
            "nutrition": item.nutrition,
        }
        for item in sorted(pantry_items, key=lambda item: item.days_left)
    ]
    try:
        client = OpenAI(api_key=settings.openai_api_key, max_retries=0)
        response = client.responses.create(
            model=settings.openai_model,
            instructions=RECIPE_INSTRUCTIONS,
            input=json.dumps(
                {
                    "preferences": request.preferences,
                    "allergies": request.allergies,
                    "servings": request.servings,
                    "budget": request.budget,
                    "max_prep_minutes": request.max_prep_minutes,
                    "appliances": request.appliances,
                    "pantry_items": pantry_context,
                }
            ),
            max_output_tokens=1200,
            store=False,
            text={
                "format": {
                    "type": "json_schema",
                    "name": "grocify_recipe_plan",
                    "strict": True,
                    "schema": RecipePlan.model_json_schema(),
                }
            },
        )
        return RecipePlan.model_validate_json(response.output_text)
    except Exception:
        return _build_pantry_fallback_recipe(request, pantry_items)
