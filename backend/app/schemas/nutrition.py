from pydantic import BaseModel, Field


class NutritionEntryBase(BaseModel):
    item_name: str = Field(min_length=1, max_length=120)
    servings: float = Field(ge=1)
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fat: float = Field(ge=0)
    fiber: float = Field(ge=0)


class NutritionEntryCreate(NutritionEntryBase):
    pass


class NutritionEntryResponse(NutritionEntryBase):
    id: int


class NutritionResponse(BaseModel):
    calorie_target: int = Field(ge=1200)
    calorie_entries: list[NutritionEntryResponse]
