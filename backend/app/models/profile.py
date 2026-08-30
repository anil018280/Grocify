from sqlalchemy import Boolean, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    active_tab: Mapped[str] = mapped_column(String(40), default="inventory")
    focused_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    custom_recipe_name_value: Mapped[str] = mapped_column(String(255), default="")
    calorie_target: Mapped[int] = mapped_column(Integer, default=2000)
    custom_ingredients: Mapped[list] = mapped_column(JSON, default=list)

    user = relationship("User", back_populates="profile")
