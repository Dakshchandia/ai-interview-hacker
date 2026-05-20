"""
Interview Routes — Quota-Efficient Architecture
-------------------------------------------------
New flow (2 API calls per session):

  POST /interview/start
    → Gemini Call #1: generates ALL 5 questions at once
    → Returns all questions to frontend immediately
    → Frontend stores them locally, shows one at a time
    → NO more per-answer API calls

  POST /interview/analyze
    → Gemini Call #2: analyzes ALL Q&A pairs together
    → Returns complete final report with all scores + feedback
    → Called ONCE when user clicks "End Interview"

Total Gemini calls: 2 per session (was 11+ before)
No MongoDB required — sessions are in-memory only.
"""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from agents.batch_interviewer import batch_interviewer_agent, BatchQuestion
from core.database import is_db_connected, get_database
from core.user_stats import update_user_stats_after_session

router = APIRouter(prefix="/interview", tags=["Interview"])

# ─── In-memory session store ──────────────────────────────────────────────────
# Lightweight — only stores questions list, no per-answer data
interview_sessions: dict[str, dict] = {}


# ─── Request / Response models ────────────────────────────────────────────────

class StartInterviewRequest(BaseModel):
    user_id: Optional[str] = None
    interview_type: str = "technical"       # "technical" | "hr"
    target_role: str = "Software Engineer"
    difficulty: str = "Medium"              # "Easy" | "Medium" | "Hard"


class QuestionItem(BaseModel):
    question: str
    topic: str


class StartInterviewResponse(BaseModel):
    session_id: str
    interview_type: str
    target_role: str
    difficulty: str
    questions: list[QuestionItem]           # ALL 5 questions returned upfront
    total_questions: int
    message: str


class AnalyzeRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    answers: list[str]                      # All 5 answers from frontend


class AnalyzeResponse(BaseModel):
    session_id: str
    overall_score: int
    technical_score: int
    communication_score: int
    confidence_score: int
    grade: str
    hire_recommendation: str
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    missing_concepts: list[str]
    improvement_suggestions: list[str]
    per_question_feedback: list[dict]


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/start", response_model=StartInterviewResponse)
async def start_interview(request: StartInterviewRequest):
    """
    Start a new interview session.
    Makes ONE Gemini call to generate all 5 questions upfront.
    Returns all questions to the frontend — no more per-question API calls.
    """
    session_id = str(uuid.uuid4())

    # ── Gemini Call #1: Generate all questions at once ────────────────────────
    questions = batch_interviewer_agent.generate_all_questions(
        interview_type=request.interview_type,
        role=request.target_role,
        difficulty=request.difficulty,
    )

    # Store session in memory (lightweight — just questions + metadata)
    interview_sessions[session_id] = {
        "session_id": session_id,
        "user_id": request.user_id,
        "interview_type": request.interview_type,
        "target_role": request.target_role,
        "difficulty": request.difficulty,
        "questions": [{"question": q.question, "topic": q.topic} for q in questions],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "started_at_ts": datetime.now(timezone.utc).timestamp(),
    }

    return StartInterviewResponse(
        session_id=session_id,
        interview_type=request.interview_type,
        target_role=request.target_role,
        difficulty=request.difficulty,
        questions=[QuestionItem(question=q.question, topic=q.topic) for q in questions],
        total_questions=5,
        message="Interview ready! All questions loaded.",
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_interview(request: AnalyzeRequest):
    """
    Analyze the complete interview in ONE Gemini call.
    Called once when user clicks 'End Interview'.
    Receives all answers from frontend, returns full report.
    """
    session = interview_sessions.get(request.session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please start a new interview."
        )

    if not request.answers:
        raise HTTPException(status_code=400, detail="No answers provided.")

    questions = [
        BatchQuestion(question=q["question"], topic=q["topic"])
        for q in session["questions"]
    ]

    # Pad answers if user ended early (fewer answers than questions)
    answers = list(request.answers)
    while len(answers) < len(questions):
        answers.append("")

    # ── Gemini Call #2: Analyze all Q&A pairs together ────────────────────────
    report = batch_interviewer_agent.analyze_all_answers(
        role=session["target_role"],
        interview_type=session["interview_type"],
        questions=questions,
        answers=answers,
    )

    # Calculate duration
    started_ts = session.get("started_at_ts", datetime.now(timezone.utc).timestamp())
    duration_minutes = max(1, round((datetime.now(timezone.utc).timestamp() - started_ts) / 60))

    # Persist to MongoDB if available (optional — graceful degradation)
    if is_db_connected():
        try:
            db = get_database()
            await db.interview_sessions.update_one(
                {"session_id": request.session_id},
                {"$set": {
                    **session,
                    "answers": answers,
                    "is_complete": True,
                    "final_overall_score": report.overall_score,
                    "final_technical_score": report.technical_score,
                    "final_communication_score": report.communication_score,
                    "final_confidence_score": report.confidence_score,
                    "hire_recommendation": report.hire_recommendation,
                    "grade": report.grade,
                    "summary": report.summary,
                    "top_strengths": report.strengths,
                    "critical_improvements": report.weaknesses,
                    "questions_answered": len([a for a in answers if a.strip()]),
                    "duration_minutes": duration_minutes,
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                }},
                upsert=True,
            )
        except Exception:
            pass  # DB write failure is non-fatal

    # Update user stats if user_id provided
    user_id = request.user_id or session.get("user_id", "")
    if user_id:
        try:
            await update_user_stats_after_session(
                user_id=user_id,
                interview_type=session["interview_type"],
                duration_minutes=duration_minutes,
                overall_score=report.overall_score,
                technical_score=report.technical_score,
                communication_score=report.communication_score,
                confidence_score=report.confidence_score,
                system_design_score=report.technical_score,
            )
        except Exception:
            pass  # Stats update failure is non-fatal

    # Clean up memory
    interview_sessions.pop(request.session_id, None)

    return AnalyzeResponse(
        session_id=request.session_id,
        overall_score=report.overall_score,
        technical_score=report.technical_score,
        communication_score=report.communication_score,
        confidence_score=report.confidence_score,
        grade=report.grade,
        hire_recommendation=report.hire_recommendation,
        summary=report.summary,
        strengths=report.strengths,
        weaknesses=report.weaknesses,
        missing_concepts=report.missing_concepts,
        improvement_suggestions=report.improvement_suggestions,
        per_question_feedback=report.per_question_feedback,
    )


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get current session state (debug endpoint)."""
    session = interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {
        "session_id": session_id,
        "interview_type": session["interview_type"],
        "target_role": session["target_role"],
        "total_questions": len(session["questions"]),
    }
