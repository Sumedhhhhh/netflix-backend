from fastapi import FastAPI
from app.database import engine
from app.models import Base
from app.routes.auth_routes import router as auth_router
from app.routes.catalog_routes import router as catalog_router


app = FastAPI()

app.include_router(auth_router, prefix="/auth")
app.include_router(catalog_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def health():
    return { "status" : "running" }