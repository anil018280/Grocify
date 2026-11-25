from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


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
    location: str = Field(default="Home", min_length=1, max_length=80)
    days_left: int = Field(ge=0)
    price: float = Field(ge=0)
    nutrition: PantryNutrition


class PantryItemCreate(PantryItemBase):
    pass


class PantryItemResponse(PantryItemBase):
    id: int


class PantryListResponse(BaseModel):
    pantry: list[PantryItemResponse]


class PantryScanRequest(BaseModel):
    image_data_url: str = Field(min_length=20)
    scan_type: Literal["auto", "pantry", "receipt"] = "auto"


class ScannedPantryNutrition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float


class ScannedPantryItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    quantity: float
    unit: str
    category: str
    days_left: int
    expiry_date: str
    price: float
    nutrition: ScannedPantryNutrition


class PantryScanResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str
    items: list[ScannedPantryItem]
