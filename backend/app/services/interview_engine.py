import os
import csv
import random
import logging
from typing import List, Dict, Any, Optional
try:
    from ml_models.interview_evaluation import LocalInterviewEvaluator
except (ImportError, ValueError):
    try:
        from ..ml_models.interview_evaluation import LocalInterviewEvaluator
    except ImportError:
        LocalInterviewEvaluator = None

from .gemini_service import gemini_service

logger = logging.getLogger(__name__)

class InterviewEngine:
    def __init__(self, api_key: Optional[str] = None):
        if LocalInterviewEvaluator:
            try:
                self.evaluator = LocalInterviewEvaluator()
            except Exception as e:
                logger.warning(f"Could not initialize LocalInterviewEvaluator: {e}")
                self.evaluator = None
        else:
            self.evaluator = None
            
        self.questions_db = self._load_questions()
        self._embedding_model = None

    @property
    def embedding_model(self):
        """Lazy loader for high-performance sentence embeddings locally."""
        if self._embedding_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            except (ImportError, Exception) as e:
                logger.warning(f"Could not load embedding model for InterviewEngine: {e}")
        return self._embedding_model

    def _load_questions(self) -> List[Dict[str, str]]:
        """Loads specialized career dataset for dynamic mock interviews."""
        data_path = os.path.join(os.path.dirname(__file__), "../../data/interview_qa_dataset.csv")
        db = []
        try:
            if os.path.exists(data_path):
                logger.info(f"💾 Loading interview questions from local dataset.")
                with open(data_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        db.append({
                            "role": row["Role"],
                            "question": row["Question"],
                            "ideal_answer": row["Ideal_Answer"]
                        })
        except Exception as e:
            logger.warning(f"⚠️ Could not load interview_qa_dataset.csv: {e}")
        return db

    async def get_questions(self, role: str) -> List[str]:
        """
        Retrieves top-tier interview questions.
        Uses cached Gemini 2.0 and falls back to semantic local lookup.
        """
        # Try Gemini first for high-quality variety
        prompt = f"Generate 5 interview questions for a {role}. Return JSON list."
        ai_response = await gemini_service.generate_ai_response(prompt)
        if ai_response:
            try:
                questions = gemini_service.parse_json_response(ai_response)
                if isinstance(questions, list) and len(questions) > 0:
                    return questions
            except: pass

        # Semantic fallback to local DB
        if not self.questions_db: 
            return ["Tell me about your experience in this role."]
        
        model = self.embedding_model
        if model:
            try:
                from sentence_transformers import util
                import torch
                
                # Semantic search for role-specific questions
                unique_roles = list(set(q["role"] for q in self.questions_db))
                role_embeddings = model.encode(unique_roles, convert_to_tensor=True)
                target_embedding = model.encode(role, convert_to_tensor=True)
                
                hits = util.semantic_search(target_embedding, role_embeddings, top_k=5)[0]
                best_roles = [unique_roles[hit['corpus_id']] for hit in hits]
                
                relevant_questions = [q["question"] for q in self.questions_db if q["role"] in best_roles]
                if relevant_questions:
                    return random.sample(relevant_questions, min(5, len(relevant_questions)))
            except Exception as e:
                logger.error(f"Semantic fallback failed: {e}")

        # String matching fallback
        role_questions = [q["question"] for q in self.questions_db if role.lower() in str(q.get("role", "")).lower()]
        if not role_questions:
            role_questions = [q["question"] for q in self.questions_db]
            
        return random.sample(role_questions, min(5, len(role_questions))) if role_questions else ["Tell me about yourself."]

    async def evaluate_answer(self, question: str, answer: str) -> Dict[str, Any]:
        """
        Evaluates answers using modern rubric logic.
        Combines AI qualitative analysis with local quantitative scoring.
        """
        prompt = f"""
        Evaluate the following interview answer.
        Question: {question}
        User Answer: {answer}
        
        Provide the evaluation in JSON format with the following keys:
        - score: (0-100)
        - feedback: (Detailed feedback)
        - improvements: [List of specific points]
        - ideal_answer: (Sample ideal answer)
        
        ONLY return the JSON object.
        """
        
        ai_response = await gemini_service.generate_ai_response(prompt)
        if ai_response:
            try:
                ai_data = gemini_service.parse_json_response(ai_response)
                if ai_data:
                    return {
                        "score": ai_data.get("score", 70),
                        "feedback": ai_data.get("feedback", "Good attempt."),
                        "improvements": ai_data.get("improvements", []),
                        "ideal_answer": ai_data.get("ideal_answer", "")
                    }
            except Exception as e:
                logger.error(f"Error parsing Gemini evaluation: {e}")

        # Fallback to local evaluator
        ideal = next((q["ideal_answer"] for q in self.questions_db if q["question"] == question), "Focus on technical accuracy and communication.")
        if self.evaluator:
            try:
                return self.evaluator.evaluate(answer, ideal)
            except: pass
            
        return {"score": 50, "feedback": "Evaluation unavailable.", "improvements": [], "ideal_answer": ideal}
