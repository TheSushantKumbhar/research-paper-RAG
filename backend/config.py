import os
from pydantic_settings import BaseSettings
from functools import lru_cache

# Resolve .env path relative to this file's directory
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")


class Settings(BaseSettings):
    DATABASE_URL: str
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "research-paper-rag"
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash"
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    class Config:
        env_file = _env_path
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
