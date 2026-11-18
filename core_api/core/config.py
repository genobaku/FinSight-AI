"""
FinSight AI Core API Configuration
Loads settings strictly from environment variables or .env file with secure defaults.
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class CoreSettings(BaseSettings):
    # API Metadata
    PROJECT_NAME: str = "Finsight AI Core API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/v1"
    DEBUG: bool = False

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security & Authentication
    # In production, set FINSIGHT_API_KEYS as comma-separated valid keys
    API_KEYS: str = Field(
        default=os.getenv("FINSIGHT_API_KEYS", "finsight-dev-key"),
        description="Comma-separated authorized API keys for client and demo services"
    )
    JWT_SECRET: str = Field(
        default=os.getenv("JWT_SECRET", "finsight-dev-jwt-signing-secret"),
        description="Secret key for signing internal document claims"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Storage & Upload Constraints
    MAX_FILE_SIZE_BYTES: int = 20 * 1024 * 1024  # 20 MB ceiling
    ALLOWED_EXTENSIONS: List[str] = [
        ".pdf", ".png", ".jpg", ".jpeg", ".webp",
        ".docx", ".csv", ".tsv", ".xlsx", ".xls",
        ".txt", ".json", ".sql"
    ]
    STORAGE_DIR: str = Field(
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "storage_vault"),
        description="Local private vault directory for raw documents and job artifacts"
    )

    # Database Configuration (PostgreSQL / SQLite fallback for seamless hybrid testing)
    DATABASE_URL: str = Field(
        default=os.getenv("DATABASE_URL", "sqlite:///./finsight_core.db"),
        description="PostgreSQL or SQLite connection string"
    )

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://finsight-demo.internal"
    ]

    # Models & Processor Settings
    MODEL_PATH: str = Field(
        default=os.getenv("MODEL_PATH", "models/production/transaction_classifier.joblib"),
        description="Relative or absolute path to transaction classifier"
    )
    VECTORIZER_PATH: str = Field(
        default=os.getenv("VECTORIZER_PATH", "models/production/tfidf_vectorizer.joblib"),
        description="Relative or absolute path to TF-IDF vectorizer"
    )

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 120

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = CoreSettings()
