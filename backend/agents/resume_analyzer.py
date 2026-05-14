"""
Resume Analyzer Agent
---------------------
Uses Gemini to analyze a parsed resume and return structured feedback.
Includes a validation layer to reject non-resume documents.
"""

import json
import re
from pydantic import BaseModel
from backend.core.gemini_client import generate_response

# ------------------------------------------------------------------
# Output schema — defines exactly what the agent returns
# ------------------------------------------------------------------

class ResumeSection(BaseModel):
    score: int                     # 0-100
    feedback: str
    suggestions: list[str]

class ResumeAnalysis(BaseModel):
    is_valid_resume: bool          # Flag to catch non-resume documents
    error_message: str = None      # Explanation if is_valid_resume is false
    overall_score: int             # 0-100
    ats_score: int                 # ATS compatibility 0-100
    experience_level: str          # "fresher" | "junior" | "mid" | "senior"
    detected_role: str             # e.g. "Full Stack Developer"
    
    strengths: list[str]
    weaknesses: list[str]
    missing_keywords: list[str]
    detected_skills: list[str]
    
    sections: dict[str, ResumeSection]   # contact, summary, experience, education, skills
    
    top_improvements: list[str]    # top 3 actionable fixes
    interview_readiness: str       # "low" | "medium" | "high"
    summary: str                   # 2-3 sentence human-readable summary


# ------------------------------------------------------------------
# System prompt — The Guardrail Persona
# ------------------------------------------------------------------

RESUME_ANALYZER_SYSTEM_PROMPT = """
You are an expert resume reviewer and career coach with 15+ years of experience 
in technical hiring at top tech companies.

CRITICAL STEP - VALIDATION:
Before analyzing, you must verify if the input text is a professional Resume or CV.
- If the document is a TAX INVOICE, RECEIPT, SOURCE CODE, or any NON-RESUME text, 
  you MUST set "is_valid_resume": false and provide a clear error in "error_message".
- If it IS a resume, set "is_valid_resume": true and proceed with full analysis.

ANALYSIS CRITERIA:
1. ATS Compatibility (formatting, keywords)
2. Content Quality (metrics, action verbs)
3. Skills & Experience relevance

Always respond with ONLY valid JSON.
"""

RESUME_ANALYSIS_PROMPT_TEMPLATE = """
Analyze the following text. 

If it is NOT a resume, return:
{{
    "is_valid_resume": false,
    "error_message": "Invalid document detected. Please upload a Resume instead of an invoice or other document type.",
    "overall_score": 0,
    "sections": {{}},
    "summary": "Analysis aborted: Invalid document."
}}

If it IS a resume, return the full analysis JSON.

TEXT TO ANALYZE:
---
{resume_text}
---

TARGET ROLE: {target_role}

JSON STRUCTURE:
{{
    "is_valid_resume": true,
    "error_message": "",
    "overall_score": <int>,
    "ats_score": <int>,
    "experience_level": "<fresher|junior|mid|senior>",
    "detected_role": "<role>",
    "strengths": [],
    "weaknesses": [],
    "missing_keywords": [],
    "detected_skills": [],
    "sections": {{
        "contact": {{ "score": <int>, "feedback": "", "suggestions": [] }},
        "summary": {{ "score": <int>, "feedback": "", "suggestions": [] }},
        "experience": {{ "score": <int>, "feedback": "", "suggestions": [] }},
        "education": {{ "score": <int>, "feedback": "", "suggestions": [] }},
        "skills": {{ "score": <int>, "feedback": "", "suggestions": [] }}
    }},
    "top_improvements": [],
    "interview_readiness": "medium",
    "summary": ""
}}
"""

# ------------------------------------------------------------------
# Agent class
# ------------------------------------------------------------------

class ResumeAnalyzerAgent:
    def __init__(self):
        self.name = "resume_analyzer"
        self.description = "Validates and analyzes resumes"

    def analyze(self, resume_text: str, target_role: str = "Software Engineer") -> ResumeAnalysis:
        if not resume_text or len(resume_text.strip()) < 50:
            return ResumeAnalysis(
                is_valid_resume=False,
                error_message="Document text is too short. Please upload a full resume.",
                overall_score=0,
                ats_score=0,
                experience_level="N/A",
                detected_role="N/A",
                strengths=[],
                weaknesses=[],
                missing_keywords=[],
                detected_skills=[],
                sections={},
                top_improvements=[],
                interview_readiness="low",
                summary="Invalid input."
            )

        prompt = RESUME_ANALYSIS_PROMPT_TEMPLATE.format(
            resume_text=resume_text[:6000],
            target_role=target_role
        )

        raw_response = generate_response(
            prompt=prompt,
            system_instruction=RESUME_ANALYZER_SYSTEM_PROMPT
        )

        analysis_dict = self._parse_json_response(raw_response)
        return self._build_analysis(analysis_dict)

    def _parse_json_response(self, raw: str) -> dict:
        cleaned = raw.strip()
        # FIXED: Corrected the multi-line regex syntax error
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
                except: 
                    pass
            # If parsing fails entirely, return a valid schema with error
            return {"is_valid_resume": False, "error_message": "AI returned unparseable JSON."}

    def _build_analysis(self, data: dict) -> ResumeAnalysis:
        is_valid = data.get("is_valid_resume", True)
        
        # Build section objects safely
        sections = {}
        raw_sections = data.get("sections", {})
        standard_sections = ["contact", "summary", "experience", "education", "skills"]
        
        for name in standard_sections:
            s_data = raw_sections.get(name, {})
            sections[name] = ResumeSection(
                score=int(s_data.get("score", 0)),
                feedback=s_data.get("feedback", "No data") if is_valid else "N/A",
                suggestions=s_data.get("suggestions", [])
            )

        return ResumeAnalysis(
            is_valid_resume=is_valid,
            error_message=data.get("error_message", ""),
            overall_score=int(data.get("overall_score", 0)),
            ats_score=int(data.get("ats_score", 0)),
            experience_level=data.get("experience_level", "junior"),
            detected_role=data.get("detected_role", "N/A"),
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
            missing_keywords=data.get("missing_keywords", []),
            detected_skills=data.get("detected_skills", []),
            sections=sections,
            top_improvements=data.get("top_improvements", []),
            interview_readiness=data.get("interview_readiness", "low"),
            summary=data.get("summary", "")
        )

resume_analyzer_agent = ResumeAnalyzerAgent()