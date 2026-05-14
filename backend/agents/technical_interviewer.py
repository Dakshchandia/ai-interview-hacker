"""
Technical Interview Agent
--------------------------
Conducts adaptive technical interviews covering DSA, system design,
and coding questions. Adjusts difficulty based on answer quality.
"""

import json
import re
from typing import Optional
from pydantic import BaseModel

from backend.core.gemini_client import generate_response


# ─── Output schemas ───────────────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    question: str
    topic: str           # "DSA" | "System Design" | "Coding" | "Concepts"
    difficulty: str      # "Easy" | "Medium" | "Hard"
    hints: list[str]
    expected_points: list[str]   # what a good answer should cover


class QuestionEvaluation(BaseModel):
    score: int                   # 0-100
    technical_accuracy: int      # 0-100
    completeness: int            # 0-100
    communication: int           # 0-100
    strengths: list[str]
    improvements: list[str]
    follow_up: str               # next question based on this answer
    difficulty_adjustment: str   # "increase" | "decrease" | "maintain"


# ─── System prompts ───────────────────────────────────────────────────────────

TECHNICAL_INTERVIEWER_SYSTEM = """
You are a senior technical interviewer at a top tech company (Google/Amazon/Microsoft level).
You conduct rigorous but fair technical interviews covering:
- Data Structures & Algorithms (arrays, trees, graphs, DP, etc.)
- System Design (scalability, databases, APIs, microservices)
- Coding concepts (OOP, design patterns, complexity analysis)
- Problem-solving approach and communication

Your style:
- Ask one clear question at a time
- Probe deeper with follow-ups based on the candidate's answer
- Adjust difficulty based on performance
- Be encouraging but honest in evaluation

Always respond with ONLY valid JSON. No markdown, no extra text.
"""

GENERATE_QUESTION_PROMPT = """
Generate a technical interview question for a {role} candidate.

Context:
- Interview round: {round_num} of 5
- Previous topics covered: {covered_topics}
- Current difficulty level: {difficulty}
- Candidate's resume skills: {skills}

Return EXACTLY this JSON:
{{
    "question": "<the interview question>",
    "topic": "<DSA|System Design|Coding|Concepts>",
    "difficulty": "<Easy|Medium|Hard>",
    "hints": ["<hint 1>", "<hint 2>"],
    "expected_points": ["<point 1>", "<point 2>", "<point 3>"]
}}
"""

EVALUATE_ANSWER_PROMPT = """
Evaluate this technical interview answer.

Question: {question}
Topic: {topic}
Candidate's Answer: {answer}
Expected Points: {expected_points}

Return EXACTLY this JSON:
{{
    "score": <0-100>,
    "technical_accuracy": <0-100>,
    "completeness": <0-100>,
    "communication": <0-100>,
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"],
    "follow_up": "<follow-up question based on their answer>",
    "difficulty_adjustment": "<increase|decrease|maintain>"
}}
"""


# ─── Agent ────────────────────────────────────────────────────────────────────

class TechnicalInterviewerAgent:
    """
    Conducts adaptive technical interviews.
    Generates questions and evaluates answers using Gemini.
    """

    def __init__(self):
        self.name = "technical_interviewer"

    def generate_question(
        self,
        role: str = "Software Engineer",
        round_num: int = 1,
        covered_topics: list[str] = None,
        difficulty: str = "Medium",
        skills: list[str] = None,
    ) -> InterviewQuestion:

        prompt = GENERATE_QUESTION_PROMPT.format(
            role=role,
            round_num=round_num,
            covered_topics=", ".join(covered_topics or []) or "None yet",
            difficulty=difficulty,
            skills=", ".join(skills or ["Python", "Data Structures", "Algorithms"]),
        )

        raw = generate_response(prompt, TECHNICAL_INTERVIEWER_SYSTEM)
        data = self._parse_json(raw)

        return InterviewQuestion(
            question=data.get("question", "Explain the difference between a stack and a queue."),
            topic=data.get("topic", "DSA"),
            difficulty=data.get("difficulty", difficulty),
            hints=data.get("hints", []),
            expected_points=data.get("expected_points", []),
        )

    def evaluate_answer(
        self,
        question: str,
        topic: str,
        answer: str,
        expected_points: list[str] = None,
    ) -> QuestionEvaluation:

        if not answer or len(answer.strip()) < 10:
            return QuestionEvaluation(
                score=0, technical_accuracy=0, completeness=0, communication=0,
                strengths=[], improvements=["Please provide a detailed answer"],
                follow_up="Can you elaborate on your approach?",
                difficulty_adjustment="decrease",
            )

        prompt = EVALUATE_ANSWER_PROMPT.format(
            question=question,
            topic=topic,
            answer=answer[:2000],
            expected_points=", ".join(expected_points or []),
        )

        raw = generate_response(prompt, TECHNICAL_INTERVIEWER_SYSTEM)
        data = self._parse_json(raw)

        return QuestionEvaluation(
            score=int(data.get("score", 50)),
            technical_accuracy=int(data.get("technical_accuracy", 50)),
            completeness=int(data.get("completeness", 50)),
            communication=int(data.get("communication", 50)),
            strengths=data.get("strengths", []),
            improvements=data.get("improvements", []),
            follow_up=data.get("follow_up", "Can you explain further?"),
            difficulty_adjustment=data.get("difficulty_adjustment", "maintain"),
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


technical_interviewer_agent = TechnicalInterviewerAgent()
