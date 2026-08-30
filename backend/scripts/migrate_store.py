import json
import sys
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import delete, select

APP_ROOT = Path(__file__).resolve().parents[1]
if str(APP_ROOT) not in sys.path:
    sys.path.insert(0, str(APP_ROOT))

from app.db.session import SessionLocal
from app.models.cart import CartItem
from app.models.nutrition import NutritionEntry
from app.models.pantry import PantryItem
from app.models.profile import UserProfile
from app.models.user import User


ROOT = APP_ROOT.parent
STORE_PATH = ROOT / "data" / "store.json"


def parse_datetime(value: str | None) -> datetime:
    if not value:
        return datetime.now(UTC)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def to_float(value: object, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def to_int(value: object, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def ensure_nutrition(value: object) -> dict:
    nutrition = value if isinstance(value, dict) else {}
    return {
        "calories": to_float(nutrition.get("calories", 0)),
        "protein": to_float(nutrition.get("protein", 0)),
        "carbs": to_float(nutrition.get("carbs", 0)),
        "fat": to_float(nutrition.get("fat", 0)),
        "fiber": to_float(nutrition.get("fiber", 0)),
    }


def load_store_users() -> list[dict]:
    payload = json.loads(STORE_PATH.read_text(encoding="utf-8"))
    return payload.get("users", [])


def sync_user(db, source_user: dict) -> str:
    email = str(source_user.get("email", "")).strip().lower()
    if not email:
        return "skipped"

    state = source_user.get("state") or {}
    pantry = state.get("pantry") or []
    cart_items = state.get("cartItems") or []
    calorie_entries = state.get("calorieEntries") or []
    custom_ingredients = state.get("customIngredients") or []

    user = db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(
            id=str(source_user.get("id") or ""),
            name=str(source_user.get("name", "")).strip() or email.split("@", 1)[0],
            email=email,
            password_hash=str(source_user.get("passwordHash", "")),
            created_at=parse_datetime(source_user.get("createdAt")),
        )
        db.add(user)
        db.flush()
        action = "created"
    else:
        user.name = str(source_user.get("name", "")).strip() or user.name
        user.password_hash = str(source_user.get("passwordHash", "")) or user.password_hash
        action = "updated"

    if not user.profile:
        user.profile = UserProfile(user_id=user.id)

    user.profile.active_tab = str(state.get("activeTab") or "inventory")
    user.profile.focused_mode = bool(state.get("focusedMode"))
    user.profile.custom_recipe_name_value = str(state.get("customRecipeNameValue") or "")
    user.profile.calorie_target = max(1200, to_int(state.get("calorieTarget"), 2000))
    user.profile.custom_ingredients = [str(item).strip() for item in custom_ingredients if str(item).strip()]

    db.execute(delete(PantryItem).where(PantryItem.user_id == user.id))
    db.execute(delete(CartItem).where(CartItem.user_id == user.id))
    db.execute(delete(NutritionEntry).where(NutritionEntry.user_id == user.id))

    db.add_all(
        [
            PantryItem(
                user_id=user.id,
                name=str(item.get("name", "")).strip() or "Unnamed item",
                quantity=max(0.0, to_float(item.get("quantity"), 0)),
                unit=str(item.get("unit", "")).strip() or "unit",
                category=str(item.get("category", "")).strip() or "Pantry",
                days_left=max(0, to_int(item.get("daysLeft"), 0)),
                price=max(0.0, to_float(item.get("price"), 0)),
                nutrition=ensure_nutrition(item.get("nutrition")),
            )
            for item in pantry
        ]
    )
    db.add_all(
        [
            CartItem(
                user_id=user.id,
                name=str(item.get("name", "")).strip() or "Unnamed item",
                quantity=max(0.0, to_float(item.get("quantity"), 0)),
                price=max(0.0, to_float(item.get("price"), 0)),
            )
            for item in cart_items
        ]
    )
    db.add_all(
        [
            NutritionEntry(
                user_id=user.id,
                item_name=str(item.get("itemName", "")).strip() or "Unnamed item",
                servings=max(0.0, to_float(item.get("servings"), 0)),
                calories=max(0.0, to_float(item.get("calories"), 0)),
                protein=max(0.0, to_float(item.get("protein"), 0)),
                carbs=max(0.0, to_float(item.get("carbs"), 0)),
                fat=max(0.0, to_float(item.get("fat"), 0)),
                fiber=max(0.0, to_float(item.get("fiber"), 0)),
            )
            for item in calorie_entries
        ]
    )

    return action


def main() -> None:
    users = load_store_users()
    created = 0
    updated = 0
    skipped = 0

    with SessionLocal() as db:
        for source_user in users:
            action = sync_user(db, source_user)
            if action == "created":
                created += 1
            elif action == "updated":
                updated += 1
            else:
                skipped += 1
        db.commit()

    print(f"Migrated prototype users from {STORE_PATH}")
    print(f"Created: {created}")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")


if __name__ == "__main__":
    main()
