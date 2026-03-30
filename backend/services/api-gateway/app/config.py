import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES","60"))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://netflix:netflix@postgres:5432/netflix"
)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")