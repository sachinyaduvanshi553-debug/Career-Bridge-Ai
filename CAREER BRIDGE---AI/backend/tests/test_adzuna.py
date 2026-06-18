import asyncio
import os
import sys
from dotenv import load_dotenv

# Add app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.services.job_service import JobFetcherService

async def test_live_jobs():
    print("--- Adzuna API Integration Test ---")
    load_dotenv() # Load the updated .env
    
    fetcher = JobFetcherService()
    print(f"Testing with APP_ID: {fetcher.app_id}")
    
    query = "Software Engineer"
    location = "Bangalore"
    
    print(f"Fetching '{query}' jobs in '{location}'...")
    jobs = await fetcher.fetch_live_jobs(query, location)
    
    if jobs:
        print(f"✅ SUCCESS: Found {len(jobs)} live jobs!")
        for i, job in enumerate(jobs[:3], 1):
            print(f"{i}. {job['title']} at {job['company']} ({job['location']})")
            print(f"   URL: {job['redirect_url'][:50]}...")
    else:
        print("❌ FAILED: No jobs found or API error. Check your .env keys and internet connection.")

if __name__ == "__main__":
    asyncio.run(test_live_jobs())
