import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "HERMES SENTINEL"
    VERSION: str = "2.0.0"
    ENV: str = Field(default="development", env="ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:postgres@host.docker.internal:5432/sentinel",
        env="DATABASE_URL"
    )
    
    # API & Decoy Ports
    API_PORT: int = Field(default=8000, env="API_PORT")
    API_HOST: str = Field(default="0.0.0.0", env="API_HOST")
    DASHBOARD_PORT: int = Field(default=3000, env="DASHBOARD_PORT")
    COWRIE_PORT: int = Field(default=2222, env="COWRIE_PORT")
    WEB_DECOY_PORT: int = Field(default=8088, env="WEB_DECOY_PORT")
    
    # Cline Runtime Configuration
    CLINE_EXECUTABLE: str = Field(default="/home/admin/.local/bin/cline", env="CLINE_EXECUTABLE")
    CLINE_PROVIDER: str = Field(default="openrouter", env="CLINE_PROVIDER")
    CLINE_MODEL: str = Field(default="google/gemini-3.8-flash", env="CLINE_MODEL")
    CLINE_TIMEOUT_SECONDS: int = Field(default=60, env="CLINE_TIMEOUT_SECONDS")
    CLINE_MAX_CONCURRENCY: int = Field(default=2, env="CLINE_MAX_CONCURRENCY")
    CLINE_MOCK_MODE: bool = Field(default=False, env="CLINE_MOCK_MODE")
    
    # Composio Configuration
    COMPOSIO_ENABLED: bool = Field(default=False, env="COMPOSIO_ENABLED")
    COMPOSIO_MOCK_MODE: bool = Field(default=True, env="COMPOSIO_MOCK_MODE")
    ALERT_EMAIL_RECIPIENT: str = Field(default="secops-alerts@example.com", env="ALERT_EMAIL_RECIPIENT")
    
    # Parallel.ai Configuration
    PARALLEL_ENABLED: bool = Field(default=False, env="PARALLEL_ENABLED")
    PARALLEL_MOCK_MODE: bool = Field(default=True, env="PARALLEL_MOCK_MODE")
    PARALLEL_API_KEY: str = Field(default="", env="PARALLEL_API_KEY")
    
    # Security & Guardrails
    ENABLE_REAL_EMAIL: bool = Field(default=False, env="ENABLE_REAL_EMAIL")
    ENABLE_TRAFFIC_DIVERSION: bool = Field(default=False, env="ENABLE_TRAFFIC_DIVERSION")
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
