import joblib
import os
import spacy
from typing import Dict, Any, List, Optional

class LocalResumeScorer:
    def __init__(self):
        # We use spacy and semantic transformers instead of the legacy joblib model
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("Loaded spacy model en_core_web_sm")
        except Exception as e:
            print(f"Warning: en_core_web_sm not found ({e}). Using blank 'en' model.")
            self.nlp = spacy.blank("en")

        from .skill_extractor import LocalSkillExtractor
        self.extractor = LocalSkillExtractor()
        
        self._semantic_model = None  # Lazy-load

    @property
    def semantic_model(self):
        if self._semantic_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._semantic_model = SentenceTransformer('paraphrase-MiniLM-L3-v2')
                print("Loaded SentenceTransformer for semantic scoring.")
            except Exception as e:
                print(f"Warning: Could not load SentenceTransformer: {e}")
        return self._semantic_model

    def analyze(self, text: str, target_skills: Optional[List[str]] = None) -> Dict[str, Any]:
        doc = self.nlp(text)
        
        # 1. Feature extraction
        word_count = len(text.split())
        sections = ["experience", "education", "skills", "projects", "certifications"]
        section_count = sum(1 for s in sections if s in text.lower())
        has_links = 1 if ("http" in text or "www" in text) else 0
        
        # 2. Skill extraction and Experience
        skills = self.extractor.extract_skills(text)
        experience_years = self.extractor.extract_experience(text)
        
        # 3. Semantic Similarity Score (Primary ML Logic)
        semantic_score = 0.0
        if self.semantic_model and target_skills:
            try:
                from sentence_transformers import util
                import torch
                
                # Encode user skills and target skills
                user_emb = self.semantic_model.encode(skills, convert_to_tensor=True)
                target_emb = self.semantic_model.encode(target_skills, convert_to_tensor=True)
                
                # Cross-similarity
                cos_sim = util.cos_sim(user_emb, target_emb)
                # Max similarity for each target skill
                best_matches = torch.max(cos_sim, dim=1)[0]
                semantic_score = float(torch.mean(best_matches).item()) * 100
            except Exception as e:
                print(f"Semantic scoring failed: {e}")
                semantic_score = (len(set(skills) & set(target_skills)) / len(target_skills) * 100) if target_skills else 60
        
        # 4. Final Weighted Score
        # Weighting: 60% Semantic Match, 20% Skill Variety, 10% Structure, 10% Experience
        skill_variety_score = min(100, len(skills) * 5)
        structure_score = (section_count / 5) * 100
        experience_score = min(100, experience_years * 10)
        
        if target_skills:
            final_score = (semantic_score * 0.6) + (skill_variety_score * 0.2) + (structure_score * 0.1) + (experience_score * 0.1)
        else:
            # General score if no target role
            final_score = (skill_variety_score * 0.5) + (structure_score * 0.3) + (experience_score * 0.2)

        return {
            "score": round(final_score, 1),
            "skills": skills,
            "experience_years": experience_years,
            "metrics": {
                "word_count": word_count,
                "section_count": section_count,
                "has_links": bool(has_links),
                "semantic_match": round(semantic_score, 1) if target_skills else "N/A"
            },
            "section_analysis": self._analyze_sections(text),
            "feedback": self._generate_feedback(final_score, len(skills), section_count, semantic_score if target_skills else None)
        }

    def _analyze_sections(self, text):
        text_lower = text.lower()
        sections = [
            {"section": "Contact Information", "keywords": ["phone", "email", "address", "linkedin", "github"]},
            {"section": "Professional Summary", "keywords": ["summary", "profile", "objective"]},
            {"section": "Work Experience", "keywords": ["experience", "employment", "history", "work"]},
            {"section": "Skills", "keywords": ["skills", "technologies", "competencies"]},
            {"section": "Education", "keywords": ["education", "university", "college", "degree"]}
        ]
        
        analysis = []
        for s in sections:
            found = any(k in text_lower for k in s["keywords"])
            analysis.append({
                "section": s["section"],
                "score": 100 if found else 0,
                "feedback": f"Great! {s['section']} found." if found else f"Missing {s['section']} section."
            })
        return analysis

    def _generate_feedback(self, score, skill_count, section_count, semantic_score=None):
        feedback = []
        if score < 60:
            feedback.append("Your resume needs significant improvement in content and formatting.")
        if semantic_score is not None and semantic_score < 50:
            feedback.append("Major skill gaps identified for your target role. Check the Roadmap Builder.")
        if skill_count < 8:
            feedback.append("Include more technical keywords to pass automated screening (ATS).")
        if section_count < 4:
            feedback.append("Add missing sections like 'Projects' or 'Certifications' to showcase your depth.")
        
        if not feedback:
            feedback.append("Excellent resume! It shows strong alignment with industry standards.")
            
        return feedback
