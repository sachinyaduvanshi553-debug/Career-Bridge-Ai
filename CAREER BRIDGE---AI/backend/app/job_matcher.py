import logging
try:
    from ml_models.job_matching import LocalJobMatcher
except (ImportError, ValueError):
    from ..ml_models.job_matching import LocalJobMatcher
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class JobMatcher:
    def __init__(self, job_listings: List[Dict[str, Any]]):
        self.listings = job_listings
        self.matcher = LocalJobMatcher()

    async def match(self, user_skills: List[str], location: Optional[str] = None, live_jobs: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        # Combine local roles with live jobs
        all_jobs = self.listings.copy()
        if live_jobs:
            all_jobs.extend(live_jobs)
            
        logger.info(f"Matching {len(user_skills)} skills against {len(all_jobs)} total jobs (Local: {len(self.listings)}, Live: {len(live_jobs) if live_jobs else 0})")
        
        user_text = " ".join(user_skills)
        job_texts = [f"{j.get('title', '')} {' '.join(j.get('skills', []))} {j.get('description', '')}" for j in all_jobs]
        
        # Filter by location first if provided
        filtered_indices = []
        for i, job in enumerate(all_jobs):
            if location is not None:
                loc_lower = str(location).lower()
                job_loc = str(job.get("location", "")).lower()
                job_state = str(job.get("state", "")).lower()
                if loc_lower in job_loc or loc_lower in job_state:
                    filtered_indices.append(i)
            else:
                filtered_indices.append(i)
        
        if not filtered_indices:
            logger.info("No jobs found matching the location filter.")
            return []
            
        # Match using local semantic model
        try:
            match_results = self.matcher.match(user_text, [str(job_texts[i]) for i in filtered_indices])
            
            results = []
            for res in match_results:
                idx = int(res.get("index", 0))
                original_index = int(filtered_indices[idx])
                job = all_jobs[original_index]
                results.append({
                    **job,
                    "match_score": float(f"{(res['score'] * 100):.1f}")
                })
                
            return results
        except Exception as e:
            logger.error(f"Error during semantic job matching: {e}")
            # Basic fallback - return first 10
            fallback_results = []
            for i in range(min(10, len(all_jobs))):
                fallback_results.append(all_jobs[i])
            return fallback_results
