from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import assessment
from db.database import engine, Base

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Readiness Decision Intelligence System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assessment.router, prefix="/api", tags=["assessment"])


@app.get("/")
def root():
    return {"message": "AI Readiness Decision Intelligence System API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}
