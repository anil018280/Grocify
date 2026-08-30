from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.blackboard import BlackboardService


class BlackboardMessage(BaseModel):
    session_id: str = Field(min_length=1)
    namespace: str = Field(min_length=1)
    payload: dict
    ttl_seconds: int = Field(default=3600, ge=60, le=86400)


router = APIRouter(prefix="/blackboard", tags=["blackboard"])
service = BlackboardService()


@router.post("")
def put_blackboard_message(message: BlackboardMessage) -> dict[str, str]:
    success = service.put(
        session_id=message.session_id,
        namespace=message.namespace,
        payload=message.payload,
        ttl_seconds=message.ttl_seconds,
    )
    if not success:
        raise HTTPException(status_code=409, detail="Blackboard key is currently locked.")
    return {"status": "stored"}


@router.get("/{session_id}/{namespace}")
def get_blackboard_message(session_id: str, namespace: str) -> dict:
    payload = service.get(session_id=session_id, namespace=namespace)
    if payload is None:
        raise HTTPException(status_code=404, detail="Blackboard message not found.")
    return payload
