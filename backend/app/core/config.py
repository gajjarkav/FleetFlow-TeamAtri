from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from functools import lru_cache
from pydantic import Field


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        env_file_encoding="utf-8"
    )

    MANAGER_EMAIL: str = Field(..., description="manager email for auth")
    MANAGER_PASSWORD: str = Field(..., description="manager password for auth")

    DATABASE_URL: Optional[str] = Field(default="sqlite:///./fleetflow.db", description="database url")


@lru_cache()
def get_settings() -> Settings:
    return Settings()

