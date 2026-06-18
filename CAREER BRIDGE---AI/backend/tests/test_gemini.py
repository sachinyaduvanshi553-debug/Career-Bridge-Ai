import os
import asyncio
from google import genai
from dotenv import load_dotenv

async def test_gemini():
    print("--- Gemini API Integration Test ---")
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key or "your_gemini" in api_key:
        print("❌ FAILED: GEMINI_API_KEY not found in .env")
        return

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents="Say 'CAREER BRIDGE - AI is online!' if you can hear me."
        )
        print(f"✅ SUCCESS: Gemini says: {response.text}")
    except Exception as e:
        print(f"❌ FAILED: Error calling Gemini: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
