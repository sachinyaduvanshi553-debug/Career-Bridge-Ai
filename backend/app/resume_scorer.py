try:
    from ml_models.resume_scorer import LocalResumeScorer
except ImportError:
    try:
        from ..ml_models.resume_scorer import LocalResumeScorer
    except ImportError as e:
        print(f"Warning: Could not import LocalResumeScorer due to environment restrictions: {e}")
        LocalResumeScorer = None

from typing import List, Dict, Any, Optional
from .services.gemini_service import gemini_service

class ResumeScorer:
    def __init__(self, roles_db: Optional[List[Any]] = None):
        if LocalResumeScorer:
            try:
                self.scorer = LocalResumeScorer()
            except Exception as e:
                print(f"Warning: Could not initialize LocalResumeScorer: {e}")
                self.scorer = None
        else:
            self.scorer = None
        self.roles_db = roles_db

    async def score_resume(self, resume_text: str, target_role: Optional[str] = None) -> Dict[str, Any]:
        target_skills = None
        roles = self.roles_db
        if target_role and roles:
            tr_lower = target_role.lower()
            # Find the best match for the target role in our DB
            role_match = next((r for r in roles if r.title.lower() == tr_lower), None)
            if role_match:
                target_skills = role_match.requiredSkills
            else:
                # Fallback to broad match
                role_match = next((r for r in roles if tr_lower in r.title.lower()), None)
                if role_match:
                    target_skills = role_match.requiredSkills

        # Get local analysis with semantic mapping
        if self.scorer:
            try:
                local_analysis = self.scorer.analyze(resume_text, target_skills=target_skills)
            except Exception as e:
                print(f"Warning: Scoring failed: {e}")
                local_analysis = {"score": 50, "skills": [], "feedback": ["AI engines temporarily limited by application policy."], "metrics": {}}
        else:
            local_analysis = {"score": 50, "skills": [], "feedback": ["AI engines temporarily limited by application policy."], "metrics": {}}
        
        # Enhance with Gemini if available
        skills_str = ', '.join(target_skills) if target_skills else 'General industry standards'
        prompt = f"""
        Analyze this resume for the target role: {target_role if target_role else 'General'}.
        Target Skills to match: {skills_str}
        
        Resume Text:
        {resume_text}
        
        Provide your analysis in JSON format with the following keys:
        - overall_score: (0-100)
        - keyword_match: (0-100)
        - strengths: [list of strengths]
        - missing_keywords: [list of missing keywords or skills]
        - qualitative_feedback: [detailed suggestions for improvement]
        
        ONLY return the JSON object.
        """
        
        ai_response = await gemini_service.generate_ai_response(prompt)
        if ai_response:
            try:
                ai_data = gemini_service.parse_json_response(ai_response)
                return {
                    "overall_score": ai_data.get("overall_score", local_analysis["score"]),
                    "keyword_match": ai_data.get("keyword_match", local_analysis["metrics"].get("semantic_match", local_analysis["score"])),
                    "section_analysis": local_analysis.get("section_analysis", []),
                    "suggestions": [ai_data.get("qualitative_feedback")] if isinstance(ai_data.get("qualitative_feedback"), str) else ai_data.get("qualitative_feedback", local_analysis["feedback"]),
                    "strengths": ai_data.get("strengths", local_analysis.get("strengths", ["Clear structure"])),
                    "extracted_skills": local_analysis["skills"],
                    "missing_keywords": ai_data.get("missing_keywords", local_analysis["feedback"])
                }
            except Exception as e:
                print(f"Error parsing Gemini response for resume: {e}")
        
        # Fallback to local analysis
        return {
            "overall_score": local_analysis["score"],
            "keyword_match": local_analysis["metrics"].get("semantic_match", local_analysis["score"]),
            "section_analysis": local_analysis.get("section_analysis", []),
            "suggestions": local_analysis["feedback"],
            "strengths": local_analysis.get("strengths", ["Clear structure"]),
            "extracted_skills": local_analysis["skills"],
            "missing_keywords": local_analysis["feedback"]
        }
