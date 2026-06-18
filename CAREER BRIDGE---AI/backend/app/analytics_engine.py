from typing import List, Dict, Any, Optional

class AnalyticsEngine:
    def __init__(self, district_data: List[Dict[str, Any]]):
        self.data = district_data

    def get_overview(self) -> Dict[str, Any]:
        total_workers = sum(d["totalWorkers"] for d in self.data)
        total_trained = sum(d["trainedWorkers"] for d in self.data)
        total_placed = sum(d["placedWorkers"] for d in self.data)
        
        # Derive top skill gaps from frequency in roles
        from collections import Counter
        all_skills = []
        for d in self.data:
            if "requiredSkills" in d:
                all_skills.extend(d["requiredSkills"])
            elif "Skills" in d: # Direct CSV row
                all_skills.extend([s.strip() for s in d["Skills"].split(",")])
        
        common_skills = [s for s, count in Counter(all_skills).most_common(5)]
        
        return {
            "totalWorkers": total_workers,
            "totalTrained": total_trained,
            "totalPlaced": total_placed,
            "placementRate": float(f"{(total_placed / total_trained * 100):.1f}") if total_trained else 0,
            "districtsCovered": len(self.data),
            "topSkillGaps": common_skills if common_skills else ["AI/ML", "Cloud Computing"]
        }

    def get_district_stats(self, state: Optional[str] = None) -> List[Dict[str, Any]]:
        if state:
            return [d for d in self.data if d["state"] == state]
        return self.data
