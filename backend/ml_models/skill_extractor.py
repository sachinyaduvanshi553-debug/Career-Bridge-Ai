import spacy
import os
import logging

logger = logging.getLogger(__name__)

class LocalSkillExtractor:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "../models/skill_extractor_model")
        self._nlp = None

    @property
    def nlp(self):
        if self._nlp is None:
            try:
                self._nlp = spacy.load(self.model_path)
                logger.info(f"Loaded local skill extraction model from {self.model_path}")
            except:
                logger.warning("Local skill extraction model not found. Attempting to load en_core_web_md...")
                try:
                    self._nlp = spacy.load("en_core_web_md")
                    logger.info("Loaded en_core_web_md successfully.")
                except:
                    logger.error("en_core_web_md not found. Using blank model.")
                    self._nlp = spacy.blank("en")
        return self._nlp

    def extract_skills(self, text: str):
        text_lower = text.lower()
        doc = self.nlp(text)
        
        # 1. NER-based extraction (from custom model)
        skills = [ent.text for ent in doc.ents if ent.label_ == "SKILL"]
        
        # 2. Comprehensive Keyword Matching (Fallback/Enhancement)
        # Expanded industry-standard skill list
        industry_skills = [
            "python", "java", "javascript", "typescript", "react", "node", "sql", "nosql",
            "aws", "docker", "kubernetes", "git", "ci/cd", "agile", "scrum", "project management",
            "data analysis", "machine learning", "deep learning", "nlp", "computer vision",
            "cloud computing", "devops", "cybersecurity", "ui/ux", "figma", "frontend", "backend",
            "fullstack", "django", "flask", "springboot", "angular", "vue", "html", "css",
            "tableau", "powerbi", "excel", "spark", "hadoop", "kafka", "mongodb", "postgresql",
            "flutter", "react native", "swift", "kotlin", "rust", "go", "c++", "c#", "php",
            "electrician", "plumber", "mechanic", "technician", "carpenter", "painter", "welder",
            "driver", "security guard", "delivery partner", "mason", "ac repair", "housekeeping"
        ]
        
        # Add found industry skills if they aren't already in the list
        for s in industry_skills:
            if s in text_lower:
                skills.append(s)
                
        return sorted(list(set(skills)))

    def extract_experience(self, text: str) -> float:
        """
        Attempts to extract years of experience using regex patterns.
        """
        import re
        patterns = [
            r'(\d+)\+?\s*years?\s*of\s*experience',
            r'(\d+)\+?\s*years?\s*exp',
            r'experience\s*of\s*(\d+)\+?\s*years?'
        ]
        years = 0.0
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            if matches:
                # Take the maximum found
                years = max(years, max(float(m) for m in matches))
        return years
