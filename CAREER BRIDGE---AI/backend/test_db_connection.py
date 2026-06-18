import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def test_connection():
    load_dotenv()
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "career_setu")
    
    print(f"🔍 Testing connection to: {mongo_url}")
    print(f"📁 Database: {db_name}")
    
    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("✅ MongoDB connection successful!")
        
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"📊 Collections in '{db_name}': {collections}")
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\n💡 Tip: Make sure MongoDB is running on your local machine.")

if __name__ == "__main__":
    asyncio.run(test_connection())
