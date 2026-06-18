from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from ..services.skill_extractor import SkillExtractor
from ..services.skill_gap_analyzer import SkillGapAnalyzer
from ..dependencies import ROLES_DB
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/skills",
    tags=["Skills & Careers"],
    responses={404: {"description": "Not found"}},
)

# Shared instances
extractor = SkillExtractor()
gap_analyzer = SkillGapAnalyzer()

@router.post("/gap")
async def analyze_skill_gap(data: Dict[str, Any]):
    user_skills = data.get("user_skills", [])
    target_role_id = data.get("role_id")
    
    role = next((r for r in ROLES_DB if r.id == target_role_id), ROLES_DB[0] if ROLES_DB else None)
    if not role:
        raise HTTPException(status_code=404, detail="Target role not found in our database.")
        
    report = await gap_analyzer.analyze_gap(user_skills, role.requiredSkills)
    return report

@router.get("/recommend")
async def recommend_careers(skills: str):
    """
    Predict optimal career paths based on a comma-separated list of skills.
    Uses cached Gemini recommendations for production speed.
    """
    from ..services.career_recommender import CareerRecommender
    recommender = CareerRecommender(ROLES_DB)
    
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    if not skill_list:
        raise HTTPException(status_code=400, detail="Please provide at least one skill.")
        
    return await recommender.recommend(skill_list)

@router.post("/extract")
async def extract_skills(data: Dict[str, str]):
    text = data.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text required for extraction.")
    return extractor.extract_skills(text)
