import json

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    SUPABASE_URL: str = "http://127.0.0.1:54321"
    SUPABASE_SERVICE_KEY: str = "replace-me"

    ALLOWED_ORIGINS: str = (
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173"
    )
    ALLOWED_ORIGIN_REGEX: str | None = None

    APP_NAME: str = "Raithana Swarajya API"
    APP_VERSION: str = "1.0.0"

    @property
    def allowed_origins(self) -> list[str]:
        raw_origins = self.ALLOWED_ORIGINS.strip()
        if raw_origins.startswith("["):
            try:
                decoded = json.loads(raw_origins)
                if isinstance(decoded, list):
                    return [
                        str(origin).strip().rstrip("/")
                        for origin in decoded
                        if str(origin).strip()
                    ]
            except json.JSONDecodeError:
                pass

        return [
            origin.strip().rstrip("/")
            for origin in raw_origins.split(",")
            if origin.strip()
        ]


settings = Settings()
