import asyncio
import os
import sys
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.models import UserProfile, UserRole, WorkerProfile, UserRegistration
    from app.auth import get_password_hash
except ImportError:
    print("❌ Could not import app modules. Make sure you are running from the backend directory.")
    sys.exit(1)

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "career_setu_test") # Use a test DB

async def verify_schema():
    print(f"🚀 Starting MongoDB Schema Verification on DB: {DB_NAME}")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clean up test DB
    await client.drop_database(DB_NAME)
    print("🧹 Cleaned up test database.")

    try:
        # 1. Test Professional User Registration
        print("\n--- Testing Professional User ---")
        prof_user = {
            "name": "Test Professional",
            "email": "prof@test.com",
            "phone": "1234567890",
            "location": "New York",
            "role": UserRole.PROFESSIONAL,
            "password": get_password_hash("password123"),
            "is_verified": True,
            "created_at": datetime.utcnow()
        }
        result = await db["users"].insert_one(prof_user)
        print(f"✅ Professional user inserted with ID: {result.inserted_id}")
        
        # 2. Test Worker User Registration and Profile
        print("\n--- Testing Worker User & Profile ---")
        worker_user = {
            "name": "Test Worker",
            "email": "worker@test.com",
            "phone": "9876543210",
            "location": "Mumbai",
            "role": UserRole.WORKER,
            "password": get_password_hash("password123"),
            "is_verified": True,
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(worker_user)
        
        worker_profile = {
            "user_id": "worker@test.com",
            "aadhaar_number": "123456789012",
            "skills": ["Plumbing", "Electrical"],
            "experience_years": 5,
            "service_charges": 500.0,
            "rating": 4.5,
            "availability": True
        }
        result = await db["worker_profiles"].insert_one(worker_profile)
        print(f"✅ Worker profile inserted with ID: {result.inserted_id}")

        # 3. Test Customer User Registration
        print("\n--- Testing Customer User ---")
        customer_user = {
            "name": "Test Customer",
            "email": "customer@test.com",
            "phone": "5556667777",
            "location": "Delhi",
            "role": UserRole.CUSTOMER,
            "password": get_password_hash("password123"),
            "is_verified": True,
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(customer_user)
        print("✅ Customer user inserted.")

        # 4. Verify Data Retrieval
        print("\n--- Verifying Data Retrieval ---")
        
        # Verify all users
        users_count = await db["users"].count_documents({})
        print(f"📊 Total users in DB: {users_count}")
        assert users_count == 3
        
        # Verify Worker Profile link
        worker = await db["users"].find_one({"role": UserRole.WORKER})
        profile = await db["worker_profiles"].find_one({"user_id": worker["email"]})
        print(f"🔍 Found worker: {worker['name']}, Profile skills: {profile['skills']}")
        assert profile["user_id"] == worker["email"]
        
        print("\n✨ ALL SCHEMA VERIFICATIONS PASSED!")

    except Exception as e:
        print(f"❌ Verification failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Optional: Clean up after test
        # await client.drop_database(DB_NAME)
        client.close()

if __name__ == "__main__":
    asyncio.run(verify_schema())
