try:
    from ml_models.career_recommendation import LocalCareerRecommender
except ImportError:
    from ..ml_models.career_recommendation import LocalCareerRecommender
from .skill_gap_analyzer import SkillGapAnalyzer
from typing import List, Dict, Any
from .models import JobRole
from .services.gemini_service import gemini_service

class CareerRecommender:
    def __init__(self, job_roles: List[JobRole]):
        self.job_roles = job_roles
        self.recommender = LocalCareerRecommender()
        self.analyzer = SkillGapAnalyzer()

    async def recommend(self, user_skills: List[str]) -> List[Dict[str, Any]]:
        # Map current skills to predicted roles
        predicted_roles = self.recommender.recommend(user_skills)
        
        recommendations: List[Dict[str, Any]] = []
        for role in self.job_roles:
            is_predicted = role.title in predicted_roles
            analysis = await self.analyzer.analyze_gap(user_skills, role.requiredSkills)
            
            # Boost score if model predicted it
            match_score = analysis["readiness_score"]
            if is_predicted:
                match_score = min(100, match_score + 20)
                
            recommendations.append({
                "role_id": role.id,
                "title": role.title,
                "match_score": match_score,
                "matching_skills": analysis["matching_skills"],
                "missing_skills": analysis["missing_skills"],
                "salary": role.avgSalary,
                "demand": role.demandLevel,
                "growth": role.growth,
                "reasoning": f"Role analysis indicates a {match_score}% alignment with your skill profile."
            })
            
        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        top_recommendations = recommendations[:5]

        # Enhance with AI reasoning
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
                    for rec in top_recommendations:
                        if rec["title"] in reasoning_map:
                            rec["reasoning"] = reasoning_map[rec["title"]]
                except Exception as e:
                    print(f"Error parsing Gemini reasoning: {e}")

        return top_recommendations
