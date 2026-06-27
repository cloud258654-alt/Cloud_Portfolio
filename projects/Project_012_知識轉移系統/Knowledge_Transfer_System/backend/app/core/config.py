from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Knowledge Transfer System"
    app_env: str = "development"
    app_debug: bool = True
    app_secret_key: str = Field("change-me", min_length=16)

    backend_host: str = "0.0.0.0"
    backend_port: int = Field(8000, ge=1, le=65535)

    jwt_secret_key: str = Field("change-me", min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(60, ge=1, le=10080)

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
    embedding_dimension: int = Field(1536, ge=1, le=8192)

    ocr_provider: str = "paddleocr"
    stt_provider: str = "whisper"
    vector_store: str = "pgvector"
    max_upload_size_mb: int = Field(1024, ge=1, le=10240)

    cors_origins: str = "http://localhost:3000,http://localhost"

    rate_limit_enabled: bool = True
    rate_limit_chat: str = "30/minute"
    rate_limit_quiz: str = "10/minute"
    rate_limit_upload: str = "20/minute"

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

    @field_validator("cors_origins")
    @classmethod
    def validate_cors(cls, v: str) -> str:
        origins = [o.strip() for o in v.split(",") if o.strip()]
        if not origins:
            raise ValueError("cors_origins must contain at least one origin")
        return v

    @field_validator("app_secret_key", "jwt_secret_key")
    @classmethod
    def warn_default_secrets(cls, v: str) -> str:
        if v == "change-me":
            import warnings
            warnings.warn("Using default secret key — change in production", stacklevel=2)
        return v

    def ai_providers_available(self) -> list[str]:
        providers = []
        if self.openai_api_key:
            providers.append("openai")
        if self.anthropic_api_key:
            providers.append("anthropic")
        if self.gemini_api_key:
            providers.append("gemini")
        return providers


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
