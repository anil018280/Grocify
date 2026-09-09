from pydantic import BaseModel


class MealRecommendation(BaseModel):
    title: str
    description: str
    ingredients: list[str]
    estimated_calories: int
    reason: str


class ShoppingSuggestion(BaseModel):
    name: str
    reason: str


class RecommendationResponse(BaseModel):
    food_waste_risk: str
    calorie_remaining: int
    meal_ideas: list[MealRecommendation]
    shopping_suggestions: list[ShoppingSuggestion]
