"""
Batch Interview Agent
----------------------
New quota-efficient architecture:
  1. Generate ALL questions in ONE Gemini call at interview start
  2. Analyze ALL answers in ONE Gemini call at interview end

Total API calls per interview session: 2 (was 11+ before)
"""

import json
import re
from pydantic import BaseModel
from core.gemini_client import generate_response


# ─── Models ───────────────────────────────────────────────────────────────────

class BatchQuestion(BaseModel):
    question: str
    topic: str


class FinalReport(BaseModel):
    overall_score: int
    technical_score: int
    communication_score: int
    confidence_score: int
    grade: str                    # A / B / C / D / F
    hire_recommendation: str      # Strong Hire / Hire / No Hire / Strong No Hire
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    missing_concepts: list[str]
    improvement_suggestions: list[str]
    per_question_feedback: list[dict]  # [{question, score, feedback}]


# ─── Prompts ──────────────────────────────────────────────────────────────────

BATCH_QUESTIONS_PROMPT = """
Generate exactly 5 {interview_type} interview questions for a {role} candidate.
Difficulty: {difficulty}

Rules:
- Each question must be distinct and cover a different topic
- Questions should be progressively challenging
- For technical: cover DSA, System Design, Coding, Concepts
- For HR: cover Leadership, Teamwork, Conflict, Achievement, Motivation
- Keep each question concise (1-3 sentences max)

Return ONLY this JSON, no extra text:
{{
  "questions": [
    {{"question": "<question 1>", "topic": "<topic>"}},
    {{"question": "<question 2>", "topic": "<topic>"}},
    {{"question": "<question 3>", "topic": "<topic>"}},
    {{"question": "<question 4>", "topic": "<topic>"}},
    {{"question": "<question 5>", "topic": "<topic>"}}
  ]
}}
"""

BATCH_ANALYSIS_PROMPT = """
You are a senior interviewer. Analyze this complete interview session and provide a final report.

Role: {role}
Interview Type: {interview_type}

Interview Q&A:
{qa_pairs}

Evaluate the candidate holistically across all answers. Be specific and honest.

Return ONLY this JSON, no extra text:
{{
  "overall_score": <0-100>,
  "technical_score": <0-100>,
  "communication_score": <0-100>,
  "confidence_score": <0-100>,
  "grade": "<A|B|C|D|F>",
  "hire_recommendation": "<Strong Hire|Hire|No Hire|Strong No Hire>",
  "summary": "<2-3 sentence honest overall summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "missing_concepts": ["<concept 1>", "<concept 2>"],
  "improvement_suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "per_question_feedback": [
    {{"question": "<q1>", "score": <0-100>, "feedback": "<1 sentence>"}},
    {{"question": "<q2>", "score": <0-100>, "feedback": "<1 sentence>"}},
    {{"question": "<q3>", "score": <0-100>, "feedback": "<1 sentence>"}},
    {{"question": "<q4>", "score": <0-100>, "feedback": "<1 sentence>"}},
    {{"question": "<q5>", "score": <0-100>, "feedback": "<1 sentence>"}}
  ]
}}
"""

SYSTEM_PROMPT = """
You are an expert interviewer. Always respond with ONLY valid JSON. No markdown, no extra text.
Keep responses concise and structured.
"""


# ─── Agent ────────────────────────────────────────────────────────────────────

class BatchInterviewerAgent:
    """
    Quota-efficient interview agent.
    2 API calls per full interview session.
    """

    def generate_all_questions(
        self,
        interview_type: str,
        role: str,
        difficulty: str,
    ) -> list[BatchQuestion]:
        """
        API Call #1 — Generate all 5 questions at once.
        Returns list of BatchQuestion objects.
        """
        prompt = BATCH_QUESTIONS_PROMPT.format(
            interview_type=interview_type,
            role=role,
            difficulty=difficulty,
        )

        raw = generate_response(prompt, SYSTEM_PROMPT)
        data = self._parse_json(raw)

        questions = []
        for q in data.get("questions", []):
            questions.append(BatchQuestion(
                question=q.get("question", "Tell me about yourself."),
                topic=q.get("topic", "General"),
            ))

        # Fallback if Gemini returns fewer than 5
        fallbacks = self._fallback_questions(interview_type, role)
        while len(questions) < 5:
            questions.append(fallbacks[len(questions)])

        return questions[:5]

    def analyze_all_answers(
        self,
        role: str,
        interview_type: str,
        questions: list[BatchQuestion],
        answers: list[str],
    ) -> FinalReport:
        """
        API Call #2 — Analyze all Q&A pairs together in one call.
        Returns complete FinalReport.
        """
        # Build compact Q&A string to minimize tokens
        qa_lines = []
        for i, (q, a) in enumerate(zip(questions, answers)):
            answer_text = a.strip() if a.strip() else "[No answer provided]"
            # Truncate long answers to save tokens
            if len(answer_text) > 500:
                answer_text = answer_text[:500] + "..."
            qa_lines.append(
                f"Q{i+1} [{q.topic}]: {q.question}\n"
                f"A{i+1}: {answer_text}"
            )

        qa_pairs = "\n\n".join(qa_lines)

        prompt = BATCH_ANALYSIS_PROMPT.format(
            role=role,
            interview_type=interview_type,
            qa_pairs=qa_pairs,
        )

        raw = generate_response(prompt, SYSTEM_PROMPT)
        data = self._parse_json(raw)

        # Build per_question_feedback safely
        pqf = []
        raw_pqf = data.get("per_question_feedback", [])
        for i, q in enumerate(questions):
            if i < len(raw_pqf):
                pqf.append({
                    "question": q.question,
                    "score": int(raw_pqf[i].get("score", 50)),
                    "feedback": raw_pqf[i].get("feedback", ""),
                })
            else:
                pqf.append({"question": q.question, "score": 50, "feedback": ""})

        return FinalReport(
            overall_score=int(data.get("overall_score", 50)),
            technical_score=int(data.get("technical_score", 50)),
            communication_score=int(data.get("communication_score", 50)),
            confidence_score=int(data.get("confidence_score", 50)),
            grade=data.get("grade", "C"),
            hire_recommendation=data.get("hire_recommendation", "No Hire"),
            summary=data.get("summary", "Interview completed."),
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
            missing_concepts=data.get("missing_concepts", []),
            improvement_suggestions=data.get("improvement_suggestions", []),
            per_question_feedback=pqf,
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

    def _fallback_questions(self, interview_type: str, role: str) -> list[BatchQuestion]:
        """Hardcoded fallback questions if Gemini fails."""
        if interview_type == "technical":
            return [
                BatchQuestion(question="Explain the difference between a stack and a queue with real-world examples.", topic="DSA"),
                BatchQuestion(question="How would you design a URL shortener like bit.ly?", topic="System Design"),
                BatchQuestion(question="What is Big O notation and why does it matter?", topic="Concepts"),
                BatchQuestion(question="Explain the difference between SQL and NoSQL databases.", topic="Databases"),
                BatchQuestion(question="How do you approach debugging a production issue?", topic="Problem Solving"),
            ]
        else:
            return [
                BatchQuestion(question="Tell me about yourself and your background.", topic="Introduction"),
                BatchQuestion(question="Describe a time you worked under pressure to meet a deadline.", topic="Achievement"),
                BatchQuestion(question="Tell me about a conflict with a teammate and how you resolved it.", topic="Conflict"),
                BatchQuestion(question="Give an example of when you showed leadership.", topic="Leadership"),
                BatchQuestion(question="Where do you see yourself in 5 years?", topic="Motivation"),
            ]


batch_interviewer_agent = BatchInterviewerAgent()
