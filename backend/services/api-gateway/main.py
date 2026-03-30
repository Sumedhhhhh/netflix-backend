from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routes.auth_routes import router as auth_router
from app.routes.catalog_routes import router as catalog_router
from app.routes.upload_routes import router as upload_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(catalog_router)
app.include_router(upload_router, prefix="/upload")

Base.metadata.create_all(bind=engine)

@app.get("/")
def health():
    return { "status" : "running" }