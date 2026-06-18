import logging
from typing import List, Dict, Any, Optional
try:
    from ml_models.career_recommendation import LocalCareerRecommender
except ImportError:
    try:
        from ..ml_models.career_recommendation import LocalCareerRecommender
    except ImportError:
        LocalCareerRecommender = None

from .skill_gap_analyzer import SkillGapAnalyzer
from .gemini_service import gemini_service

logger = logging.getLogger(__name__)

class CareerRecommender:
    def __init__(self, job_roles: List[Any]):
        self.job_roles = job_roles
        if LocalCareerRecommender:
            try:
                self.recommender = LocalCareerRecommender()
            except Exception as e:
                logger.warning(f"Could not initialize LocalCareerRecommender: {e}")
                self.recommender = None
        else:
            self.recommender = None
        self.analyzer = SkillGapAnalyzer()

    async def recommend(self, user_skills: List[str]) -> List[Dict[str, Any]]:
        """
        Production-grade career recommendation engine.
        Combines local ML role prediction with Gemini-enhanced semantic reasoning.
        """
        # Map current skills to predicted roles
        predicted_roles = []
        if self.recommender:
            try:
                predicted_roles = self.recommender.recommend(user_skills)
            except Exception as e:
                logger.error(f"Local career recommendation failed: {e}")
        
        recommendations: List[Dict[str, Any]] = []
        for role in self.job_roles:
            is_predicted = role.title in predicted_roles
            analysis = await self.analyzer.analyze_gap(user_skills, role.requiredSkills)
            
            # Boost score if model predicted it
            match_score = analysis.get("readiness_score", 0)
            if is_predicted:
                match_score = min(100, match_score + 20)
                
            recommendations.append({
                "role_id": role.id,
                "title": role.title,
                "match_score": match_score,
                "matching_skills": analysis.get("matching_skills", []),
                "missing_skills": analysis.get("missing_skills", []),
                "salary": getattr(role, "avgSalary", "Competitive"),
                "demand": getattr(role, "demandLevel", "Moderate"),
                "growth": getattr(role, "growth", "Stable"),
                "reasoning": f"Role analysis indicates a {match_score}% alignment with your skill profile."
            })
            
        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        top_recommendations = recommendations[:5]

        # Enhance with AI reasoning (gemini_service handles caching)
        if gemini_service.client:
            roles_text = "\n".join([f"- {r['title']} (Score: {r['match_score']}%)" for r in top_recommendations])
            prompt = f"""
            Based on the following career recommendations for a user with these skills: {', '.join(user_skills)},
            provide a brief, encouraging professional reasoning for each role.
            
            Roles:
            {roles_text}
            
            Provide the response in JSON format as a dictionary where keys are role titles and values are the reasoning string.
            Example: {{"Full Stack Developer": "Your strong React background makes you an ideal fit for modern web development."}}
            
            ONLY return the JSON object.
            """
            
            ai_response = await gemini_service.generate_ai_response(prompt)
            if ai_response:
                try:
                    reasoning_map = gemini_service.parse_json_response(ai_response)
                    if reasoning_map:
                        for rec in top_recommendations:
                            if rec["title"] in reasoning_map:
                                rec["reasoning"] = reasoning_map[rec["title"]]
                except Exception as e:
                    logger.error(f"Error parsing Gemini reasoning for recommendations: {e}")

        return top_recommendations
