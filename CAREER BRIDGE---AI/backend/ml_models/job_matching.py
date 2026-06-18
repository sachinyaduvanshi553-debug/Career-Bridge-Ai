from typing import List, Dict, Any


class LocalJobMatcher:
    """
    Uses sentence-transformers for semantic job matching.
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
                print("Loaded SentenceTransformer for job matching.")
            except Exception as e:
                print(f"Warning: Could not load SentenceTransformer: {e}")
        return self._model

    def match(self, resume_text: str, job_descriptions: List[str]) -> List[Dict[str, Any]]:
        model = self.model
        if not model:
            # Graceful fallback: return equal scores for all jobs
            return [{"index": i, "score": 0.5} for i in range(len(job_descriptions))]

        try:
            from sentence_transformers import util
            resume_embedding = model.encode(resume_text, convert_to_tensor=True)
            job_embeddings = model.encode(job_descriptions, convert_to_tensor=True)

            cosine_scores = util.cos_sim(resume_embedding, job_embeddings)[0]

            results = [
                {"index": i, "score": float(score)}
                for i, score in enumerate(cosine_scores)
            ]
            return sorted(results, key=lambda x: x['score'], reverse=True)
        except Exception as e:
            print(f"Error during job matching: {e}")
            return [{"index": i, "score": 0.5} for i in range(len(job_descriptions))]
