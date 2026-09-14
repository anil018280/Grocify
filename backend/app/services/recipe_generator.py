import json

from openai import OpenAI

from app.core.config import settings
from app.models.pantry import PantryItem
from app.schemas.recommendations import RecipePlan, RecipeRequest


RECIPE_INSTRUCTIONS = """
You are Grocify's helpful meal-planning assistant. Create one practical, appetizing recipe that uses
the pantry items supplied by the user, prioritizing those with the fewest days remaining. Respect all
allergies strictly. Honor preferences, servings, and budget. Any nutrition and cost values are estimates.
Do not claim medical certainty or provide medical advice. Keep the recipe achievable for a home cook and
return only the requested structured data.
""".strip()


def generate_recipe(request: RecipeRequest, pantry_items: list[PantryItem]) -> RecipePlan:
    if not settings.openai_api_key:
        raise RuntimeError("AI recipe generation is not configured. Add OPENAI_API_KEY to the server environment.")

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
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.responses.create(
        model=settings.openai_model,
        instructions=RECIPE_INSTRUCTIONS,
        input=json.dumps(
            {
                "preferences": request.preferences,
                "allergies": request.allergies,
                "servings": request.servings,
                "budget": request.budget,
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
