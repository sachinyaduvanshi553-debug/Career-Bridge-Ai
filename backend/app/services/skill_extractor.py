try:
    from ml_models.skill_extractor import LocalSkillExtractor
except ImportError as e:
    print(f"Warning: Could not import LocalSkillExtractor due to environment restrictions: {e}")
    LocalSkillExtractor = None

from typing import List, Dict, Any

class SkillExtractor:
    def __init__(self):
        if LocalSkillExtractor:
            try:
                self.extractor = LocalSkillExtractor()
            except Exception as e:
                print(f"Warning: Could not initialize LocalSkillExtractor: {e}")
                self.extractor = None
        else:
            self.extractor = None

    def extract_skills(self, text: str) -> List[str]:
        if self.extractor:
            return self.extractor.extract_skills(text)
        return [] # Fallback

    def extract_from_resume(self, text: str) -> Dict[str, Any]:
        skills = self.extract_skills(text)
        return {
            "skills": skills,
            "experience_years": 0, # To be improved in future iterations
            "education": "Analyzed via Local ML"
        }
