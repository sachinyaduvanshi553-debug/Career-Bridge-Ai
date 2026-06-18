import os
import csv
import json
import random
from typing import List, Dict, Any, Optional

class LocalRoadmapGenerator:
    def __init__(self):
        self.roadmaps = self._load_from_dataset()
        self._embedding_model = None

    @property
    def embedding_model(self):
        if self._embedding_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                print(f"Warning: Could not load embedding model for RoadmapGenerator: {e}")
        return self._embedding_model

    def _load_from_dataset(self) -> List[Dict[str, Any]]:
        data_path = os.path.join(os.path.dirname(__file__), "../../data/roadmaps_dataset.csv")
        roadmaps = []
        try:
            if os.path.exists(data_path):
                with open(data_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        roadmaps.append({
                            "role": row["Role"],
                            "skill": row["Skill"],
                            "steps": json.loads(row["Roadmap_Steps"])
                        })
            return roadmaps
        except Exception as e:
            print(f"Warning: Could not load roadmaps_dataset.csv: {e}. Using fallback.")
            return []

    def generate(self, missing_skills: List[str], target_role: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        default_steps = [
            "Week 1: Introduction to {skill} Fundamentals",
            "Week 2: Intermediate {skill} Concepts and Implementation",
            "Week 3: Advanced {skill} Patterns and Best Practices",
            "Week 4: Final {skill} Project and Skill Mastery"
        ]
        
        model = self.embedding_model
        
        for skill in missing_skills:
            skill_lower = skill.lower()
            match = None
            
            if model and self.roadmaps:
                try:
                    from sentence_transformers import util
                    import torch
                    
                    # We want to match the skill primarily against the database
                    unique_roadmaps = self.roadmaps
                    roadmap_skills = [r["skill"] for r in unique_roadmaps]
                    
                    roadmap_embeddings = model.encode(roadmap_skills, convert_to_tensor=True)
                    target_embedding = model.encode(skill, convert_to_tensor=True)
                    
                    # Semantic search for the most relevant roadmap
                    hits = util.semantic_search(target_embedding, roadmap_embeddings, top_k=5)[0]
                    
                    # Find the best match that also considers the target role if provided
                    if target_role is not None:
                        tr_lower = str(target_role).lower()
                        for hit in hits:
                            candidate = unique_roadmaps[hit['corpus_id']]
                            if tr_lower in candidate["role"].lower():
                                match = candidate
                                break
                    
                    # Fallback to the top semantic hit if no role match
                    if not match and hits:
                        match = unique_roadmaps[hits[0]['corpus_id']]
                        
                except Exception as e:
                    print(f"Semantic roadmap match failed: {e}")

            if not match:
                # Basic string fallback
                match = next((r for r in self.roadmaps if r["skill"].lower() == skill_lower), None)
            
            if match:
                results.append({
                    "skill": skill,
                    "steps": match["steps"],
                    "source": "Global Dataset"
                })
            else:
                results.append({
                    "skill": skill,
                    "steps": [s.replace("{skill}", skill) for s in default_steps],
                    "source": "AI Generated"
                })
                
        return results
