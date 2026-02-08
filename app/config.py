from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # 앱 기본 설정
    app_name: str = "AI Trend Tracker"
    app_version: str = "0.1.0"
    app_env: str = "development"
    debug: bool = True

    # 데이터베이스 설정
    database_url: str

    # Redis 설정
    redis_url: str

    # API 키
    openai_api_key: str = ""
    huggingface_api_key: str = ""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    youtube_api_key: str = ""
    github_token: str = ""
    error_webhook_slack: str = ""
    error_webhook_discord: str = ""

    # 스케줄링 설정
    scheduler_interval_hours: int = 12

    # 보안 설정
    app_password: str = "test1234"
    admin_password: str = "admin1234"
    jwt_secret_key: str = "ai-trend-tracker-secret-key-2026"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """설정 싱글톤 인스턴스 반환"""
    return Settings()
