from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WeeklyMealPlan(Base):
    __tablename__ = "weekly_meal_plans"
    __table_args__ = (UniqueConstraint("user_id", "week_start", "day", name="uq_weekly_meal_plan_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    day: Mapped[str] = mapped_column(String(12), nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    servings: Mapped[int] = mapped_column(Integer, nullable=False)
    ingredients: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    missing_ingredients: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    user = relationship("User", back_populates="weekly_meal_plans")
