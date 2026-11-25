from sqlalchemy import Boolean, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    active_tab: Mapped[str] = mapped_column(String(40), default="dashboard")
    focused_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    custom_recipe_name_value: Mapped[str] = mapped_column(String(255), default="")
    calorie_target: Mapped[int] = mapped_column(Integer, default=2000)
    custom_ingredients: Mapped[list] = mapped_column(JSON, default=list)
    household_size: Mapped[int] = mapped_column(Integer, default=2)
    preferred_cuisines: Mapped[list] = mapped_column(JSON, default=list)
    dietary_preferences: Mapped[list] = mapped_column(JSON, default=list)
    allergies: Mapped[list] = mapped_column(JSON, default=list)
    cooking_skill: Mapped[str] = mapped_column(String(40), default="Intermediate")
    max_prep_minutes: Mapped[int] = mapped_column(Integer, default=30)
    notify_email_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_push_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    notify_days_threshold: Mapped[int] = mapped_column(Integer, default=3)
    notification_email: Mapped[str] = mapped_column(String(255), default="")

    user = relationship("User", back_populates="profile")
