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

    # CORS - Support multiple origins for development and production
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://codeinterview.onrender.com",
        "https://codeinterview-frontend.onrender.com"
    ]
    
    # Frontend URL (for production)
    FRONTEND_URL: str = "http://localhost:3000"

    # Session
    SESSION_EXPIRATION_HOURS: int = 24

    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "CodeInterview API"
    VERSION: str = "1.0.0"
    
    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
