import spacy
import os

class LocalSkillExtractor:
    def __init__(self):
        model_path = os.path.join(os.path.dirname(__file__), "../models/skill_extractor_model")
        try:
            self.nlp = spacy.load(model_path)
            print(f"Loaded local skill extraction model from {model_path}")
        except:
            print("Warning: Local skill extraction model not found. Using blank model.")
            self.nlp = spacy.blank("en")

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
            "flutter", "react native", "swift", "kotlin", "rust", "go", "c++", "c#", "php"
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
