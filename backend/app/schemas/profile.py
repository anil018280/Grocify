from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    active_tab: str = Field(min_length=1, max_length=40)
    focused_mode: bool
    custom_recipe_name_value: str = Field(default="", max_length=255)
    custom_ingredients: list[str]
    calorie_target: int = Field(ge=1200)
    household_size: int = Field(default=2, ge=1, le=20)
    preferred_cuisines: list[str] = Field(default_factory=list)
    dietary_preferences: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    cooking_skill: str = Field(default="Intermediate", max_length=40)
    max_prep_minutes: int = Field(default=30, ge=5, le=240)
    notify_email_enabled: bool = True
    notify_push_enabled: bool = False
    notify_days_threshold: int = Field(default=3, ge=1, le=14)
    notification_email: str = Field(default="", max_length=255)
