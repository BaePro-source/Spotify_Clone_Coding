from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080
    audio_upload_dir: str = "uploads/audio"
    jamendo_client_id: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
