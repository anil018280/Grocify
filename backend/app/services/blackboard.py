from __future__ import annotations

import json
from datetime import timedelta

import redis

from app.core.config import settings


class BlackboardService:
    def __init__(self) -> None:
        self.client = redis.Redis.from_url(settings.redis_url, decode_responses=True)

    def build_key(self, session_id: str, namespace: str) -> str:
        return f"grocify:blackboard:{session_id}:{namespace}"

    def put(self, session_id: str, namespace: str, payload: dict, ttl_seconds: int = 3600) -> bool:
        key = self.build_key(session_id, namespace)
        serialized = json.dumps(payload)
        lock_key = f"{key}:lock"
        lock_acquired = self.client.set(lock_key, "1", ex=30, nx=True)
        if not lock_acquired:
            return False
        try:
            self.client.set(key, serialized, ex=timedelta(seconds=ttl_seconds))
            return True
        finally:
            self.client.delete(lock_key)

    def get(self, session_id: str, namespace: str) -> dict | None:
        key = self.build_key(session_id, namespace)
        raw = self.client.get(key)
        return json.loads(raw) if raw else None
