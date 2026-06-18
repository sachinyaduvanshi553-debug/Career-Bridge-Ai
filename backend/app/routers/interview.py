from fastapi import APIRouter, HTTPException, Body
from typing import Dict, List, Any, Optional
from ..services.interview_engine import InterviewEngine
from ..dependencies import ROLES_DB
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/interview",
    tags=["Mock Interviews"],
    responses={404: {"description": "Not found"}},
)

# Global engine instance
interview_engine = InterviewEngine()

@router.post("/start")
async def start_interview(data: Dict[str, str] = Body(...)):
    """Starts a new mock interview session session for a specific role."""
    role_id = data.get("role_id")
    if not role_id:
        raise HTTPException(status_code=400, detail="role_id is required.")
        
    role = next((r for r in ROLES_DB if r.id == role_id), ROLES_DB[0] if ROLES_DB else None)
    if not role:
        raise HTTPException(status_code=404, detail="Role definition not found.")
        
    # Uses internal DB or Gemini for dynamic questions
    return await interview_engine.get_questions(role.title)

@router.post("/evaluate")
async def evaluate_answer(data: Dict[str, str] = Body(...)):
    """Evaluates a single question-answer pair for mock interview feedback."""
    question = data.get("question", "")
    answer = data.get("answer", "")
    
    if not question or not answer:
        raise HTTPException(status_code=400, detail="Both question and answer must be provided.")
        
    # Note: Scorer now uses Gemini 2.0 with prompt caching
    try:
        return await interview_engine.evaluate_answer(question, answer)
    except Exception as e:
        logger.error(f"❌ Interview evaluation error: {e}")
        raise HTTPException(status_code=500, detail="AI evaluation engine failure.")
