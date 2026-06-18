import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_health():
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {r.status_code} - {r.json()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")

def test_recommendations():
    try:
        r = requests.get(f"{BASE_URL}/career/recommend?skills=React,Python,JavaScript")
        print(f"Recommendations: {r.status_code}")
        print(json.dumps(r.json()[:2], indent=2))
    except Exception as e:
        print(f"Recommendations Failed: {e}")

def test_gap_analysis():
    try:
        payload = {"user_skills": ["React", "JavaScript"], "role_id": "1"}
        r = requests.post(f"{BASE_URL}/skills/gap", json=payload)
        print(f"Gap Analysis: {r.status_code}")
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print(f"Gap Analysis Failed: {e}")

if __name__ == "__main__":
    print("Testing CAREER BRIDGE - AI backend...")
    test_health()
    test_recommendations()
    test_gap_analysis()
