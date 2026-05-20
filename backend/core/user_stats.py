"""
User Stats Service
------------------
Handles reading and updating per-user aggregated statistics.
Stats are stored in the `user_stats` collection and updated
every time an interview session is completed.

Stats document schema:
{
    "user_id": "clerk_user_id",
    "total_interviews": 12,
    "technical_interviews": 7,
    "hr_interviews": 5,
    "total_practice_minutes": 360,
    "avg_overall_score": 74,
    "avg_technical_score": 78,
    "avg_communication_score": 71,
    "avg_confidence_score": 68,
    "avg_system_design_score": 65,
    "readiness_percentage": 72,
    "last_updated": "2024-01-01T00:00:00Z"
}
"""

from datetime import datetime, timezone
from typing import Optional
from core.database import get_database, is_db_connected


# ─── Default empty stats for new users ───────────────────────────────────────

def empty_stats(user_id: str) -> dict:
    """Return zeroed-out stats for a brand-new user."""
    return {
        "user_id": user_id,
        "total_interviews": 0,
        "technical_interviews": 0,
        "hr_interviews": 0,
        "total_practice_minutes": 0,
        "avg_overall_score": 0,
        "avg_technical_score": 0,
        "avg_communication_score": 0,
        "avg_confidence_score": 0,
        "avg_system_design_score": 0,
        "readiness_percentage": 0,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


# ─── Read stats ───────────────────────────────────────────────────────────────

async def get_user_stats(user_id: str) -> dict:
    """
    Fetch aggregated stats for a user.
    Returns empty stats if user has no history or DB is unavailable.
    """
    if not is_db_connected():
        return empty_stats(user_id)

    db = get_database()
    doc = await db.user_stats.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        return empty_stats(user_id)
    return doc


# ─── Update stats after a completed session ──────────────────────────────────

async def update_user_stats_after_session(
    user_id: str,
    interview_type: str,          # "technical" | "hr"
    duration_minutes: int,
    overall_score: int,
    technical_score: int,
    communication_score: int,
    confidence_score: int,
    system_design_score: int = 0,
) -> None:
    """
    Recalculate and upsert user stats after a completed interview session.
    Uses a running average approach — fetches current stats, updates them.
    """
    if not is_db_connected():
        return  # Graceful degradation — no DB, no stats update

    db = get_database()
    current = await get_user_stats(user_id)

    n = current["total_interviews"]  # number of sessions BEFORE this one

    def running_avg(old_avg: float, new_val: int, count: int) -> int:
        """Compute new running average given old average, new value, and old count."""
        if count == 0:
            return new_val
        return round((old_avg * count + new_val) / (count + 1))

    new_total = n + 1
    new_tech_count = current["technical_interviews"] + (1 if interview_type == "technical" else 0)
    new_hr_count = current["hr_interviews"] + (1 if interview_type == "hr" else 0)
    new_minutes = current["total_practice_minutes"] + duration_minutes

    new_overall = running_avg(current["avg_overall_score"], overall_score, n)
    new_technical = running_avg(current["avg_technical_score"], technical_score, n)
    new_communication = running_avg(current["avg_communication_score"], communication_score, n)
    new_confidence = running_avg(current["avg_confidence_score"], confidence_score, n)
    new_system_design = running_avg(current["avg_system_design_score"], system_design_score, n)

    # Readiness = weighted composite of all skill scores
    new_readiness = round(
        new_technical * 0.35 +
        new_communication * 0.25 +
        new_confidence * 0.20 +
        new_system_design * 0.20
    )

    updated_doc = {
        "user_id": user_id,
        "total_interviews": new_total,
        "technical_interviews": new_tech_count,
        "hr_interviews": new_hr_count,
        "total_practice_minutes": new_minutes,
        "avg_overall_score": new_overall,
        "avg_technical_score": new_technical,
        "avg_communication_score": new_communication,
        "avg_confidence_score": new_confidence,
        "avg_system_design_score": new_system_design,
        "readiness_percentage": new_readiness,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }

    await db.user_stats.update_one(
        {"user_id": user_id},
        {"$set": updated_doc},
        upsert=True,
    )
