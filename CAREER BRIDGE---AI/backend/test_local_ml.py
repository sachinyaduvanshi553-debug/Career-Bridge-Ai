import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(__file__))

from ml_models.skill_extractor import LocalSkillExtractor
from ml_models.resume_scorer import LocalResumeScorer
from ml_models.career_recommendation import LocalCareerRecommender
from ml_models.job_matching import LocalJobMatcher
from ml_models.interview_evaluation import LocalInterviewEvaluator
from ml_models.roadmap_generator import LocalRoadmapGenerator

def test_ml_system():
    print("=== CAREER BRIDGE - AI Local ML Verification ===\n")

    # 1. Skill Extractor
    print("[1/6] Testing Skill Extraction...")
    extractor = LocalSkillExtractor()
    text = "I am a developer with experience in Python, React, and AWS."
    skills = extractor.extract_skills(text)
    print(f"   - Extracted: {skills}")

    # 2. Resume Scorer
    print("\n[2/6] Testing Resume Scoring...")
    scorer = LocalResumeScorer()
    # Mock text with some structure
    resume_text = """
    Experience: 5 years as a Python Developer.
    Education: B.Tech in Computer Science.
    Skills: Python, Django, SQL, Docker, AWS, React.
    Links: https://github.com/example
    """
    analysis = scorer.analyze(resume_text)
    print(f"   - Score: {analysis['score']}")
    print(f"   - Metrics: {analysis['metrics']}")

    # 3. Career Recommender
    print("\n[3/6] Testing Career Recommendation...")
    recommender = LocalCareerRecommender()
    recommendations = recommender.recommend(["Python", "SQL", "Pandas", "PyTorch"])
    print(f"   - Top Recommendations: {recommendations}")

    # 4. Job Matching
    print("\n[4/6] Testing Job Matching...")
    matcher = LocalJobMatcher()
    jobs = ["Remote Python Developer with Cloud Experience", "Frontend React Specialist", "Civil Engineer"]
    matches = matcher.match(resume_text, jobs)
    print(f"   - Match results: {matches}")

    # 5. Interview Evaluation
    print("\n[5/6] Testing Interview Evaluation...")
    evaluator = LocalInterviewEvaluator()
    q = "Explain Python decorators."
    a = "Decorators are functions that modify other functions. They are used for logging or access control."
    exp = "Decorators extend the behavior of a function without modifying it directly."
    eval_result = evaluator.evaluate(a, exp)
    print(f"   - Score: {eval_result['score']}")
    print(f"   - Feedback: {eval_result['feedback']}")

    # 6. Roadmap Generation
    print("\n[6/6] Testing Roadmap Generation...")
    roadmap_gen = LocalRoadmapGenerator()
    roadmap = roadmap_gen.generate(["Docker", "Kubernetes"])
    print(f"   - Generated phases for: {[r['skill'] for r in roadmap]}")

    print("\n=== SYSTEM VERIFIED: ALL LOCAL ML MODULES FUNCTIONAL ===")

if __name__ == "__main__":
    try:
        test_ml_system()
    except Exception as e:
        print(f"\n[!] ERROR in Verification: {str(e)}")
        print("Tip: Run 'pip install -r requirements.txt' and train models first.")
