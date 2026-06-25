from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Knowledge Transfer System"
    app_env: str = "development"
    app_debug: bool = True
    app_secret_key: str = "change-me"

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_db: str = "kts_db"
    postgres_user: str = "kts_user"
    postgres_password: str = "kts_password"
    database_url: str = (
        "postgresql+psycopg2://kts_user:kts_password@postgres:5432/kts_db"
    )

    redis_host: str = "redis"
    redis_port: int = 6379
    redis_url: str = "redis://redis:6379/0"

    celery_broker_url: str = "redis://redis:6379/1"
    celery_result_backend: str = "redis://redis:6379/2"

    minio_endpoint: str = "minio:9000"
    minio_public_endpoint: str = "http://localhost:9000"
    minio_root_user: str = "minioadmin"
    minio_root_password: str = "minioadmin"
    minio_bucket_documents: str = "documents"
    minio_bucket_media: str = "media"
    minio_bucket_exports: str = "exports"
    minio_secure: bool = False

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    gemini_api_key: str = ""

    embedding_provider: str = "openai"
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536

    ocr_provider: str = "paddleocr"
    stt_provider: str = "whisper"
    vector_store: str = "pgvector"
    max_upload_size_mb: int = 1024

    cors_origins: str = "http://localhost:3000,http://localhost"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
