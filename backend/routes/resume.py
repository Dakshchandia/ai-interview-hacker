import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.parsers.resume_parser import resume_parser
from backend.agents.resume_analyzer import resume_analyzer_agent, ResumeAnalysis
from backend.core.config import settings

router = APIRouter(prefix="/resume", tags=["Resume"])

# In-memory store — keyed by resume_id
resume_store: dict[str, dict] = {}


# ─── Response models ──────────────────────────────────────────────────────────

class ResumeUploadResponse(BaseModel):
    resume_id: str
    filename: str
    file_type: str
    word_count: int
    char_count: int
    preview: str
    success: bool
    message: str

class ResumeTextResponse(BaseModel):
    resume_id: str
    filename: str
    text: str
    word_count: int

class AnalyzeRequest(BaseModel):
    resume_id: str
    target_role: Optional[str] = "Software Engineer"


# ─── Routes — ORDER MATTERS: specific routes before /{resume_id} ──────────────

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Upload a resume file (PDF, DOCX, or TXT). Returns a resume_id."""

    file_bytes = await file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)

    if file_size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size is {settings.MAX_FILE_SIZE_MB}MB."
        )

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    parsed = resume_parser.parse(file_bytes, file.filename)

    if not parsed["success"]:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse resume: {parsed['error']}"
        )

    resume_id = str(uuid.uuid4())
    resume_store[resume_id] = {
        "resume_id": resume_id,
        "filename": parsed["filename"],
        "file_type": parsed["file_type"],
        "text": parsed["text"],
        "word_count": parsed["word_count"],
        "char_count": parsed["char_count"],
    }

    return ResumeUploadResponse(
        resume_id=resume_id,
        filename=parsed["filename"],
        file_type=parsed["file_type"],
        word_count=parsed["word_count"],
        char_count=parsed["char_count"],
        preview=parsed["text"][:300] + "..." if len(parsed["text"]) > 300 else parsed["text"],
        success=True,
        message="Resume uploaded and parsed successfully."
    )


# NOTE: /analyze must be declared BEFORE /{resume_id} to avoid route conflict
@router.post("/analyze", response_model=ResumeAnalysis)
async def analyze_resume(request: AnalyzeRequest):
    """
    Run the AI Resume Analyzer on an uploaded resume.
    Requires a resume_id from /resume/upload.
    """
    if request.resume_id not in resume_store:
        raise HTTPException(
            status_code=404,
            detail=f"Resume '{request.resume_id}' not found. Please upload first."
        )

    resume_data = resume_store[request.resume_id]

    try:
        analysis = resume_analyzer_agent.analyze(
            resume_text=resume_data["text"],
            target_role=request.target_role or "Software Engineer"
        )
        return analysis

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/list")
async def list_resumes():
    """List all uploaded resumes in the current session."""
    return {
        "count": len(resume_store),
        "resumes": [
            {
                "resume_id": v["resume_id"],
                "filename": v["filename"],
                "word_count": v["word_count"]
            }
            for v in resume_store.values()
        ]
    }


# NOTE: This wildcard route must be LAST
@router.get("/{resume_id}", response_model=ResumeTextResponse)
async def get_resume(resume_id: str):
    """Retrieve the full parsed text of a previously uploaded resume."""
    if resume_id not in resume_store:
        raise HTTPException(
            status_code=404,
            detail=f"Resume '{resume_id}' not found. Please upload again."
        )
    data = resume_store[resume_id]
    return ResumeTextResponse(
        resume_id=resume_id,
        filename=data["filename"],
        text=data["text"],
        word_count=data["word_count"]
    )
