import joblib
import os
from typing import List


class LocalCareerRecommender:
    """
    Uses joblib to load pre-trained models for career recommendation.
    """

    def __init__(self):
        models_dir = os.path.join(os.path.dirname(__file__), "../models")
        self.model = None
        self.mlb = None
        try:
            model_path = os.path.join(models_dir, "career_recommendation_model.joblib")
            mlb_path = os.path.join(models_dir, "skills_binarizer.joblib")
            
            if os.path.exists(model_path) and os.path.exists(mlb_path):
                self.model = joblib.load(model_path)
                self.mlb = joblib.load(mlb_path)
                print("Loaded career recommendation models successfully.")
            else:
                pass
        except Exception:
            pass

    def recommend(self, skills: List[str]) -> List[str]:
        if not self.model or not self.mlb:
            return []

        try:
            # Transform input skills
            X = self.mlb.transform([skills])

            # Get probabilities
            probs = self.model.predict_proba(X)

            import numpy as np
            if isinstance(probs, list):  # Multi-label handle
                prediction = self.model.predict(X)[0]
                return [prediction]
            else:
                top_indices = np.argsort(probs[0])[-3:][::-1]
                return [self.model.classes_[i] for i in top_indices if probs[0][i] > 0.1]
        except Exception as e:
            print(f"Error during career recommendation: {e}")
            return []
