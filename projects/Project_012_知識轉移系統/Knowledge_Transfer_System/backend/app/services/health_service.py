from dataclasses import dataclass

import redis
from minio import Minio
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine


@dataclass(frozen=True)
class HealthStatus:
    status: str
    services: dict[str, str]


class HealthService:
    @classmethod
    def check_all(cls) -> dict[str, object]:
        services = {
            "postgres": cls._check_postgres(),
            "redis": cls._check_redis(),
            "minio": cls._check_minio(),
        }
        overall_status = (
            "ok" if all(status == "ok" for status in services.values()) else "degraded"
        )
        return {
            "status": overall_status,
            "services": services,
        }

    @staticmethod
    def _check_postgres() -> str:
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return "ok"
        except Exception:
            return "unavailable"

    @staticmethod
    def _check_redis() -> str:
        try:
            client = redis.from_url(
                settings.redis_url,
                socket_connect_timeout=1,
                socket_timeout=1,
            )
            return "ok" if client.ping() else "unavailable"
        except Exception:
            return "unavailable"

    @staticmethod
    def _check_minio() -> str:
        try:
            client = Minio(
                settings.minio_endpoint,
                access_key=settings.minio_root_user,
                secret_key=settings.minio_root_password,
                secure=settings.minio_secure,
            )
            required_buckets = [
                settings.minio_bucket_documents,
                settings.minio_bucket_media,
                settings.minio_bucket_exports,
            ]
            for bucket in required_buckets:
                client.bucket_exists(bucket)
            return "ok"
        except Exception:
            return "unavailable"
