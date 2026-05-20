"""
AI Interview Hacker - Main Entry Point
--------------------------------------
FastAPI application with MongoDB persistence, real AI interview analysis,
and per-user dynamic dashboard data.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from core.database import connect_db, close_db
from routes.resume import router as resume_router
from routes.interview import router as interview_router
from routes.evaluation import router as evaluation_router
from routes.users import router as users_router

# ─── Lifespan (startup / shutdown) ───────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB on startup, disconnect on shutdown."""
    await connect_db()
    yield
    await close_db()

# ─── App Initialization ───────────────────────────────────────────────────────

app = FastAPI(
    title="AI Interview Hacker API",
    description="AI-powered interview preparation platform — Gemini + MongoDB",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS Configuration ───────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global Exception Handlers ────────────────────────────────────────────────

@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"success": False, "message": "Validation Error", "detail": str(exc)},
    )

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(evaluation_router)
app.include_router(users_router)

# ─── Root & Health Endpoints ──────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "AI Interview Hacker API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
    }

@app.get("/health")
async def health():
    from core.database import is_db_connected
    return {
        "status": "ok",
        "gemini_key_configured": bool(settings.GEMINI_API_KEY),
        "database_connected": is_db_connected(),
    }

# ─── Server Run ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=getattr(settings, "APP_HOST", "0.0.0.0"),
        port=getattr(settings, "APP_PORT", 8000),
        reload=True,
    )
