import os
import httpx
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class JobFetcherService:
    def __init__(self):
        self.app_id = os.getenv("ADZUNA_APP_ID")
        self.app_key = os.getenv("ADZUNA_APP_KEY")
        self.base_url = "https://api.adzuna.com/v1/api/jobs/in/search/1" # 'in' for India

    async def fetch_live_jobs(self, query: str, location: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.app_id or not self.app_key:
            logger.warning("Adzuna API credentials missing. Skipping live job search.")
            return []

        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "results_per_page": 20,
            "what": query,
            "content-type": "application/json"
        }
        if location:
            params["where"] = location

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = []
                for job in data.get("results", []):
                    results.append({
                        "id": f"live_{job.get('id')}",
                        "title": job.get("title"),
                        "company": job.get("company", {}).get("display_name", "Unknown"),
                        "location": job.get("location", {}).get("display_name", "Remote"),
                        "state": "Live",
                        "skills": [query], # Adzuna doesn't provide structured skills directly in free tier
                        "posted": job.get("created"),
                        "applicants": 0,
                        "type": "Full-time",
                        "salary": f"{job.get('salary_min', 'N/A')} - {job.get('salary_max', 'N/A')}",
                        "description": job.get("description", ""),
                        "redirect_url": job.get("redirect_url")
                    })
                logger.info(f"Successfully fetched {len(results)} live jobs from Adzuna")
                return results
        except Exception as e:
            logger.error(f"Error fetching live jobs from Adzuna: {e}")
            return []
        
        return []
