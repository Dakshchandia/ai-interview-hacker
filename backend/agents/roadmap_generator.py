"""
Roadmap Generator Agent
------------------------
Generates a personalized 30-day study roadmap based on
resume analysis results and interview performance.
"""

import json
import re
from pydantic import BaseModel
from core.gemini_client import generate_response


class RoadmapDay(BaseModel):
    day: int
    title: str
    topic: str
    description: str
    duration: str
    resources: list[str]
    task_type: str    # "study" | "practice" | "mock" | "review"


class PersonalizedRoadmap(BaseModel):
    target_role: str
    total_days: int
    weekly_hours: int
    focus_areas: list[str]
    week1_theme: str
    week2_theme: str
    week3_theme: str
    week4_theme: str
    days: list[RoadmapDay]
    motivational_message: str
    success_probability: int   # 0-100


ROADMAP_SYSTEM = """
You are a career coach and technical interview preparation expert.
You create personalized, realistic 30-day study roadmaps based on
a candidate's current skill level and target role.

Your roadmaps are:
- Specific and actionable (not vague)
- Realistic in time commitment
- Focused on highest-impact areas first
- Progressive in difficulty

Always respond with ONLY valid JSON. No markdown, no extra text.
"""

ROADMAP_PROMPT = """
Create a personalized 30-day interview preparation roadmap.

Candidate Profile:
- Target Role: {target_role}
- Experience Level: {experience_level}
- Current Skills: {skills}
- Weak Areas: {weak_areas}
- Resume Score: {resume_score}/100
- Interview Readiness: {readiness}

Generate a focused roadmap. Return EXACTLY this JSON:
{{
    "target_role": "{target_role}",
    "total_days": 30,
    "weekly_hours": <realistic hours per week 8-20>,
    "focus_areas": ["<area 1>", "<area 2>", "<area 3>", "<area 4>"],
    "week1_theme": "<Week 1 theme>",
    "week2_theme": "<Week 2 theme>",
    "week3_theme": "<Week 3 theme>",
    "week4_theme": "<Week 4 theme>",
    "days": [
        {{
            "day": 1,
            "title": "<specific task title>",
            "topic": "<topic>",
            "description": "<what to do today>",
            "duration": "<e.g. 2h>",
            "resources": ["<resource 1>"],
            "task_type": "<study|practice|mock|review>"
        }}
        // ... include days 1-14 only (keep response size manageable)
    ],
    "motivational_message": "<personalized motivational message>",
    "success_probability": <0-100 based on their profile>
}}
"""


class RoadmapGeneratorAgent:
    """Generates personalized 30-day interview preparation roadmaps."""

    def __init__(self):
        self.name = "roadmap_generator"

    def generate(
        self,
        target_role: str = "Software Engineer",
        experience_level: str = "junior",
        skills: list[str] = None,
        weak_areas: list[str] = None,
        resume_score: int = 60,
        readiness: str = "medium",
    ) -> PersonalizedRoadmap:

        prompt = ROADMAP_PROMPT.format(
            target_role=target_role,
            experience_level=experience_level,
            skills=", ".join(skills or ["Python", "JavaScript"]),
            weak_areas=", ".join(weak_areas or ["Dynamic Programming", "System Design"]),
            resume_score=resume_score,
            readiness=readiness,
        )

        raw = generate_response(prompt, ROADMAP_SYSTEM)
        data = self._parse_json(raw)

        days = []
        for d in data.get("days", []):
            try:
                days.append(RoadmapDay(
                    day=int(d.get("day", 1)),
                    title=d.get("title", "Study Session"),
                    topic=d.get("topic", "General"),
                    description=d.get("description", ""),
                    duration=d.get("duration", "2h"),
                    resources=d.get("resources", []),
                    task_type=d.get("task_type", "study"),
                ))
            except Exception:
                continue

        return PersonalizedRoadmap(
            target_role=data.get("target_role", target_role),
            total_days=30,
            weekly_hours=int(data.get("weekly_hours", 12)),
            focus_areas=data.get("focus_areas", weak_areas or []),
            week1_theme=data.get("week1_theme", "Foundation"),
            week2_theme=data.get("week2_theme", "Algorithms"),
            week3_theme=data.get("week3_theme", "System Design"),
            week4_theme=data.get("week4_theme", "Final Sprint"),
            days=days,
            motivational_message=data.get("motivational_message", "You've got this!"),
            success_probability=int(data.get("success_probability", 70)),
        )

    def _parse_json(self, raw: str) -> dict:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except Exception:
                    pass
            return {}


roadmap_generator_agent = RoadmapGeneratorAgent()
