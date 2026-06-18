import logging
from typing import List, Dict, Any
from ..skill_extractor import SkillExtractor
try:
    from ..models import WorkerProfile, ServiceRequest
    from ..database import get_db
except (ImportError, ValueError):
    from app.models import WorkerProfile, ServiceRequest
    from app.database import get_db

logger = logging.getLogger(__name__)

class MatchingEngine:
    def __init__(self):
        self.skill_extractor = SkillExtractor()

    async def find_matches(self, request: ServiceRequest) -> List[Dict[str, Any]]:
        db = get_db()
        
        # 1. Extract required skills from request description using NLP
        required_skills = self.skill_extractor.extract_skills(request.description)
        if not required_skills:
            # Fallback to work_type if NLP fails to find specific skills
            required_skills = [request.work_type]
            
        logger.info(f"Matching request for {request.work_type}. Required: {required_skills}")

        # 2. Query workers from DB
        # Basic filter: must be available and verified
        cursor = db["worker_profiles"].find({"availability": True})
        workers = await cursor.to_list(length=200)

        matches = []
        for worker in workers:
            # 3. Calculate match score
            score = 0
            
            # Skill match (intersection)
            worker_skills = set(worker.get("skills", []))
            common_skills = worker_skills.intersection(set(required_skills))
            skill_score = (len(common_skills) / len(required_skills)) * 60 if required_skills else 0
            
            # Location match (simulated - for demo, we'll check if location string is in worker profile or user profile)
            # In a real app, use geospatial queries
            location_score = 0
            user = await db["users"].find_one({"email": worker["user_id"]})
            if user and user.get("location") == request.location:
                location_score = 30
            
            # Rating score
            rating_score = (worker.get("rating", 0.0) / 5.0) * 10
            
            total_score = skill_score + location_score + rating_score
            
            if total_score > 20: # Minimum threshold
                matches.append({
                    "worker_id": worker["user_id"],
                    "name": user.get("name") if user else "Unknown",
                    "skills": list(worker_skills),
                    "score": round(total_score, 2),
                    "rating": worker.get("rating", 0.0),
                    "location": user.get("location") if user else "Unknown"
                })

        # Sort by score descending
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:10]
