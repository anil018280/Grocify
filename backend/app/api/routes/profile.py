from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.household_member import HouseholdMember
from app.models.pantry import PantryItem
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
    notify_email_enabled: bool = True
    notify_push_enabled: bool = False
    notify_days_threshold: int = Field(default=3, ge=1, le=14)
    notification_email: str = Field(default="", max_length=255)


class HouseholdMemberCreate(BaseModel):
    member_name: str = Field(min_length=1, max_length=120)
    member_email: str = Field(min_length=3, max_length=255)
    role: str = Field(default="Editor", pattern="^(Admin|Editor|Viewer)$")


class HouseholdMemberRoleUpdate(BaseModel):
    role: str = Field(pattern="^(Admin|Editor|Viewer)$")


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
        notify_email_enabled=bool(profile.notify_email_enabled),
        notify_push_enabled=bool(profile.notify_push_enabled),
        notify_days_threshold=profile.notify_days_threshold or 3,
        notification_email=profile.notification_email or current_user.email,
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
    current_user.profile.notify_email_enabled = payload.notify_email_enabled
    current_user.profile.notify_push_enabled = payload.notify_push_enabled
    current_user.profile.notify_days_threshold = payload.notify_days_threshold
    current_user.profile.notification_email = payload.notification_email
    db.commit()
    return get_profile(current_user=current_user)


@router.post("/test-notification")
def send_test_expiry_notification(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    profile = current_user.profile or UserProfile(user_id=current_user.id)
    threshold = profile.notify_days_threshold or 3
    urgent = db.scalars(
        select(PantryItem)
        .where(PantryItem.user_id == current_user.id, PantryItem.days_left <= threshold)
        .order_by(PantryItem.days_left.asc())
    ).all()
    target_email = profile.notification_email or current_user.email
    channels = []
    if profile.notify_email_enabled:
        channels.append(f"Email ({target_email})")
    if profile.notify_push_enabled:
        channels.append("Browser Push")
    item_summary = ", ".join(f"{item.name} ({item.days_left}d)" for item in urgent[:5])
    return {
        "status": "sent",
        "channels": channels or ["In-App"],
        "threshold_days": threshold,
        "urgent_count": len(urgent),
        "message": (
            f"Expiry digest for {len(urgent)} item(s) within {threshold}d: {item_summary}"
            if urgent
            else f"No items expiring within {threshold} day(s)."
        ),
    }


@router.get("/household-members")
def list_household_members(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    members = db.scalars(
        select(HouseholdMember).where(HouseholdMember.owner_id == current_user.id).order_by(HouseholdMember.id.desc())
    ).all()
    return {
        "members": [
            {
                "id": m.id,
                "member_name": m.member_name,
                "member_email": m.member_email,
                "role": m.role,
                "status": m.status,
            }
            for m in members
        ]
    }


@router.post("/household-members", status_code=status.HTTP_201_CREATED)
def invite_household_member(
    payload: HouseholdMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    member = HouseholdMember(
        owner_id=current_user.id,
        member_name=payload.member_name.strip(),
        member_email=payload.member_email.strip().lower(),
        role=payload.role,
        status="Invited",
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return {
        "id": member.id,
        "member_name": member.member_name,
        "member_email": member.member_email,
        "role": member.role,
        "status": member.status,
    }


@router.patch("/household-members/{member_id}")
def update_household_member_role(
    member_id: int,
    payload: HouseholdMemberRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    member = db.scalar(
        select(HouseholdMember).where(HouseholdMember.id == member_id, HouseholdMember.owner_id == current_user.id)
    )
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Household member not found.")
    member.role = payload.role
    db.commit()
    return {
        "id": member.id,
        "member_name": member.member_name,
        "member_email": member.member_email,
        "role": member.role,
        "status": member.status,
    }


@router.delete("/household-members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_household_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    member = db.scalar(
        select(HouseholdMember).where(HouseholdMember.id == member_id, HouseholdMember.owner_id == current_user.id)
    )
    if member:
        db.delete(member)
        db.commit()
