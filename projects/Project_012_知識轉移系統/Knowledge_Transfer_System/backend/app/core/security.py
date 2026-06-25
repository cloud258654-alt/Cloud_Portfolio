from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    expires_delta = timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    expires_at = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": subject, "exp": expires_at}
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
