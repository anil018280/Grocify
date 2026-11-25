from app.models.nutrition import NutritionEntry
from app.models.pantry import PantryItem
from app.services.recommendations import build_recommendations


def test_recommendations_risk_levels():
    low_items = [PantryItem(name="Rice", quantity=2, unit="cups", category="Grains", location="Home", days_left=30, price=2.0, nutrition={})]
    low_res = build_recommendations(low_items, [], 2000)
    assert low_res.food_waste_risk == "low"
    assert low_res.calorie_remaining == 2000

    mod_items = [PantryItem(name="Spinach", quantity=1, unit="bunch", category="Produce", location="Home", days_left=2, price=2.5, nutrition={"calories": 25})]
    mod_res = build_recommendations(mod_items, [NutritionEntry(item_name="Oats", servings=1, calories=300, protein=8, carbs=50, fat=5, fiber=6)], 2000)
    assert mod_res.food_waste_risk == "moderate"
    assert mod_res.calorie_remaining == 1700
