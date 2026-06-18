import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def clean_db():
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME = os.getenv("DB_NAME", "career_setu")
    
    print(f"Connecting to {MONGO_URL}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    collections = ["worker_profiles", "professional_profiles", "customer_profiles", "users"]
    
    for coll_name in collections:
        coll = db[coll_name]
        try:
            # Delete non-string user_id or empty user_id
            res1 = await coll.delete_many({"user_id": {"$nin": [None, ""]}, "$where": "typeof this.user_id !== 'string'"})
            res2 = await coll.delete_many({"user_id": {"$in": [None, "", 1]}})
            print(f"Cleaned {coll_name}: {res1.deleted_count + res2.deleted_count} documents removed.")
            
            # Drop the index if it exists, to recreate it cleanly
            # Wait, better just fix it.
        except Exception as e:
            print(f"Error cleaning {coll_name}: {e}")

    # Re-connecting to users for email index
    try:
        await db["users"].delete_many({"email": {"$in": [None, "", 1]}})
        print("Cleaned users email field.")
    except Exception as e:
        print(f"Error cleaning users email: {e}")

    print("DB Cleanup finished.")

if __name__ == "__main__":
    asyncio.run(clean_db())
