from pydantic import BaseModel, ConfigDict, Field


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


class RecipeRequest(BaseModel):
    preferences: str = Field(default="", max_length=500)
    allergies: list[str] = Field(default_factory=list, max_length=20)
    servings: int = Field(default=2, ge=1, le=12)
    budget: float = Field(default=20, gt=0, le=500)


class RecipeOutputModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class RecipeIngredient(RecipeOutputModel):
    name: str
    amount: str
    from_pantry: bool


class RecipePlan(RecipeOutputModel):
    title: str
    summary: str
    prep_minutes: int
    cook_minutes: int
    estimated_calories_per_serving: int
    estimated_cost: float
    ingredients: list[RecipeIngredient]
    steps: list[str]
    substitutions: list[str]
    nutrition_note: str
