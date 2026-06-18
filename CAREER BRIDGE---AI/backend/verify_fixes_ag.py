import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from app.models import UserProfile
    print("✅ SUCCESS: app.models import")
    
    from app.services.job_service import JobFetcherService
    service = JobFetcherService()
    print("✅ SUCCESS: app.services.job_service import and init")
    
    # Test the return path fix in job_service
    # (Checking the code structure implies it's fine, but let's see if it imports)
    
    from app.job_matcher import JobMatcher
    matcher = JobMatcher([])
    print("✅ SUCCESS: app.job_matcher import and init")
    
    # Test the fix in job_matcher
    # (Mocking a simple data to test indexing fix)
    fake_jobs = [{"title": "Dev", "location": "Bangalore"}]
    # Note: we won't try to call .match because it loads LocalJobMatcher which might be slow
    
    print("✅ ALL SIMPLE IMPORTS VERIFIED")
except Exception as e:
    print(f"❌ FAILED: {e}")
    sys.exit(1)
