import os
import csv
import random
import json

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
os.makedirs(DATA_DIR, exist_ok=True)

# Vocabularies
ROLES = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Data Analyst", "Machine Learning Engineer", "DevOps Engineer",
    "Cloud Architect", "UI/UX Designer", "Product Manager", "QA Engineer",
    "Security Analyst", "Database Administrator", "Mobile App Developer",
    "Game Developer", "System Administrator", "Network Engineer", "Blockchain Developer",
    "AI Researcher", "Data Engineer", "Site Reliability Engineer", "Scrum Master",
    "Technical Writer", "IT Support Specialist", "Business Analyst", "Marketing Specialist",
    "Sales Executive", "HR Manager", "Content Creator", "Graphic Designer", "Video Editor",
    "SEO Specialist", "Digital Marketer", "Accountant", "Financial Analyst",
    "Operations Manager", "Customer Success Manager", "Technical Recruiter", "Legal Advisor"
]

SKILLS_TECH = ["Python", "JavaScript", "Java", "C++", "C#", "Ruby", "Go", "Rust", "TypeScript", "Swift", "Kotlin", "PHP", "HTML", "CSS", "React", "Angular", "Vue.js", "Node.js", "Django", "Flask", "Spring Boot", "Ruby on Rails", "Express.js", "ASP.NET", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Terraform", "Ansible", "Jenkins", "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Agile", "Scrum", "Kanban", "Linux", "Windows", "MacOS", "Bash", "PowerShell", "Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Data Analysis", "Data Visualization", "Pandas", "NumPy", "Scikit", "TensorFlow", "PyTorch", "Tableau", "Power BI", "Excel", "Cybersecurity", "Network Security", "Cryptography", "Penetration Testing", "Blockchain", "Smart Contracts", "Ethereum", "Solidity", "UI Design", "UX Design", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator"]

CATEGORIES = ["IT/Software", "Data Science", "Design", "Business", "Marketing", "Finance", "Operations", "HR"]
LOCATIONS = ["Bangalore", "Pune", "Hyderabad", "Chennai", "Delhi NCR", "Mumbai", "Remote", "New York", "London", "San Francisco"]

def generate_resume_dataset(num_rows=25000):
    filepath = os.path.join(DATA_DIR, "resume_dataset.csv")
    print(f"Generating {num_rows} resume records...", flush=True)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Word_Count", "Section_Count", "Has_Links", "Skill_Count", "ATS_Score"])
        for _ in range(num_rows):
            word_count = random.randint(150, 1000)
            section_count = random.randint(2, 7)
            has_links = random.choice([0, 1])
            skill_count = random.randint(3, 25)
            base_score = 40 + (skill_count * 1.5) + (section_count * 3) + (has_links * 5) + (min(word_count, 600) * 0.02)
            noise = random.uniform(-5, 5)
            score = max(0.0, min(100.0, float(base_score + noise)))
            writer.writerow([word_count, section_count, has_links, skill_count, float(f"{score:.1f}")])
    print(f"Saved {filepath}", flush=True)

def generate_skills_roles_dataset(num_rows=25000):
    filepath = os.path.join(DATA_DIR, "skills_roles_dataset.csv")
    print(f"Generating {num_rows} skills/roles records...", flush=True)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Role", "Skills", "Category", "AverageSalary", "Location", "DemandLevel"])
        for _ in range(num_rows):
            role = random.choice(ROLES)
            skills = ",".join(random.sample(SKILLS_TECH, random.randint(3, 12)))
            writer.writerow([role, skills, random.choice(CATEGORIES), f"₹{random.randint(4, 55)} LPA", random.choice(LOCATIONS), random.choice(["Low", "Medium", "High", "Very High"])])
    print(f"Saved {filepath}", flush=True)

def generate_roadmaps_dataset(num_rows=25000):
    filepath = os.path.join(DATA_DIR, "roadmaps_dataset.csv")
    print(f"Generating {num_rows} roadmap records...", flush=True)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Role", "Skill", "Roadmap_Steps"])
        for _ in range(num_rows):
            role = random.choice(ROLES)
            skill = random.choice(SKILLS_TECH)
            steps = [f"Days 1-15: {skill} Fundamentals for {role}", f"Days 16-30: Core logic", f"Days 31-60: Advanced Patterns", f"Days 61-90: Deployment"]
            writer.writerow([role, skill, json.dumps(steps)])
    print(f"Saved {filepath}", flush=True)

def generate_interview_dataset(num_rows=25000):
    filepath = os.path.join(DATA_DIR, "interview_qa_dataset.csv")
    print(f"Generating {num_rows} interview records...", flush=True)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Role", "Question", "Ideal_Answer"])
        for _ in range(num_rows):
            role = random.choice(ROLES)
            skill = random.choice(SKILLS_TECH)
            q = f"How would you handle {skill} in a {role} context?"
            ans = f"In {role} roles, mastering {skill} involves deep understanding of performance and design."
            writer.writerow([role, q, ans])
    print(f"Saved {filepath}", flush=True)

if __name__ == "__main__":
    print("Starting Minimal Baseline: 100 rows per dataset...", flush=True)
    generate_resume_dataset(100)
    generate_skills_roles_dataset(100)
    generate_roadmaps_dataset(100)
    generate_interview_dataset(100)
    print("SUCCESS: 400 rows generated.", flush=True)
