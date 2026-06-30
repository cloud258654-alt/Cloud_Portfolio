from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Reputation Risk Detection Platform"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./social_listening.db"

    PTT_ENABLED: bool = True
    DCARD_ENABLED: bool = True
    GOOGLE_SEARCH_ENABLED: bool = True
    MOCK_CRAWLER_DELAY: float = 0.5

    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GOOGLE_CSE_ID: str = ""
    DEMO_MODE: bool = True
    JWT_SECRET: str = "demo_secret_change_in_production"

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
