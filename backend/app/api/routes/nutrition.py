from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.nutrition import NutritionEntry
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.nutrition import NutritionEntryCreate, NutritionEntryResponse, NutritionResponse


class NutritionUpdateRequest(BaseModel):
    calorie_target: int = Field(ge=1200)
    calorie_entries: list[NutritionEntryCreate]


router = APIRouter(prefix="/nutrition", tags=["nutrition"])


@router.get("", response_model=NutritionResponse)
def get_nutrition(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> NutritionResponse:
    entries = db.scalars(select(NutritionEntry).where(NutritionEntry.user_id == current_user.id).order_by(NutritionEntry.id.desc())).all()
    profile = current_user.profile or UserProfile(user_id=current_user.id)
    return NutritionResponse(
        calorie_target=profile.calorie_target,
        calorie_entries=[
            NutritionEntryResponse(
                id=entry.id,
                item_name=entry.item_name,
                servings=entry.servings,
                calories=entry.calories,
                protein=entry.protein,
                carbs=entry.carbs,
                fat=entry.fat,
                fiber=entry.fiber,
            )
            for entry in entries
        ],
    )


@router.put("", response_model=NutritionResponse)
def replace_nutrition(
    payload: NutritionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NutritionResponse:
    db.execute(delete(NutritionEntry).where(NutritionEntry.user_id == current_user.id))
    db.add_all(
        [
            NutritionEntry(
                user_id=current_user.id,
                item_name=entry.item_name,
                servings=entry.servings,
                calories=entry.calories,
                protein=entry.protein,
                carbs=entry.carbs,
                fat=entry.fat,
                fiber=entry.fiber,
            )
            for entry in payload.calorie_entries
        ]
    )
    if not current_user.profile:
        current_user.profile = UserProfile(user_id=current_user.id)
    current_user.profile.calorie_target = payload.calorie_target
    db.commit()
    return get_nutrition(db=db, current_user=current_user)
