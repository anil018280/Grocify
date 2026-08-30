from pydantic import BaseModel, Field


class PantryNutrition(BaseModel):
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fat: float = Field(ge=0)
    fiber: float = Field(ge=0)


class PantryItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    quantity: float = Field(ge=1)
    unit: str = Field(min_length=1, max_length=40)
    category: str = Field(min_length=1, max_length=80)
    days_left: int = Field(ge=0)
    price: float = Field(ge=0)
    nutrition: PantryNutrition


class PantryItemCreate(PantryItemBase):
    pass


class PantryItemResponse(PantryItemBase):
    id: int


class PantryListResponse(BaseModel):
    pantry: list[PantryItemResponse]
