from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.blackboard import blackboard


router = APIRouter(tags=["health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unavailable"

    redis_status = "connected" if blackboard.ping() else "unavailable"
    return {
        "status": "ok",
        "database": db_status,
        "redis": redis_status,
    }
