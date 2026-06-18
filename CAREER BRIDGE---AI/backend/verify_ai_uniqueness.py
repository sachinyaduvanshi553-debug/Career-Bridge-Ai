import requests
import os

API_URL = "http://localhost:8001/api"

def test_resume_uniqueness():
    resumes = [
        "I am a Python developer with 5 years of experience in Django and Flask. I also know SQL and Docker.",
        "I am a Senior Frontend Engineer specialized in React, Next.js, and TypeScript. I love building beautiful UIs."
    ]
    
    results = []
    for i, r in enumerate(resumes):
        print(f"Testing resume {i+1}...")
        # Creation of a temporary text file to simulate upload
        with open(f"resume_{i}.txt", "w") as f:
            f.write(r)
        
        with open(f"resume_{i}.txt", "rb") as f:
            response = requests.post(f"{API_URL}/resume/analyze", files={"file": f})
            if response.status_code == 200:
                results.append(response.json())
                print(f"Score: {response.json().get('overall_score')}")
            else:
                print(f"Error: {response.status_code} - {response.text}")
        
        os.remove(f"resume_{i}.txt")

    if len(results) == 2:
        if results[0]['overall_score'] != results[1]['overall_score'] or results[0]['extracted_skills'] != results[1]['extracted_skills']:
            print("SUCCESS: Resumes were analyzed uniquely!")
        else:
            print("WARNING: Resumes received identical analysis. Check AI logic.")
    else:
        print("Test failed to get results.")

if __name__ == "__main__":
    try:
        test_resume_uniqueness()
    except Exception as e:
        print(f"Test crashed: {e}")
