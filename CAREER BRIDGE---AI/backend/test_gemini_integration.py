import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv(dotenv_path='backend/.env')

from backend.app.resume_scorer import ResumeScorer
from backend.app.interview_engine import InterviewEngine
from backend.app.roadmap_generator import RoadmapGenerator
from backend.app.skill_gap_analyzer import SkillGapAnalyzer

async def test_integrations():
    print("🚀 Starting Gemini Integration Verification...\n")
    
    # 1. Resume Scorer
    print("--- Testing ResumeScorer ---")
    scorer = ResumeScorer()
    resume_text = "I am a Full Stack Developer with experience in React, Node.js, and Python. I have built several web applications."
    result = await scorer.score_resume(resume_text, "Senior Software Engineer")
    print(f"Overall Score: {result.get('overall_score')}")
    print(f"Strengths: {result.get('strengths')}")
    print(f"Suggestions: {result.get('suggestions')}")
    print("\n")

    # 2. Interview Engine
    print("--- Testing InterviewEngine ---")
    engine = InterviewEngine()
    questions = engine.get_questions("React Developer")
    print(f"Generated Questions: {questions}")
    eval_result = engine.evaluate_answer(questions[0], "React hooks are functions that let you hook into React state and lifecycle features from function components.")
    print(f"Evaluation Score: {eval_result.get('score')}")
    print(f"Feedback: {eval_result.get('feedback')}")
    print("\n")

    # 3. Roadmap Generator
    print("--- Testing RoadmapGenerator ---")
    mock_courses = [{"id": "1", "title": "Advanced React", "skill": "React", "platform": "Coursera"}]
    generator = RoadmapGenerator(mock_courses)
    roadmap = generator.generate(["Kubernetes", "Docker"])
    print(f"Roadmap Phases: {len(roadmap)}")
    for phase in roadmap:
        print(f"Phase: {phase.get('title')}, Skills: {phase.get('skills')}")
    print("\n")

    # 4. Skill Gap Analyzer
    print("--- Testing SkillGapAnalyzer ---")
    analyzer = SkillGapAnalyzer()
    gap_analysis = analyzer.analyze_gap(["Python", "JS"], ["Python", "React", "Next.js"])
    print(f"Readiness Score: {gap_analysis.get('readiness_score')}")
    print(f"Recommendations: {gap_analysis.get('recommendations')}")
    print("\n")

    print("✅ Verification Complete!")

if __name__ == "__main__":
    asyncio.run(test_integrations())
