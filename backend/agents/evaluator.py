"""
Evaluation Agent
-----------------
Aggregates scores from all interview rounds and generates
a comprehensive final evaluation with actionable feedback.
"""

import json
import re
from pydantic import BaseModel
from core.gemini_client import generate_response


class FinalEvaluation(BaseModel):
    overall_score: int
    technical_score: int
    communication_score: int
    problem_solving_score: int
    confidence_score: int
    hire_recommendation: str     # "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire"
    grade: str                   # "A" | "B" | "C" | "D" | "F"
    summary: str
    top_strengths: list[str]
    critical_improvements: list[str]
    weak_topics: list[str]
    strong_topics: list[str]
    next_steps: list[str]


EVALUATOR_SYSTEM = """
You are a senior engineering manager conducting final interview evaluations.
You synthesize performance across multiple interview rounds into a fair,
comprehensive assessment. You are honest, specific, and constructive.

Always respond with ONLY valid JSON. No markdown, no extra text.
"""

FINAL_EVALUATION_PROMPT = """
Generate a final interview evaluation based on this performance data.

Candidate: {role} candidate
Interview Type: {interview_type}
Number of Questions: {num_questions}

Per-question scores: {question_scores}
Topics covered: {topics}
Average technical score: {avg_technical}
Average communication score: {avg_communication}

Return EXACTLY this JSON:
{{
    "overall_score": <0-100>,
    "technical_score": <0-100>,
    "communication_score": <0-100>,
    "problem_solving_score": <0-100>,
    "confidence_score": <0-100>,
    "hire_recommendation": "<Strong Hire|Hire|No Hire|Strong No Hire>",
    "grade": "<A|B|C|D|F>",
    "summary": "<3-4 sentence honest summary of performance>",
    "top_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "critical_improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
    "weak_topics": ["<topic 1>", "<topic 2>"],
    "strong_topics": ["<topic 1>", "<topic 2>"],
    "next_steps": ["<action 1>", "<action 2>", "<action 3>"]
}}
"""


class EvaluatorAgent:
    """Generates comprehensive final interview evaluations."""

    def __init__(self):
        self.name = "evaluator"

    def evaluate_session(
        self,
        role: str,
        interview_type: str,
        question_scores: list[dict],   # [{"question": "...", "score": 75, "topic": "DSA"}]
    ) -> FinalEvaluation:

        if not question_scores:
            return self._default_evaluation()

        avg_technical = sum(q.get("score", 50) for q in question_scores) // len(question_scores)
        avg_comm = sum(q.get("communication", 50) for q in question_scores) // len(question_scores)
        topics = list({q.get("topic", "General") for q in question_scores})

        prompt = FINAL_EVALUATION_PROMPT.format(
            role=role,
            interview_type=interview_type,
            num_questions=len(question_scores),
            question_scores=json.dumps(question_scores[:10]),
            topics=", ".join(topics),
            avg_technical=avg_technical,
            avg_communication=avg_comm,
        )

        raw = generate_response(prompt, EVALUATOR_SYSTEM)
        data = self._parse_json(raw)

        return FinalEvaluation(
            overall_score=int(data.get("overall_score", avg_technical)),
            technical_score=int(data.get("technical_score", avg_technical)),
            communication_score=int(data.get("communication_score", avg_comm)),
            problem_solving_score=int(data.get("problem_solving_score", avg_technical)),
            confidence_score=int(data.get("confidence_score", 60)),
            hire_recommendation=data.get("hire_recommendation", "Hire"),
            grade=data.get("grade", "B"),
            summary=data.get("summary", "Solid performance overall."),
            top_strengths=data.get("top_strengths", []),
            critical_improvements=data.get("critical_improvements", []),
            weak_topics=data.get("weak_topics", []),
            strong_topics=data.get("strong_topics", []),
            next_steps=data.get("next_steps", []),
        )

    def _default_evaluation(self) -> FinalEvaluation:
        return FinalEvaluation(
            overall_score=50, technical_score=50, communication_score=50,
            problem_solving_score=50, confidence_score=50,
            hire_recommendation="No Hire", grade="C",
            summary="Insufficient data to evaluate.",
            top_strengths=[], critical_improvements=["Complete the interview"],
            weak_topics=[], strong_topics=[], next_steps=["Practice more"],
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


evaluator_agent = EvaluatorAgent()
