from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..services.job_service import JobFetcherService
from ..services.job_matcher import JobMatcher
from ..services.skill_extractor import SkillExtractor
from ..dependencies import ROLES_DB
from ..models import JobListing
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/jobs",
    tags=["Job Search"],
    responses={404: {"description": "Not found"}},
)

# Global instances
job_fetcher = JobFetcherService()

@router.get("/", response_model=List[JobListing])
async def get_jobs(
    skills: str = Query("Python", description="Comma-separated list of skills"), 
    location: Optional[str] = Query(None, description="Preferred job location")
):
    """
    Production-grade job matching. Combines Adzuna API with internal semantic ranking.
    """
    try:
        skill_list = [s.strip() for s in skills.split(",") if s.strip()]
        if not skill_list:
            raise HTTPException(status_code=400, detail="At least one skill is required.")
            
        # 1. Fetch live jobs via Adzuna
        live_jobs = await job_fetcher.fetch_live_jobs(skills, location)
        
        # 2. Semantic matching and ranking
        # JobMatcher uses local ML embeddings for role comparison
        matcher = JobMatcher([r.__dict__ for r in ROLES_DB])
        results = await matcher.match(skill_list, location, live_jobs)
        
        # Return top 20 matches for better performance
        return results[:20]
    except Exception as e:
        logger.error(f"❌ Job search failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Job search engine is currently unavailable. Please try again later."
        )
