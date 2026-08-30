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
    db.commit()
    return get_profile(current_user=current_user)
