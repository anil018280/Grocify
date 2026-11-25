from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.profile import ProfileResponse


class ProfileUpdateRequest(BaseModel):
    active_tab: str = Field(min_length=1, max_length=40)
    focused_mode: bool
    custom_recipe_name_value: str = Field(default="", max_length=255)
    custom_ingredients: list[str]
    household_size: int = Field(default=2, ge=1, le=20)
    preferred_cuisines: list[str] = Field(default_factory=list)
    dietary_preferences: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    cooking_skill: str = Field(default="Intermediate", max_length=40)
    max_prep_minutes: int = Field(default=30, ge=5, le=240)


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)) -> ProfileResponse:
    profile = current_user.profile or UserProfile(user_id=current_user.id)
    return ProfileResponse(
        active_tab=profile.active_tab,
        focused_mode=profile.focused_mode,
        custom_recipe_name_value=profile.custom_recipe_name_value,
        custom_ingredients=profile.custom_ingredients or [],
        calorie_target=profile.calorie_target,
        household_size=profile.household_size or 2,
        preferred_cuisines=profile.preferred_cuisines or [],
        dietary_preferences=profile.dietary_preferences or [],
        allergies=profile.allergies or [],
        cooking_skill=profile.cooking_skill or "Intermediate",
        max_prep_minutes=profile.max_prep_minutes or 30,
    )


@router.put("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    if not current_user.profile:
        current_user.profile = UserProfile(user_id=current_user.id)
    current_user.profile.active_tab = payload.active_tab
    current_user.profile.focused_mode = payload.focused_mode
    current_user.profile.custom_recipe_name_value = payload.custom_recipe_name_value
    current_user.profile.custom_ingredients = payload.custom_ingredients
    current_user.profile.household_size = payload.household_size
    current_user.profile.preferred_cuisines = payload.preferred_cuisines
    current_user.profile.dietary_preferences = payload.dietary_preferences
    current_user.profile.allergies = payload.allergies
    current_user.profile.cooking_skill = payload.cooking_skill
    current_user.profile.max_prep_minutes = payload.max_prep_minutes
    db.commit()
    return get_profile(current_user=current_user)
