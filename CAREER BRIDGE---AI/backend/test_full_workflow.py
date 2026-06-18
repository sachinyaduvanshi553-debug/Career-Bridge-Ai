import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.getcwd())

load_dotenv(dotenv_path='backend/.env')

from backend.app.resume_scorer import ResumeScorer
from backend.app.career_recommender import CareerRecommender
from backend.app.skill_gap_analyzer import SkillGapAnalyzer
from backend.app.roadmap_generator import RoadmapGenerator
from backend.app.interview_engine import InterviewEngine
from backend.app.models import JobRole

async def test_full_workflow():
    print("🚀 Starting Full Workflow Verification...\n")
    
    # Mock Roles and Courses
    mock_roles = [
        JobRole(id="1", title="Full Stack Developer", requiredSkills=["React", "Node.js", "Python"], category="Web", avgSalary="8L", demandLevel="High", growth="20%", description=""),
        JobRole(id="2", title="Data Scientist", requiredSkills=["Python", "SQL", "Machine Learning"], category="Data", avgSalary="12L", demandLevel="High", growth="30%", description="")
    ]
    mock_courses = [
        {"id": "c1", "title": "React Masterclass", "skill": "React", "platform": "Udemy"},
        {"id": "c2", "title": "Data Science Pro", "skill": "Machine Learning", "platform": "Coursera"}
    ]

    # 1. Resume Scoring
    print("--- 1. Testing Resume Analysis ---")
    scorer = ResumeScorer()
    resume_text = "I am a developer with experience in React and Node.js. I love building web apps."
    resume_result = await scorer.score_resume(resume_text, "Full Stack Developer")
    print(f"Overall Score: {resume_result.get('overall_score')}")
    print(f"Strengths: {resume_result.get('strengths')[:2]}")
    print("✅ Resume Analysis OK\n")

    # 2. Career Recommendation
    print("--- 2. Testing Career Recommendation ---")
    recommender = CareerRecommender(mock_roles)
    user_skills = ["React", "JavaScript"]
    recommendations = await recommender.recommend(user_skills)
    print(f"Top Recommendation: {recommendations[0]['title']} (Score: {recommendations[0]['match_score']})")
    print("✅ Career Recommendation OK\n")

    # 3. Skill Gap Analysis
    print("--- 3. Testing Skill Gap Analysis ---")
    gap_analyzer = SkillGapAnalyzer()
    gap_report = await gap_analyzer.analyze_gap(user_skills, ["React", "Node.js", "Docker"])
    print(f"Matching: {gap_report['matching_skills']}")
    print(f"Missing: {gap_report['missing_skills']}")
    print("✅ Skill Gap Analysis OK\n")

    # 4. Roadmap Generation
    print("--- 4. Testing Roadmap Generation ---")
    generator = RoadmapGenerator(mock_courses)
    roadmap = await generator.generate(gap_report['missing_skills'])
    print(f"Phases generated: {len(roadmap)}")
    if roadmap:
        print(f"First Phase: {roadmap[0]['title']}")
    print("✅ Roadmap Generation OK\n")

    # 5. Mock Interview
    print("--- 5. Testing Mock Interview System ---")
    engine = InterviewEngine()
    questions = await engine.get_questions("Full Stack Developer")
    print(f"Generated {len(questions)} questions.")
    if questions:
        print(f"Sample Question: {questions[0]}")
        evaluation = await engine.evaluate_answer(questions[0], "React is a JavaScript library for building user interfaces.")
        print(f"Evaluation Score: {evaluation.get('score')}")
    print("✅ Interview System OK\n")

    print("⭐ FULL WORKFLOW VERIFICATION COMPLETE! ⭐")

if __name__ == "__main__":
    asyncio.run(test_full_workflow())
