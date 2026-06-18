from ml_models.skill_extractor import LocalSkillExtractor
from typing import List, Dict, Any

class SkillExtractor:
    def __init__(self):
        self.extractor = LocalSkillExtractor()

    def extract_skills(self, text: str) -> List[str]:
        return self.extractor.extract_skills(text)

    def extract_from_resume(self, text: str) -> Dict[str, Any]:
        skills = self.extract_skills(text)
        return {
            "skills": skills,
            "experience_years": 0, # To be improved in future iterations
            "education": "Analyzed via Local ML"
        }
