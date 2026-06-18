import os
import csv
import random
from typing import List, Dict, Any, Optional
try:
    from ml_models.interview_evaluation import LocalInterviewEvaluator
except (ImportError, ValueError):
    from ..ml_models.interview_evaluation import LocalInterviewEvaluator

import logging
from .services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

class InterviewEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.evaluator = LocalInterviewEvaluator()
        self.questions_db = self._load_questions()
        self._embedding_model = None

    @property
    def embedding_model(self):
        if self._embedding_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            except (ImportError, Exception) as e:
                logger.warning(f"Could not load embedding model for InterviewEngine: {e}")
        return self._embedding_model

    def _load_questions(self) -> List[Dict[str, str]]:
        # Same as before, but ensure it's robust
        data_path = os.path.join(os.path.dirname(__file__), "../data/interview_qa_dataset.csv")
        db = []
        try:
            if os.path.exists(data_path):
                logger.info(f"Loading interview questions from {data_path}")
                with open(data_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        db.append({
                            "role": row["Role"],
                            "question": row["Question"],
                            "ideal_answer": row["Ideal_Answer"]
                        })
        except Exception as e:
            logger.warning(f"Could not load interview_qa_dataset.csv: {e}")
        return db

    async def get_questions(self, role: str) -> List[str]:
        # Try Gemini first for high-quality variety
        prompt = f"""Generate 5 interview questions for a {role}. Return JSON list."""
        ai_response = await gemini_service.generate_ai_response(prompt)
        if ai_response:
            try:
                questions = gemini_service.parse_json_response(ai_response)
                if isinstance(questions, list) and len(questions) > 0:
                    return questions
            except: pass

        # Semantic fallback to 100k+ local DB
        if not self.questions_db: return ["Tell me about your experience in this role."]
        
        model = self.embedding_model
        if model:
            try:
                from sentence_transformers import util
                import torch
                
                # Get unique roles to speed up matching
                unique_roles = list(set(q["role"] for q in self.questions_db))
                role_embeddings = model.encode(unique_roles, convert_to_tensor=True)
                target_embedding = model.encode(role, convert_to_tensor=True)
                
                # Find most similar roles
                hits = util.semantic_search(target_embedding, role_embeddings, top_k=5)[0]
                best_roles = [unique_roles[hit['corpus_id']] for hit in hits]
                
                # Filter questions from these roles
                relevant_questions = [q["question"] for q in self.questions_db if q["role"] in best_roles]
                if relevant_questions:
                    return random.sample(relevant_questions, min(5, len(relevant_questions)))
            except Exception as e:
                print(f"Semantic fallback failed: {e}")

        # Final string matching fallback
        role_questions = [q["question"] for q in self.questions_db if role.lower() in str(q.get("role", "")).lower()]
        if not role_questions:
            role_questions = [q["question"] for q in self.questions_db]
            
        if not role_questions: return ["Tell me about your experience in this role."]
        return random.sample(role_questions, min(5, len(role_questions)))

    async def evaluate_answer(self, question: str, answer: str) -> Dict[str, Any]:
        # Use Gemini for high-quality evaluation
        prompt = f"""
        Evaluate the following interview answer.
        
        Question: {question}
        User Answer: {answer}
        
        Provide the evaluation in JSON format with the following keys:
        - score: (0-100)
        - feedback: (Detailed feedback on the answer)
        - improvements: [List of specific points to improve]
        - ideal_answer: (A sample high-quality answer)
        
        ONLY return the JSON object.
        """
        
        ai_response = await gemini_service.generate_ai_response(prompt)
        if ai_response:
            try:
                ai_data = gemini_service.parse_json_response(ai_response)
                return {
                    "score": ai_data.get("score", 70),
                    "feedback": ai_data.get("feedback", "Good attempt."),
                    "improvements": ai_data.get("improvements", []),
                    "ideal_answer": ai_data.get("ideal_answer", "")
                }
            except Exception as e:
                print(f"Error parsing Gemini response for evaluation: {e}")

        # Fallback to local evaluator
        # Find the ideal answer in our DB if it exists
        ideal = next((q["ideal_answer"] for q in self.questions_db if q["question"] == question), "In a production environment, focus on scalability, error handling, and best practices.")
        return self.evaluator.evaluate(answer, ideal)
