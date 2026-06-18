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
        if self.api_key and "your_gemini" not in self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model_id = "gemini-1.5-flash"
        else:
            self.client = None

    async def generate_ai_response(self, prompt: str) -> Optional[str]:
        """
        Calls Gemini API with a local fallback if the API is unavailable.
        """
        if not self.client:
            return self._generate_local_fallback(prompt)
            
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return self._generate_local_fallback(prompt)

    def _generate_local_fallback(self, prompt: str) -> str:
        """
        Procedurally generates a response based on keywords in the prompt.
        """
        prompt_lower = prompt.lower()
        
        # 1. Cover Letter Fallback
        if "cover letter" in prompt_lower:
            # Extract basic info from prompt using simple regex or string splits
            name = "Candidate"
            role = "Target Position"
            skills = "relevant skills"
            
            if "name:" in prompt_lower:
                name = prompt.split("Name:")[1].split("\n")[0].strip()
            if "role of" in prompt_lower:
                role = prompt.split("role of")[1].split(".")[0].strip()
            if "skills:" in prompt_lower:
                skills = prompt.split("Skills:")[1].split("\n")[0].strip()

            return f"""Dear Hiring Manager,

I am writing to express my strong interest in the {role} position. With my background in {skills}, I am confident that I can contribute significantly to your team's success.

Throughout my career, I have developed a deep understanding of industry best practices and a proven track record of delivering high-quality results. My experience in {skills.split(',')[0]} and related technologies has equipped me with the technical expertise and problem-solving skills necessary to excel in this role.

I am particularly drawn to your organization because of your reputation for innovation and excellence. I am eager to bring my unique perspective and dedication to your team and help drive your projects forward.

Thank you for considering my application. I look forward to the possibility of discussing how my skills and experience align with the needs of your team.

Sincerely,
{name}"""

        # 2. Evaluation / Interview Fallback
        if "evaluate" in prompt_lower or "interview" in prompt_lower:
            return json.dumps({
                "score": 75,
                "feedback": "You provided a clear and structured answer. To improve, try to include more specific examples from your past projects to demonstrate your impact.",
                "improvements": ["Use STAR method", "Mention specific tools", "Quantify results"],
                "ideal_answer": "A perfect answer would clearly define the problem, the action taken, and the measurable result achieved."
            })

        # 3. Default Assistant Fallback
        return "I'm currently operating in offline mode, but I can still help you with basic tasks. Feel free to explore the roadmap, jobs, or resume analysis sections!"

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
