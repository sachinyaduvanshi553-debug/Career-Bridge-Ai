import json
import os

# Create data directory if not exists
# (Already done in run_command)

# Mock Data to be written to JSON files
SKILLS_DB = {
    "Programming": ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"],
    "Web Development": ["React", "Next.js", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap"],
    "Data Science": ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Matplotlib", "Seaborn", "Jupyter", "R", "SAS"]
}

JOB_ROLES = [
    {
        "id": "1", "title": "Full Stack Developer", "category": "Web Development",
        "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB", "HTML5", "CSS3", "Git", "REST APIs"],
        "avgSalary": "₹8-20 LPA", "demandLevel": "High", "growth": "+25%",
        "description": "Build and maintain web applications end-to-end"
    },
    {
        "id": "2", "title": "Data Scientist", "category": "Data Science",
        "requiredSkills": ["Python", "Pandas", "Scikit-learn", "TensorFlow", "SQL", "Statistics", "Machine Learning", "Data Visualization"],
        "avgSalary": "₹10-30 LPA", "demandLevel": "High", "growth": "+35%",
        "description": "Analyze data and build predictive models"
    }
]

# We'll just write these two for now, we can add more later
with open('backend/data/skills.json', 'w') as f:
    json.dump(SKILLS_DB, f, indent=4)

with open('backend/data/roles.json', 'w') as f:
    json.dump(JOB_ROLES, f, indent=4)
