from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.pantry import PantryItem
from app.models.user import User
from app.schemas.pantry import PantryItemCreate, PantryItemResponse, PantryListResponse, PantryScanRequest, PantryScanResponse
from app.services.barcode_lookup import lookup_barcode
from app.services.blackboard import blackboard
from app.services.pantry_scanner import scan_pantry_photo


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
                location=getattr(item, "location", "Home") or "Home",
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
                location=getattr(item, "location", "Home") or "Home",
                days_left=item.days_left,
                price=item.price,
                nutrition=item.nutrition.model_dump(),
            )
            for item in pantry
        ]
    )
    db.commit()
    blackboard.invalidate(current_user.id, "recommendations")
    return list_pantry(db=db, current_user=current_user)


@router.post("/scan-photo", response_model=PantryScanResponse)
def scan_photo(
    payload: PantryScanRequest,
    current_user: User = Depends(get_current_user),
) -> PantryScanResponse:
    if not payload.image_data_url.startswith("data:image/"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Upload a valid image file (PNG, JPG, or WEBP).",
        )
    try:
        return scan_pantry_photo(payload.image_data_url, scan_type=payload.scan_type)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not analyze the pantry photo. Please check your OpenAI API key/model and try again.",
        ) from exc


@router.get("/barcode/{code}")
def get_barcode_product(code: str, current_user: User = Depends(get_current_user)) -> dict:
    if not code.strip().isdigit() or len(code.strip()) < 6:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Enter a valid numeric barcode (6+ digits).")
    return lookup_barcode(code)


class FridgeDoorEventRequest(BaseModel):
    image_data_url: str | None = None
    scenario: str = "restock"


@router.post("/fridge-door-event")
def simulate_fridge_door_event(
    payload: FridgeDoorEventRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Simulate a fridge-door-open light/camera trigger that auto-detects and updates pantry inventory."""
    scan_result = scan_pantry_photo(payload.image_data_url or "", scan_type="pantry", scenario=payload.scenario)
    existing_items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id)).all()
    by_name = {item.name.lower(): item for item in existing_items}

    added: list[str] = []
    updated: list[str] = []

    for detected in scan_result.items:
        key = detected.name.strip().lower()
        match = by_name.get(key)
        if match:
            match.quantity = round(float(match.quantity) + 1.0, 2)
            match.days_left = min(int(match.days_left), max(0, int(detected.days_left)))
            updated.append(match.name)
        else:
            new_item = PantryItem(
                user_id=current_user.id,
                name=detected.name,
                quantity=max(1.0, float(detected.quantity)),
                unit=detected.unit or "pcs",
                category=detected.category or "Produce",
                location="Home",
                days_left=max(0, int(detected.days_left)),
                price=max(0.0, float(detected.price)),
                nutrition=detected.nutrition.model_dump(),
            )
            db.add(new_item)
            added.append(detected.name)

    db.commit()
    blackboard.invalidate(current_user.id, "recommendations")
    refreshed = list_pantry(db=db, current_user=current_user)

    return {
        "event_id": f"fridge-{int(datetime.now(timezone.utc).timestamp())}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "trigger": "Fridge Door Opened -> Light ON -> Camera Captured",
        "summary": scan_result.summary,
        "added_items": added,
        "updated_items": updated,
        "total_pantry_count": len(refreshed.pantry),
        "pantry": refreshed.pantry,
    }
