import logging
from typing import List, Dict, Any
try:
    from ml_models.skill_gap_analyzer import LocalSkillGapAnalyzer
except ImportError:
    try:
        from ..ml_models.skill_gap_analyzer import LocalSkillGapAnalyzer
    except ImportError:
        LocalSkillGapAnalyzer = None

from .gemini_service import gemini_service

logger = logging.getLogger(__name__)

class SkillGapAnalyzer:
    def __init__(self):
        if LocalSkillGapAnalyzer:
            try:
                self.analyzer = LocalSkillGapAnalyzer()
            except Exception as e:
                logger.warning(f"Could not initialize LocalSkillGapAnalyzer: {e}")
                self.analyzer = None
        else:
            self.analyzer = None

    async def analyze_gap(self, user_skills: List[str], target_role_skills: List[str]) -> Dict[str, Any]:
        """
        Analyzes the semantic gap between current and target skills.
        Uses cached Gemini results for repeat queries to optimize performance.
        """
        # Get local base analysis
        local_report = {"matching_skills": [], "missing_skills": [], "readiness_score": 0, "status": "Error"}
        if self.analyzer:
            try:
                local_report = self.analyzer.analyze(user_skills, target_role_skills)
            except Exception as e:
                logger.error(f"Local skill gap analysis failed: {e}")

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
        
        # Note: gemini_service handles internal Redis caching
        ai_response = await gemini_service.generate_ai_response(prompt)
        if ai_response:
            try:
                ai_data = gemini_service.parse_json_response(ai_response)
                if ai_data:
                    return {
                        "matching_skills": ai_data.get("matching_skills", local_report.get("matching_skills", [])),
                        "missing_skills": ai_data.get("missing_skills", local_report.get("missing_skills", [])),
                        "readiness_score": ai_data.get("readiness_score", local_report.get("readiness_score", 0)),
                        "status": ai_data.get("status", local_report.get("status", "Unknown")),
                        "recommendations": ai_data.get("recommendations", ["Focus on the missing core skills identified in the roadmap."])
                    }
            except Exception as e:
                logger.error(f"Error parsing Gemini response for skill gap: {e}")

        return local_report
