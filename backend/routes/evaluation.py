"""
Evaluation & Roadmap Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from agents.roadmap_generator import roadmap_generator_agent
from routes.resume import resume_store

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


class RoadmapRequest(BaseModel):
    resume_id: Optional[str] = None
    target_role: str = "Software Engineer"
    weak_areas: list[str] = []
    experience_level: str = "junior"


@router.post("/generate")
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a personalized 30-day roadmap.
    Optionally uses resume data if resume_id is provided.
    """
    skills = []
    resume_score = 60
    readiness = "medium"

    if request.resume_id and request.resume_id in resume_store:
        resume_data = resume_store[request.resume_id]
        resume_score = 65  # default if no analysis stored

    roadmap = roadmap_generator_agent.generate(
        target_role=request.target_role,
        experience_level=request.experience_level,
        skills=skills,
        weak_areas=request.weak_areas or ["Dynamic Programming", "System Design"],
        resume_score=resume_score,
        readiness=readiness,
    )

    return roadmap.model_dump()
