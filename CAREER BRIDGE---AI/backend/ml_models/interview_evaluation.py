from typing import Dict, Any


class LocalInterviewEvaluator:
    """
    Uses sentence-transformers for semantic similarity scoring.
    Model is loaded lazily on first use to avoid blocking server startup.
    """

    def __init__(self):
        self._model = None  # Lazy-loaded on first use

    @property
    def model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer('all-MiniLM-L6-v2')
                print("Loaded SentenceTransformer for interview evaluation.")
            except Exception as e:
                print(f"Warning: Could not load SentenceTransformer: {e}")
        return self._model

    def evaluate(self, user_answer: str, expected_answer: str) -> Dict[str, Any]:
        model = self.model
        if not model:
            # Graceful fallback without the embedding model
            return {
                "score": 65,
                "feedback": "Good attempt. Keep practising structured answers.",
                "similarity": 0.0
            }

        try:
            from sentence_transformers import util
            user_emb = model.encode(user_answer, convert_to_tensor=True)
            expected_emb = model.encode(expected_answer, convert_to_tensor=True)

            similarity = float(util.cos_sim(user_emb, expected_emb)[0])
            score = int(similarity * 100)

            if score > 80:
                feedback = "Excellent! You covered all key points with high accuracy."
            elif score > 50:
                feedback = "Good effort. You hit some key aspects, but try to be more specific and technical."
            else:
                feedback = "Needs improvement. Your answer lacks critical details found in the ideal response."

            return {
                "score": score,
                "feedback": feedback,
                "similarity": round(similarity, 2)
            }
        except Exception as e:
            print(f"Error during interview evaluation: {e}")
            return {
                "score": 65,
                "feedback": "Good attempt. Keep practising structured answers.",
                "similarity": 0.0
            }
