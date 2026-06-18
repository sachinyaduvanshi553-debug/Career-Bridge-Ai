import os
import sys
from dotenv import load_dotenv
import asyncio

# Setup path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv(dotenv_path='backend/.env')

from app.services.gemini_service import gemini_service

async def test_gemini():
    print(f"Testing Gemini API with key: {os.getenv('GEMINI_API_KEY')[:10]}...")
    prompt = "Say 'Gemini is functional' if you can read this."
    response = await gemini_service.generate_ai_response(prompt)
    if response:
        print(f"Response: {response}")
        print("✅ Gemini API is functional!")
    else:
        print("❌ Gemini API failed.")

if __name__ == "__main__":
    asyncio.run(test_gemini())
