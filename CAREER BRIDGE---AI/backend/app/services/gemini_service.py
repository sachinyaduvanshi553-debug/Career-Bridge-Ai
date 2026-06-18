import os
import json
import re
from typing import Optional, Any, Dict
from google import genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model_id = "gemini-2.0-flash"
        else:
            self.client = None

    async def generate_ai_response(self, prompt: str) -> Optional[str]:
        """
        Calls Gemini API using the new google-genai SDK asynchronously.
        """
        if not self.client:
            print("Gemini client not initialized. Check API key.")
            return None
            
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return None

    def parse_json_response(self, text: str) -> Dict[str, Any]:
        """
        Robustly parses JSON from Gemini responses, handling markdown code blocks.
        """
        try:
            # Try direct parse
            return json.loads(text)
        except json.JSONDecodeError:
            # Try extracting from code blocks
            json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    pass
            
            # Last ditch effort: find first { and last }
            first_brace = text.find('{')
            last_brace = text.rfind('}')
            if first_brace != -1 and last_brace != -1:
                try:
                    return json.loads(text[first_brace:last_brace+1])
                except json.JSONDecodeError:
                    pass
            
            raise ValueError("Could not parse JSON from response")

# Global instance for easy reuse
gemini_service = GeminiService()
