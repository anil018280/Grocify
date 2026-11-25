from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WasteLog(Base):
    __tablename__ = "waste_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    item_name: Mapped[str] = mapped_column(String(120), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    unit: Mapped[str] = mapped_column(String(40), nullable=False, default="pcs")
    estimated_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    co2_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    reason: Mapped[str] = mapped_column(String(120), nullable=False, default="Spoiled / Expired")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="waste_logs")
