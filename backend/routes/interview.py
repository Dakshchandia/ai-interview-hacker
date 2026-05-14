"""
Interview Routes
-----------------
Manages interview sessions: start, respond, end.
Sessions are stored in-memory (keyed by session_id).
"""

import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.agents.technical_interviewer import technical_interviewer_agent
from backend.agents.hr_interviewer import hr_interviewer_agent
from backend.agents.evaluator import evaluator_agent
from backend.routes.resume import resume_store

router = APIRouter(prefix="/interview", tags=["Interview"])

# ─── In-memory session store ──────────────────────────────────────────────────
# session_id → session data
interview_sessions: dict[str, dict] = {}


# ─── Request / Response models ────────────────────────────────────────────────

class StartInterviewRequest(BaseModel):
    resume_id: Optional[str] = None
    interview_type: str = "technical"   # "technical" | "hr"
    target_role: str = "Software Engineer"
    difficulty: str = "Medium"          # "Easy" | "Medium" | "Hard"

class StartInterviewResponse(BaseModel):
    session_id: str
    interview_type: str
    target_role: str
    difficulty: str
    first_question: str
    topic: str
    hints: list[str]
    message: str

class RespondRequest(BaseModel):
    session_id: str
    answer: str

class RespondResponse(BaseModel):
    session_id: str
    question_num: int
    total_questions: int
    score: int
    technical_score: int
    communication_score: int
    confidence_score: int
    strengths: list[str]
    improvements: list[str]
    next_question: Optional[str]
    next_topic: Optional[str]
    is_complete: bool
    message: str

class EndInterviewRequest(BaseModel):
    session_id: str

# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/start", response_model=StartInterviewResponse)
async def start_interview(request: StartInterviewRequest):
    """
    Start a new interview session.
    Returns the first question and a session_id for subsequent calls.
    """
    # Get resume skills if resume_id provided
    skills = []
    if request.resume_id and request.resume_id in resume_store:
        resume_data = resume_store[request.resume_id]
        # Extract skills from resume text (simple heuristic)
        skills = _extract_skills_from_text(resume_data.get("text", ""))

    session_id = str(uuid.uuid4())

    # Generate first question
    if request.interview_type == "technical":
        question_obj = technical_interviewer_agent.generate_question(
            role=request.target_role,
            round_num=1,
            covered_topics=[],
            difficulty=request.difficulty,
            skills=skills,
        )
        first_question = question_obj.question
        topic = question_obj.topic
        hints = question_obj.hints
        expected_points = question_obj.expected_points
    else:
        question_obj = hr_interviewer_agent.generate_question(
            role=request.target_role,
            round_num=1,
            covered_categories=[],
        )
        first_question = question_obj.question
        topic = question_obj.category
        hints = [question_obj.star_guidance]
        expected_points = question_obj.what_we_look_for

    # Store session
    interview_sessions[session_id] = {
        "session_id": session_id,
        "interview_type": request.interview_type,
        "target_role": request.target_role,
        "difficulty": request.difficulty,
        "skills": skills,
        "questions": [{
            "question": first_question,
            "topic": topic,
            "expected_points": expected_points,
        }],
        "answers": [],
        "scores": [],
        "covered_topics": [topic],
        "current_question_num": 1,
        "total_questions": 5,
        "is_complete": False,
        "running_technical": 50,
        "running_communication": 50,
        "running_confidence": 60,
    }

    return StartInterviewResponse(
        session_id=session_id,
        interview_type=request.interview_type,
        target_role=request.target_role,
        difficulty=request.difficulty,
        first_question=first_question,
        topic=topic,
        hints=hints,
        message=f"Interview started! This is question 1 of 5.",
    )


