"""
Core configuration for the application
"""

import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str = (
        "postgresql://codeinterview:password@localhost:5432/codeinterview"
    )

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Session
    SESSION_EXPIRATION_HOURS: int = 24

    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "CodeInterview API"
    VERSION: str = "1.0.0"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
