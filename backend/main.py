
"""
AI Interview Hacker - Main Entry Point
--------------------------------------
FastAPI application configuration with global error handling and 
router integration for SIH 2026.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from routes.resume import router as resume_router
from routes.interview import router as interview_router
from routes.evaluation import router as evaluation_router

# ─── App Initialization ───────────────────────────────────────────────────────

app = FastAPI(
    title="AI Interview Hacker API",
    description="AI-powered interview preparation platform — Google ADK + Gemini",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Configuration ───────────────────────────────────────────────────────
# Includes localhost and 127.0.0.1 for both 3000 and 3001 to ensure 
# your frontend can always reach the backend.

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://ai-interview-hacker.vercel.app",
        # Allow all Vercel preview URLs
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global Exception Handlers ────────────────────────────────────────────────
# This is the "Guardrail" logic. If your resume agent detects a non-resume 
# file, it will throw an error that this handler catches and sends 
# safely to your React frontend.

@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "message": "Validation Error",
            "detail": str(exc)
        },
    )

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(evaluation_router)

# ─── Root & Health Endpoints ──────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "AI Interview Hacker API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "resume_upload":   "POST /resume/upload",
            "resume_analyze":  "POST /resume/analyze",
            "interview_start": "POST /interview/start",
            "interview_respond":"POST /interview/respond",
            "interview_end":   "POST /interview/end",
            "roadmap_generate":"POST /roadmap/generate",
        }
    }

@app.get("/health")
async def health():
    # settings.GEMINI_API_KEY is pulled from your .env file
    return {
        "status": "ok", 
        "gemini_key_configured": bool(settings.GEMINI_API_KEY)
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