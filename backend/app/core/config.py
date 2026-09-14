from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Grocify API"
    api_v1_prefix: str = "/api/v1"
    postgres_server: str = "db"
    postgres_port: int = 5432
    postgres_user: str = "grocify"
    postgres_password: str = "grocify"
    postgres_db: str = "grocify"
    database_url: str | None = None
    redis_url: str = "redis://redis:6379/0"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origins: list[str] = ["http://127.0.0.1:8002", "http://localhost:8002", "http://127.0.0.1:5173"]
    openai_api_key: str | None = None
    openai_model: str = "gpt-6-astra"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def sqlalchemy_database_uri(self) -> str:
        if self.database_url:
            return self.database_url
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_server}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
