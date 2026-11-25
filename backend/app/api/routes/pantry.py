from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.pantry import PantryItem
from app.models.user import User
from app.models.waste_log import WasteLog
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
    """Simulate a 3-camera fridge-door-open trigger (main shelf + side-door sauces + deep freezer)."""
    shelf_scan = scan_pantry_photo(payload.image_data_url or "", scan_type="pantry", scenario=payload.scenario)
    door_scan = scan_pantry_photo("", scan_type="pantry", scenario="door_sauces")
    freezer_scan = scan_pantry_photo("", scan_type="pantry", scenario="deep_freezer")

    existing_items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id)).all()
    by_name = {item.name.lower(): item for item in existing_items}

    added: list[str] = []
    updated: list[str] = []
    door_sauces_detected: list[str] = []
    freezer_items_detected: list[str] = []

    def _upsert(detected, zone: str = "shelf") -> None:
        key = detected.name.strip().lower()
        match = by_name.get(key)
        if zone == "door":
            door_sauces_detected.append(detected.name)
        elif zone == "freezer":
            freezer_items_detected.append(detected.name)
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
                location="Freezer" if zone == "freezer" else "Home",
                days_left=max(0, int(detected.days_left)),
                price=max(0.0, float(detected.price)),
                nutrition=detected.nutrition.model_dump(),
            )
            db.add(new_item)
            by_name[key] = new_item
            added.append(detected.name)

    for item in shelf_scan.items:
        _upsert(item, zone="shelf")
    for item in door_scan.items:
        _upsert(item, zone="door")
    for item in freezer_scan.items:
        _upsert(item, zone="freezer")

    db.commit()
    blackboard.invalidate(current_user.id, "recommendations")
    refreshed = list_pantry(db=db, current_user=current_user)

    return {
        "event_id": f"fridge-{int(datetime.now(timezone.utc).timestamp())}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "trigger": "Door Opened -> Light ON -> Main Shelf + Side-Door Sauces + Deep Freezer Scanned",
        "summary": f"{shelf_scan.summary} {door_scan.summary} {freezer_scan.summary}",
        "added_items": added,
        "updated_items": updated,
        "door_sauces_detected": door_sauces_detected,
        "freezer_items_detected": freezer_items_detected,
        "total_pantry_count": len(refreshed.pantry),
        "pantry": refreshed.pantry,
    }


@router.get("/waste-log")
def get_waste_log(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    logs = db.scalars(select(WasteLog).where(WasteLog.user_id == current_user.id).order_by(WasteLog.id.desc())).all()
    total_value = round(sum(float(w.estimated_value) for w in logs), 2)
    total_co2 = round(sum(float(w.co2_kg) for w in logs), 2)
    return {
        "total_wasted_items": len(logs),
        "total_value_lost": total_value,
        "total_co2_kg": total_co2,
        "waste_logs": [
            {
                "id": w.id,
                "item_name": w.item_name,
                "quantity": w.quantity,
                "unit": w.unit,
                "estimated_value": w.estimated_value,
                "co2_kg": w.co2_kg,
                "reason": w.reason,
                "created_at": w.created_at.isoformat(),
            }
            for w in logs
        ],
    }


@router.post("/garbage-camera-event")
def simulate_garbage_camera_event(
    payload: FridgeDoorEventRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Simulate a smart trash-bin camera scanning discarded food, logging waste, and deducting from pantry."""
    waste_scan = scan_pantry_photo(payload.image_data_url or "", scan_type="pantry", scenario="garbage_waste")
    existing_items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id)).all()
    by_name = {item.name.lower(): item for item in existing_items}

    logged_items: list[str] = []
    deducted_from_pantry: list[str] = []

    for wasted in waste_scan.items:
        key = wasted.name.strip().lower()
        match = by_name.get(key)
        est_val = round(float(wasted.price), 2)
        co2 = round(max(0.2, float(wasted.quantity) * 0.45), 2)
        if match:
            deducted_from_pantry.append(match.name)
            match.quantity = round(float(match.quantity) - 1.0, 2)
            if match.quantity <= 0:
                db.delete(match)
        db.add(
            WasteLog(
                user_id=current_user.id,
                item_name=wasted.name,
                quantity=max(1.0, float(wasted.quantity)),
                unit=wasted.unit or "pcs",
                estimated_value=est_val,
                co2_kg=co2,
                reason="Detected in Trash / Compost Bin",
            )
        )
        logged_items.append(wasted.name)

    db.commit()
    blackboard.invalidate(current_user.id, "recommendations")
    waste_summary = get_waste_log(db=db, current_user=current_user)

    return {
        "event_id": f"waste-{int(datetime.now(timezone.utc).timestamp())}",
        "trigger": "Bin Lid Opened -> Waste Cam ON -> Discarded Food Logged & Deducted",
        "summary": waste_scan.summary,
        "logged_items": logged_items,
        "deducted_from_pantry": deducted_from_pantry,
        **waste_summary,
    }
