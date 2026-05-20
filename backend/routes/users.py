"""
Users Routes
-------------
Provides per-user dashboard stats and interview history.
The user_id is the Clerk user ID passed from the frontend.

Endpoints:
  GET  /users/{user_id}/stats    — aggregated dashboard stats
  GET  /users/{user_id}/history  — paginated interview history
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from core.user_stats import get_user_stats
from core.database import get_database, is_db_connected

router = APIRouter(prefix="/users", tags=["Users"])


# ─── Response models ──────────────────────────────────────────────────────────

class UserStatsResponse(BaseModel):
    user_id: str
    total_interviews: int
    technical_interviews: int
    hr_interviews: int
    total_practice_minutes: int
    avg_overall_score: int
    avg_technical_score: int
    avg_communication_score: int
    avg_confidence_score: int
    avg_system_design_score: int
    readiness_percentage: int
    last_updated: str


class InterviewHistoryItem(BaseModel):
    session_id: str
    interview_type: str
    target_role: str
    difficulty: str
    overall_score: int
    technical_score: int
    communication_score: int
    confidence_score: int
    questions_answered: int
    duration_minutes: int
    hire_recommendation: str
    grade: str
    created_at: str
    top_strengths: list[str]
    critical_improvements: list[str]


class InterviewHistoryResponse(BaseModel):
    user_id: str
    total: int
    page: int
    page_size: int
    interviews: list[InterviewHistoryItem]


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/{user_id}/stats", response_model=UserStatsResponse)
async def get_stats(user_id: str):
    """
    Return aggregated dashboard stats for a user.
    New users get all-zero stats automatically.
    """
    stats = await get_user_stats(user_id)
    return UserStatsResponse(**stats)


@router.get("/{user_id}/history", response_model=InterviewHistoryResponse)
async def get_history(
    user_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
):
    """
    Return paginated interview history for a user.
    Returns empty list if no history or DB unavailable.
    """
    if not is_db_connected():
        return InterviewHistoryResponse(
            user_id=user_id,
            total=0,
            page=page,
            page_size=page_size,
            interviews=[],
        )

    db = get_database()
    skip = (page - 1) * page_size

    # Count total sessions for this user
    total = await db.interview_sessions.count_documents(
        {"user_id": user_id, "is_complete": True}
    )

    # Fetch paginated sessions, newest first
    cursor = db.interview_sessions.find(
        {"user_id": user_id, "is_complete": True},
        {"_id": 0},
    ).sort("created_at", -1).skip(skip).limit(page_size)

    sessions = await cursor.to_list(length=page_size)

    interviews = []
    for s in sessions:
        interviews.append(InterviewHistoryItem(
            session_id=s.get("session_id", ""),
            interview_type=s.get("interview_type", "technical"),
            target_role=s.get("target_role", "Software Engineer"),
            difficulty=s.get("difficulty", "Medium"),
            overall_score=s.get("final_overall_score", 0),
            technical_score=s.get("final_technical_score", 0),
            communication_score=s.get("final_communication_score", 0),
            confidence_score=s.get("final_confidence_score", 0),
            questions_answered=s.get("questions_answered", 0),
            duration_minutes=s.get("duration_minutes", 0),
            hire_recommendation=s.get("hire_recommendation", ""),
            grade=s.get("grade", ""),
            created_at=s.get("created_at", ""),
            top_strengths=s.get("top_strengths", []),
            critical_improvements=s.get("critical_improvements", []),
        ))

    return InterviewHistoryResponse(
        user_id=user_id,
        total=total,
        page=page,
        page_size=page_size,
        interviews=interviews,
    )


@router.get("/{user_id}/score-chart")
async def get_score_chart(user_id: str, limit: int = Query(default=10, ge=1, le=50)):
    """
    Return the last N completed sessions as chart data points.
    Used by the ScoreChart component on the dashboard.
    """
    if not is_db_connected():
        return {"user_id": user_id, "data": []}

    db = get_database()
    cursor = db.interview_sessions.find(
        {"user_id": user_id, "is_complete": True},
        {"_id": 0, "session_id": 1, "interview_type": 1,
         "final_technical_score": 1, "final_communication_score": 1,
         "final_overall_score": 1, "created_at": 1},
    ).sort("created_at", -1).limit(limit)

    sessions = await cursor.to_list(length=limit)
    sessions.reverse()  # chronological order for chart

    data = []
    for i, s in enumerate(sessions):
        data.append({
            "label": f"#{i + 1}",
            "technical": s.get("final_technical_score", 0),
            "hr": s.get("final_communication_score", 0),
            "overall": s.get("final_overall_score", 0),
            "type": s.get("interview_type", "technical"),
            "date": s.get("created_at", ""),
        })

    return {"user_id": user_id, "data": data}
