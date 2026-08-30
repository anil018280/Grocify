from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    active_tab: str = Field(min_length=1, max_length=40)
    focused_mode: bool
    custom_recipe_name_value: str = Field(default="", max_length=255)
    custom_ingredients: list[str]
    calorie_target: int = Field(ge=1200)
