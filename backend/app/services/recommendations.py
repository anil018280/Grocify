from app.models.nutrition import NutritionEntry
from app.models.pantry import PantryItem
from app.schemas.recommendations import MealRecommendation, RecommendationResponse, ShoppingSuggestion


def build_recommendations(
    pantry_items: list[PantryItem], nutrition_entries: list[NutritionEntry], calorie_target: int
) -> RecommendationResponse:
    """Create transparent meal plans from freshness and nutrition signals."""
    urgent_items = sorted((item for item in pantry_items if item.days_left <= 3), key=lambda item: item.days_left)
    available_items = urgent_items or sorted(pantry_items, key=lambda item: item.days_left)
    calories_logged = sum(entry.calories * entry.servings for entry in nutrition_entries)
    calorie_remaining = max(0, round(calorie_target - calories_logged))

    meal_ideas: list[MealRecommendation] = []
    if available_items:
        selected = available_items[:3]
        ingredients = [item.name for item in selected]
        estimated_calories = round(sum((item.nutrition or {}).get("calories", 120) for item in selected))
        urgent_count = len(urgent_items)
        meal_ideas.append(
            MealRecommendation(
                title="Use-first pantry bowl",
                description="Combine your nearest-expiry ingredients into a flexible bowl, stir-fry, or salad.",
                ingredients=ingredients,
                estimated_calories=estimated_calories,
                reason=(
                    f"Prioritizes {urgent_count} item{'s' if urgent_count != 1 else ''} that should be used within 3 days."
                    if urgent_count
                    else "Uses ingredients already in your pantry to reduce unnecessary shopping."
                ),
            )
        )

        if len(available_items) > 1:
            meal_ideas.append(
                MealRecommendation(
                    title="Low-waste quick meal",
                    description="Build a simple meal around the two ingredients with the shortest remaining shelf life.",
                    ingredients=[item.name for item in available_items[:2]],
                    estimated_calories=round(sum((item.nutrition or {}).get("calories", 120) for item in available_items[:2])),
                    reason="Keeps the meal small and practical while helping prevent food waste.",
                )
            )

    shopping_suggestions: list[ShoppingSuggestion] = []
    pantry_names = {item.name.lower() for item in pantry_items}
    if calorie_remaining > 500 and not any("protein" in item.category.lower() for item in pantry_items):
        shopping_suggestions.append(ShoppingSuggestion(name="Protein source", reason="Your pantry has no items categorized as protein."))
    if not any("produce" in item.category.lower() for item in pantry_items):
        shopping_suggestions.append(ShoppingSuggestion(name="Fresh produce", reason="Add fruit or vegetables for more balanced meal options."))
    if not pantry_items:
        shopping_suggestions.append(ShoppingSuggestion(name="Pantry basics", reason="Add a few ingredients to generate personalized meal ideas."))
    elif not shopping_suggestions and "whole grains" not in pantry_names:
        shopping_suggestions.append(ShoppingSuggestion(name="Whole grains", reason="A versatile staple for turning pantry ingredients into complete meals."))

    risk = "high" if len(urgent_items) >= 3 else "moderate" if urgent_items else "low"
    return RecommendationResponse(
        food_waste_risk=risk,
        calorie_remaining=calorie_remaining,
        meal_ideas=meal_ideas,
        shopping_suggestions=shopping_suggestions,
    )
