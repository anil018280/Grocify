from datetime import datetime, timedelta, timezone
import hashlib
import hmac

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings


password_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def is_legacy_scrypt_hash(hashed_password: str) -> bool:
    parts = str(hashed_password).split(":")
    return len(parts) == 2 and all(parts)


def _verify_legacy_scrypt_password(plain_password: str, hashed_password: str) -> bool:
    salt, stored_hash = hashed_password.split(":", 1)
    derived = hashlib.scrypt(plain_password.encode("utf-8"), salt=salt.encode("utf-8"), n=16384, r=8, p=1, dklen=64)
    return hmac.compare_digest(stored_hash, derived.hex())


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if is_legacy_scrypt_hash(hashed_password):
        return _verify_legacy_scrypt_password(plain_password, hashed_password)
    return password_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return password_context.hash(password)


def needs_password_rehash(hashed_password: str) -> bool:
    return is_legacy_scrypt_hash(hashed_password)


def create_access_token(subject: str) -> str:
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire_at = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": subject, "exp": expire_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
