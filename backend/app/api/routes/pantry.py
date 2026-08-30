from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.pantry import PantryItem
from app.models.user import User
from app.schemas.pantry import PantryItemCreate, PantryItemResponse, PantryListResponse


router = APIRouter(prefix="/pantry", tags=["pantry"])


@router.get("", response_model=PantryListResponse)
def list_pantry(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> PantryListResponse:
    items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id).order_by(PantryItem.id.desc())).all()
    return PantryListResponse(
        pantry=[
            PantryItemResponse(
                id=item.id,
                name=item.name,
                quantity=item.quantity,
                unit=item.unit,
                category=item.category,
                days_left=item.days_left,
                price=item.price,
                nutrition=item.nutrition,
            )
            for item in items
        ]
    )


@router.put("", response_model=PantryListResponse)
def replace_pantry(
    pantry: list[PantryItemCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PantryListResponse:
    db.execute(delete(PantryItem).where(PantryItem.user_id == current_user.id))
    db.add_all(
        [
            PantryItem(
                user_id=current_user.id,
                name=item.name,
                quantity=item.quantity,
                unit=item.unit,
                category=item.category,
                days_left=item.days_left,
                price=item.price,
                nutrition=item.nutrition.model_dump(),
            )
            for item in pantry
        ]
    )
    db.commit()
    return list_pantry(db=db, current_user=current_user)
