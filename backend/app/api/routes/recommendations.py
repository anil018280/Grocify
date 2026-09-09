from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.nutrition import NutritionEntry
from app.models.pantry import PantryItem
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.recommendations import RecommendationResponse
from app.services.recommendations import build_recommendations


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=RecommendationResponse)
def get_recommendations(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> RecommendationResponse:
    pantry_items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id)).all()
    nutrition_entries = db.scalars(select(NutritionEntry).where(NutritionEntry.user_id == current_user.id)).all()
    calorie_target = (current_user.profile or UserProfile(user_id=current_user.id)).calorie_target
    return build_recommendations(pantry_items, nutrition_entries, calorie_target)
