import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "career_setu")

async def verify_db():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print(f"--- MongoDB Verification: {DB_NAME} ---")
    
    # 1. Check Users
    user_count = await db["users"].count_documents({})
    print(f"Total Users: {user_count}")
    
    # 2. Check for Resume/Aadhaar URLs in users
    users_with_docs = await db["users"].find({"$or": [{"resume_url": {"$exists": True}}, {"aadhaar_url": {"$exists": True}}]}).to_list(10)
    print(f"Users with Resume/Aadhaar: {len(users_with_docs)}")
    for u in users_with_docs:
        print(f" - {u['email']}:")
        print(f"   Resume: {u.get('resume_url')}")
        print(f"   Aadhaar: {u.get('aadhaar_url')}")
        print(f"   Photo: {u.get('profile_photo')}")
        
    # 3. Check Worker Profiles Portfolio
    worker_count = await db["worker_profiles"].count_documents({})
    print(f"Total Worker Profiles: {worker_count}")
    
    workers_with_media = await db["worker_profiles"].find({"$or": [{"work_photos": {"$not": {"$size": 0}}}, {"work_videos": {"$not": {"$size": 0}}}]}).to_list(10)
    print(f"Workers with Portfolio Items: {len(workers_with_media)}")
    for w in workers_with_media:
        print(f" - {w['user_id']}: Photos={len(w.get('work_photos', []))}, Videos={len(w.get('work_videos', []))}")
        if w.get('work_photos'):
            print(f"   Sample Photo: {w['work_photos'][0]}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(verify_db())