@router.post("/respond", response_model=RespondResponse)
async def respond_to_question(request: RespondRequest):
    """
    Submit an answer to the current question.
    Returns evaluation scores and the next question (if any).
    """
    if request.session_id not in interview_sessions:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please start a new interview."
        )

    session = interview_sessions[request.session_id]

    if session["is_complete"]:
        raise HTTPException(status_code=400, detail="Interview already completed.")

    current_q = session["questions"][-1]
    q_num = session["current_question_num"]

    # Evaluate the answer
    if session["interview_type"] == "technical":
        evaluation = technical_interviewer_agent.evaluate_answer(
            question=current_q["question"],
            topic=current_q["topic"],
            answer=request.answer,
            expected_points=current_q.get("expected_points", []),
        )
        q_score = evaluation.score
        comm_score = evaluation.communication
        conf_score = min(100, evaluation.communication + 10)
        strengths = evaluation.strengths
        improvements = evaluation.improvements
        difficulty_adj = evaluation.difficulty_adjustment
    else:
        evaluation = hr_interviewer_agent.evaluate_answer(
            question=current_q["question"],
            category=current_q["topic"],
            answer=request.answer,
        )
        q_score = evaluation.score
        comm_score = evaluation.communication_score
        conf_score = evaluation.confidence_score
        strengths = evaluation.strengths
        improvements = evaluation.improvements
        difficulty_adj = "maintain"

    # Store answer + score
    session["answers"].append(request.answer)
    session["scores"].append({
        "question": current_q["question"],
        "topic": current_q["topic"],
        "score": q_score,
        "communication": comm_score,
    })

    # Update running averages
    all_scores = session["scores"]
    session["running_technical"] = sum(s["score"] for s in all_scores) // len(all_scores)
    session["running_communication"] = sum(s["communication"] for s in all_scores) // len(all_scores)
    session["running_confidence"] = min(100, session["running_communication"] + 8)

    # Check if interview is complete
    is_complete = q_num >= session["total_questions"]
    next_question = None
    next_topic = None

    if not is_complete:
        # Adjust difficulty
        new_difficulty = session["difficulty"]
        if difficulty_adj == "increase" and session["difficulty"] != "Hard":
            new_difficulty = "Hard" if session["difficulty"] == "Medium" else "Medium"
        elif difficulty_adj == "decrease" and session["difficulty"] != "Easy":
            new_difficulty = "Easy" if session["difficulty"] == "Medium" else "Medium"
        session["difficulty"] = new_difficulty

        # Generate next question
        if session["interview_type"] == "technical":
            next_q_obj = technical_interviewer_agent.generate_question(
                role=session["target_role"],
                round_num=q_num + 1,
                covered_topics=session["covered_topics"],
                difficulty=new_difficulty,
                skills=session["skills"],
            )
            next_question = next_q_obj.question
            next_topic = next_q_obj.topic
            next_expected = next_q_obj.expected_points
        else:
            covered_cats = [q["topic"] for q in session["questions"]]
            next_q_obj = hr_interviewer_agent.generate_question(
                role=session["target_role"],
                round_num=q_num + 1,
                covered_categories=covered_cats,
            )
            next_question = next_q_obj.question
            next_topic = next_q_obj.category
            next_expected = next_q_obj.what_we_look_for

        session["questions"].append({
            "question": next_question,
            "topic": next_topic,
            "expected_points": next_expected,
        })
        session["covered_topics"].append(next_topic)
        session["current_question_num"] += 1
    else:
        session["is_complete"] = True

    return RespondResponse(
        session_id=request.session_id,
        question_num=q_num,
        total_questions=session["total_questions"],
        score=q_score,
        technical_score=session["running_technical"],
        communication_score=session["running_communication"],
        confidence_score=session["running_confidence"],
        strengths=strengths,
        improvements=improvements,
        next_question=next_question,
        next_topic=next_topic,
        is_complete=is_complete,
        message="Interview complete! Generating your evaluation." if is_complete else f"Question {q_num + 1} of {session['total_questions']}",
    )


@router.post("/end")
async def end_interview(request: EndInterviewRequest):
    """
    End the interview and get the final evaluation.
    """
    if request.session_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = interview_sessions[request.session_id]

    if not session["scores"]:
        raise HTTPException(status_code=400, detail="No answers recorded yet.")

    evaluation = evaluator_agent.evaluate_session(
        role=session["target_role"],
        interview_type=session["interview_type"],
        question_scores=session["scores"],
    )

    return {
        "session_id": request.session_id,
        "evaluation": evaluation.model_dump(),
        "session_summary": {
            "interview_type": session["interview_type"],
            "target_role": session["target_role"],
            "questions_answered": len(session["answers"]),
            "topics_covered": list(set(session["covered_topics"])),
        }
    }


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get current session state — useful for debugging."""
    if session_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Session not found.")
    session = interview_sessions[session_id]
    return {
        "session_id": session_id,
        "interview_type": session["interview_type"],
        "current_question": session["current_question_num"],
        "total_questions": session["total_questions"],
        "is_complete": session["is_complete"],
        "running_scores": {
            "technical": session["running_technical"],
            "communication": session["running_communication"],
            "confidence": session["running_confidence"],
        }
    }


# ─── Helper ───────────────────────────────────────────────────────────────────

def _extract_skills_from_text(text: str) -> list[str]:
    """Simple keyword extraction for common tech skills."""
    common_skills = [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust",
        "React", "Node.js", "FastAPI", "Django", "Flask", "Spring",
        "SQL", "PostgreSQL", "MongoDB", "Redis", "MySQL",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure",
        "Git", "REST", "GraphQL", "Microservices",
        "Machine Learning", "TensorFlow", "PyTorch",
        "Data Structures", "Algorithms", "System Design",
    ]
    text_lower = text.lower()
    return [s for s in common_skills if s.lower() in text_lower][:10]
