from datetime import date

from pydantic import BaseModel, Field

from app.schemas.recommendations import RecipeIngredient


WEEK_DAYS = ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")


class MealPlanCreate(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    servings: int = Field(ge=1, le=12)
    ingredients: list[RecipeIngredient] = Field(min_length=1)


class MealPlanEntry(MealPlanCreate):
    day: str
    missing_ingredients: list[str]


class WeeklyMealPlanResponse(BaseModel):
    week_start: date
    meals: list[MealPlanEntry]
