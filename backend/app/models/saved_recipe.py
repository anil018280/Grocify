from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SavedRecipe(Base):
    __tablename__ = "saved_recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    cuisine: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    prep_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    cook_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    estimated_calories_per_serving: Mapped[int] = mapped_column(Integer, nullable=False, default=350)
    estimated_cost: Mapped[float] = mapped_column(Float, nullable=False, default=10.0)
    ingredients: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    steps: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    substitutions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    nutrition_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="saved_recipes")
