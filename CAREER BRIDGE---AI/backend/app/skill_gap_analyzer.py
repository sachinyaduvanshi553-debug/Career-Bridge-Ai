from ml_models.skill_gap_analyzer import LocalSkillGapAnalyzer
from typing import List, Dict, Any
from .services.gemini_service import gemini_service

class SkillGapAnalyzer:
    def __init__(self):
        self.analyzer = LocalSkillGapAnalyzer()

    async def analyze_gap(self, user_skills: List[str], target_role_skills: List[str]) -> Dict[str, Any]:
        # Get local base analysis
        local_report = self.analyzer.analyze(user_skills, target_role_skills)
        
        # Enhance with Gemini AI for semantic gap understanding
        prompt = f"""
        Analyze the skill gap between a user's current skills and a target role's required skills.
        
        User Skills: {', '.join(user_skills)}
        Target Role Skills: {', '.join(target_role_skills)}
        
        Provide your analysis in JSON format with the following keys:
        - matching_skills: [List of skills that are a match or semantically similar]
        - missing_skills: [List of skills that are definitely missing]
        - readiness_score: (0-100)
        - status: (e.g., "Ready", "Improving", "Gap Identified")
        - recommendations: [Short advice on how to bridge the gap]
        
        ONLY return the JSON object.
        """
        
        ai_response = await gemini_service.generate_ai_response(prompt)
        if ai_response:
            try:
                ai_data = gemini_service.parse_json_response(ai_response)
                return {
                    "matching_skills": ai_data.get("matching_skills", local_report["matching_skills"]),
                    "missing_skills": ai_data.get("missing_skills", local_report["missing_skills"]),
                    "readiness_score": ai_data.get("readiness_score", local_report["readiness_score"]),
                    "status": ai_data.get("status", local_report["status"]),
                    "recommendations": ai_data.get("recommendations", ["Focus on the missing core skills identified in the roadmap."])
                }
            except Exception as e:
                print(f"Error parsing Gemini response for skill gap: {e}")

        return local_report
