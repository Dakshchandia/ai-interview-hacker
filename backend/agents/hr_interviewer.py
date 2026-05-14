"""
HR Interview Agent
-------------------
Conducts behavioral interviews using the STAR method framework.
Evaluates communication, cultural fit, and leadership qualities.
"""

import json
import re
from pydantic import BaseModel
from backend.core.gemini_client import generate_response


class HRQuestion(BaseModel):
    question: str
    category: str        # "Leadership" | "Teamwork" | "Conflict" | "Achievement" | "Motivation"
    star_guidance: str   # hint about what STAR elements to include
    what_we_look_for: list[str]


class HRAnswerEvaluation(BaseModel):
    score: int
    communication_score: int
    star_structure_score: int    # did they use Situation/Task/Action/Result?
    relevance_score: int
    confidence_score: int
    strengths: list[str]
    improvements: list[str]
    follow_up: str
    red_flags: list[str]         # things that might concern a real interviewer


HR_SYSTEM_PROMPT = """
You are an experienced HR interviewer and talent acquisition specialist at a top tech company.
You conduct behavioral interviews to assess:
- Communication skills and clarity
- Leadership and ownership
- Teamwork and collaboration
- Problem-solving under pressure
- Cultural fit and values alignment
- Growth mindset

You use the STAR method (Situation, Task, Action, Result) to evaluate answers.
You are professional, empathetic, and thorough.

Always respond with ONLY valid JSON. No markdown, no extra text.
"""

GENERATE_HR_QUESTION_PROMPT = """
Generate a behavioral interview question for a {role} candidate.

Round: {round_num} of 5
Previously covered categories: {covered_categories}
Company culture focus: {culture_focus}

Return EXACTLY this JSON:
{{
    "question": "<behavioral question starting with 'Tell me about a time...' or 'Describe a situation...' or 'Give me an example...'>",
    "category": "<Leadership|Teamwork|Conflict|Achievement|Motivation>",
    "star_guidance": "<brief hint about what STAR elements to include>",
    "what_we_look_for": ["<quality 1>", "<quality 2>", "<quality 3>"]
}}
"""

EVALUATE_HR_ANSWER_PROMPT = """
Evaluate this behavioral interview answer using the STAR method.

Question: {question}
Category: {category}
Candidate's Answer: {answer}

Assess:
1. Did they use STAR structure? (Situation, Task, Action, Result)
2. Was the example relevant and specific?
3. Did they show ownership and impact?
4. Was communication clear and confident?

Return EXACTLY this JSON:
{{
    "score": <0-100>,
    "communication_score": <0-100>,
    "star_structure_score": <0-100>,
    "relevance_score": <0-100>,
    "confidence_score": <0-100>,
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"],
    "follow_up": "<follow-up question to dig deeper>",
    "red_flags": ["<concern if any, or empty list>"]
}}
"""


class HRInterviewerAgent:
    """Conducts behavioral HR interviews with STAR method evaluation."""

    def __init__(self):
        self.name = "hr_interviewer"

    def generate_question(
        self,
        role: str = "Software Engineer",
        round_num: int = 1,
        covered_categories: list[str] = None,
        culture_focus: str = "innovation, ownership, collaboration",
    ) -> HRQuestion:

        prompt = GENERATE_HR_QUESTION_PROMPT.format(
            role=role,
            round_num=round_num,
            covered_categories=", ".join(covered_categories or []) or "None yet",
            culture_focus=culture_focus,
        )

        raw = generate_response(prompt, HR_SYSTEM_PROMPT)
        data = self._parse_json(raw)

        return HRQuestion(
            question=data.get("question", "Tell me about a time you faced a challenging deadline."),
            category=data.get("category", "Achievement"),
            star_guidance=data.get("star_guidance", "Use the STAR method"),
            what_we_look_for=data.get("what_we_look_for", []),
        )

    def evaluate_answer(
        self,
        question: str,
        category: str,
        answer: str,
    ) -> HRAnswerEvaluation:

        if not answer or len(answer.strip()) < 10:
            return HRAnswerEvaluation(
                score=0, communication_score=0, star_structure_score=0,
                relevance_score=0, confidence_score=0,
                strengths=[], improvements=["Please provide a detailed answer using the STAR method"],
                follow_up="Can you give a specific example?",
                red_flags=["No answer provided"],
            )

        prompt = EVALUATE_HR_ANSWER_PROMPT.format(
            question=question,
            category=category,
            answer=answer[:2000],
        )

        raw = generate_response(prompt, HR_SYSTEM_PROMPT)
        data = self._parse_json(raw)

        return HRAnswerEvaluation(
            score=int(data.get("score", 50)),
            communication_score=int(data.get("communication_score", 50)),
            star_structure_score=int(data.get("star_structure_score", 50)),
            relevance_score=int(data.get("relevance_score", 50)),
            confidence_score=int(data.get("confidence_score", 50)),
            strengths=data.get("strengths", []),
            improvements=data.get("improvements", []),
            follow_up=data.get("follow_up", "Can you elaborate?"),
            red_flags=data.get("red_flags", []),
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


hr_interviewer_agent = HRInterviewerAgent()
