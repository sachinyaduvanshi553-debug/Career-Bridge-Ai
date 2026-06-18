// ============ SKILLS DATABASE ============
export const SKILLS_DATABASE: Record<string, string[]> = {
    "Programming": ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"],
    "Web Development": ["React", "Next.js", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap"],
    "Data Science": ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Matplotlib", "Seaborn", "Jupyter", "R", "SAS"],
    "Cloud & DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "Terraform", "CI/CD", "Linux", "Nginx"],
    "Database": ["SQL", "PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase", "Cassandra", "DynamoDB"],
    "AI/ML": ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Generative AI", "LLMs", "Prompt Engineering", "MLOps"],
    "Design": ["Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX Design", "Wireframing", "Prototyping"],
    "Business Skills": ["Project Management", "Agile", "Scrum", "Communication", "Leadership", "Problem Solving", "Critical Thinking", "Teamwork"],
    "Digital Marketing": ["SEO", "SEM", "Google Analytics", "Social Media Marketing", "Content Marketing", "Email Marketing"],
    "Blue-Collar Skills": ["Welding", "Plumbing", "Electrical Wiring", "Carpentry", "CNC Operation", "AutoCAD", "Tally", "GST Filing"],
};

// ============ JOB ROLES ============
export interface JobRole {
    id: string;
    title: string;
    category: string;
    requiredSkills: string[];
    avgSalary: string;
    demandLevel: "High" | "Medium" | "Low";
    growth: string;
    description: string;
}

export const JOB_ROLES: JobRole[] = [
    { id: "1", title: "Full Stack Developer", category: "Web Development", requiredSkills: ["JavaScript", "React", "Node.js", "MongoDB", "HTML5", "CSS3", "Git", "REST APIs"], avgSalary: "₹8-20 LPA", demandLevel: "High", growth: "+25%", description: "Build and maintain web applications end-to-end" },
    { id: "2", title: "Data Scientist", category: "Data Science", requiredSkills: ["Python", "Pandas", "Scikit-learn", "TensorFlow", "SQL", "Statistics", "Machine Learning", "Data Visualization"], avgSalary: "₹10-30 LPA", demandLevel: "High", growth: "+35%", description: "Analyze data and build predictive models" },
    { id: "3", title: "Cloud Engineer", category: "Cloud & DevOps", requiredSkills: ["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "CI/CD", "Python", "Networking"], avgSalary: "₹12-25 LPA", demandLevel: "High", growth: "+30%", description: "Design and manage cloud infrastructure" },
    { id: "4", title: "AI/ML Engineer", category: "AI/ML", requiredSkills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "NLP", "MLOps", "Mathematics"], avgSalary: "₹12-35 LPA", demandLevel: "High", growth: "+40%", description: "Build and deploy AI/ML models in production" },
    { id: "5", title: "UI/UX Designer", category: "Design", requiredSkills: ["Figma", "Adobe XD", "UI/UX Design", "Wireframing", "Prototyping", "HTML5", "CSS3", "User Research"], avgSalary: "₹6-18 LPA", demandLevel: "Medium", growth: "+20%", description: "Design intuitive user interfaces and experiences" },
    { id: "6", title: "Digital Marketing Specialist", category: "Digital Marketing", requiredSkills: ["SEO", "SEM", "Google Analytics", "Social Media Marketing", "Content Marketing", "Email Marketing", "Copywriting"], avgSalary: "₹4-12 LPA", demandLevel: "Medium", growth: "+18%", description: "Drive online growth and brand visibility" },
    { id: "7", title: "DevOps Engineer", category: "Cloud & DevOps", requiredSkills: ["Docker", "Kubernetes", "Jenkins", "AWS", "Linux", "Git", "Python", "Monitoring"], avgSalary: "₹10-25 LPA", demandLevel: "High", growth: "+28%", description: "Automate and optimize deployment pipelines" },
    { id: "8", title: "Mobile App Developer", category: "Web Development", requiredSkills: ["React Native", "Flutter", "JavaScript", "Kotlin", "Swift", "Firebase", "REST APIs", "Git"], avgSalary: "₹7-20 LPA", demandLevel: "High", growth: "+22%", description: "Build cross-platform mobile applications" },
    { id: "9", title: "Cybersecurity Analyst", category: "Cloud & DevOps", requiredSkills: ["Network Security", "Linux", "Python", "SIEM", "Penetration Testing", "Firewalls", "Incident Response", "Cryptography"], avgSalary: "₹8-22 LPA", demandLevel: "High", growth: "+32%", description: "Protect systems from cyber threats" },
    { id: "10", title: "Electrician (Skilled)", category: "Blue-Collar", requiredSkills: ["Electrical Wiring", "Circuit Design", "Safety Protocols", "PLC Programming", "Troubleshooting"], avgSalary: "₹3-8 LPA", demandLevel: "High", growth: "+15%", description: "Install and maintain electrical systems" },
    { id: "11", title: "CNC Machine Operator", category: "Blue-Collar", requiredSkills: ["CNC Operation", "AutoCAD", "Blueprint Reading", "Quality Control", "Machine Maintenance"], avgSalary: "₹3-7 LPA", demandLevel: "Medium", growth: "+12%", description: "Operate precision CNC machinery" },
    { id: "12", title: "Product Manager", category: "Business", requiredSkills: ["Project Management", "Agile", "Communication", "SQL", "Analytics", "Wireframing", "Strategy", "Stakeholder Management"], avgSalary: "₹15-40 LPA", demandLevel: "High", growth: "+23%", description: "Drive product strategy and roadmap" },
    { id: "13", title: "Backend Developer", category: "Web Development", requiredSkills: ["Python", "Django", "PostgreSQL", "REST APIs", "Docker", "Redis", "Git", "System Design"], avgSalary: "₹8-22 LPA", demandLevel: "High", growth: "+24%", description: "Build scalable server-side applications" },
    { id: "14", title: "Business Analyst", category: "Business", requiredSkills: ["SQL", "Excel", "Communication", "Problem Solving", "Tableau", "Requirements Gathering", "Agile"], avgSalary: "₹6-15 LPA", demandLevel: "Medium", growth: "+16%", description: "Bridge business needs with technical solutions" },
    { id: "15", title: "Graphic Designer", category: "Design", requiredSkills: ["Photoshop", "Illustrator", "Figma", "Typography", "Color Theory", "Branding", "Print Design"], avgSalary: "₹4-12 LPA", demandLevel: "Medium", growth: "+14%", description: "Create visual content for brands and products" },
];

// ============ COURSES ============
export interface Course {
    id: string;
    title: string;
    platform: string;
    skill: string;
    url: string;
    price: string;
    duration: string;
    rating: number;
    language: string;
}

export const COURSES: Course[] = [
    { id: "c1", title: "Python for Everybody", platform: "Coursera", skill: "Python", url: "https://coursera.org/specializations/python", price: "Free", duration: "8 months", rating: 4.8, language: "English/Hindi" },
    { id: "c2", title: "Full Stack Web Development", platform: "SWAYAM", skill: "Web Development", url: "https://swayam.gov.in", price: "Free", duration: "12 weeks", rating: 4.5, language: "Hindi" },
    { id: "c3", title: "Machine Learning Specialization", platform: "Coursera", skill: "Machine Learning", url: "https://coursera.org/specializations/machine-learning", price: "Free", duration: "3 months", rating: 4.9, language: "English" },
    { id: "c4", title: "AWS Cloud Practitioner", platform: "AWS Training", skill: "AWS", url: "https://aws.amazon.com/training", price: "Free", duration: "6 hours", rating: 4.7, language: "English" },
    { id: "c5", title: "React – The Complete Guide", platform: "Udemy", skill: "React", url: "https://udemy.com", price: "₹449", duration: "48 hours", rating: 4.7, language: "English" },
    { id: "c6", title: "Data Science with Python", platform: "NPTEL", skill: "Data Science", url: "https://nptel.ac.in", price: "Free", duration: "8 weeks", rating: 4.6, language: "English" },
    { id: "c7", title: "SQL for Data Analysis", platform: "Khan Academy", skill: "SQL", url: "https://khanacademy.org", price: "Free", duration: "4 weeks", rating: 4.5, language: "English/Hindi" },
    { id: "c8", title: "Docker & Kubernetes Mastery", platform: "Udemy", skill: "Docker", url: "https://udemy.com", price: "₹499", duration: "22 hours", rating: 4.8, language: "English" },
    { id: "c9", title: "UI/UX Design Bootcamp", platform: "Google", skill: "UI/UX Design", url: "https://grow.google/certificates", price: "Free", duration: "6 months", rating: 4.8, language: "English" },
    { id: "c10", title: "Digital Marketing Fundamentals", platform: "Google Digital Garage", skill: "Digital Marketing", url: "https://learndigital.withgoogle.com", price: "Free", duration: "40 hours", rating: 4.6, language: "English/Hindi" },
    { id: "c11", title: "Tally Prime with GST", platform: "SWAYAM", skill: "Tally", url: "https://swayam.gov.in", price: "Free", duration: "6 weeks", rating: 4.4, language: "Hindi" },
    { id: "c12", title: "Electrical Wiring Course", platform: "Skill India Portal", skill: "Electrical Wiring", url: "https://skillindia.gov.in", price: "Free", duration: "3 months", rating: 4.3, language: "Hindi" },
    { id: "c13", title: "Communication Skills", platform: "Coursera", skill: "Communication", url: "https://coursera.org", price: "Free", duration: "4 weeks", rating: 4.5, language: "English" },
    { id: "c14", title: "Generative AI for Everyone", platform: "Coursera", skill: "Generative AI", url: "https://coursera.org", price: "Free", duration: "3 weeks", rating: 4.9, language: "English" },
    { id: "c15", title: "AutoCAD Fundamentals", platform: "Autodesk", skill: "AutoCAD", url: "https://autodesk.com", price: "Free Trial", duration: "20 hours", rating: 4.5, language: "English" },
];

// ============ JOB LISTINGS ============
export interface JobListing {
    id: string;
    title: string;
    company: string;
    location: string;
    state: string;
    salary: string;
    type: string;
    skills: string[];
    posted: string;
    description: string;
    applicants: number;
}

export const JOB_LISTINGS: JobListing[] = [
    { id: "j1", title: "React Developer", company: "TCS", location: "Bangalore", state: "Karnataka", salary: "₹8-14 LPA", type: "Full-time", skills: ["React", "JavaScript", "CSS3", "Git"], posted: "2 days ago", description: "Work on enterprise React applications", applicants: 156 },
    { id: "j2", title: "Python Developer", company: "Infosys", location: "Pune", state: "Maharashtra", salary: "₹7-12 LPA", type: "Full-time", skills: ["Python", "Django", "PostgreSQL", "REST APIs"], posted: "1 day ago", description: "Build backend systems with Python", applicants: 203 },
    { id: "j3", title: "Data Analyst", company: "Wipro", location: "Hyderabad", state: "Telangana", salary: "₹6-10 LPA", type: "Full-time", skills: ["SQL", "Python", "Tableau", "Excel"], posted: "3 days ago", description: "Analyze business data and create dashboards", applicants: 178 },
    { id: "j4", title: "Cloud Engineer", company: "Amazon", location: "Bangalore", state: "Karnataka", salary: "₹18-30 LPA", type: "Full-time", skills: ["AWS", "Docker", "Kubernetes", "Linux"], posted: "1 day ago", description: "Design cloud infrastructure solutions", applicants: 89 },
    { id: "j5", title: "UI Designer", company: "Flipkart", location: "Bangalore", state: "Karnataka", salary: "₹10-18 LPA", type: "Full-time", skills: ["Figma", "UI/UX Design", "Prototyping"], posted: "5 days ago", description: "Design product interfaces", applicants: 112 },
    { id: "j6", title: "Digital Marketing Executive", company: "Zomato", location: "Gurugram", state: "Haryana", salary: "₹4-8 LPA", type: "Full-time", skills: ["SEO", "Google Analytics", "Content Marketing"], posted: "2 days ago", description: "Drive SEO and content strategies", applicants: 234 },
    { id: "j7", title: "Machine Learning Engineer", company: "Google", location: "Hyderabad", state: "Telangana", salary: "₹25-45 LPA", type: "Full-time", skills: ["Python", "TensorFlow", "MLOps", "Deep Learning"], posted: "1 day ago", description: "Build production ML systems", applicants: 67 },
    { id: "j8", title: "Full Stack Developer", company: "Razorpay", location: "Bangalore", state: "Karnataka", salary: "₹12-22 LPA", type: "Full-time", skills: ["React", "Node.js", "MongoDB", "TypeScript"], posted: "3 days ago", description: "Build fintech web applications", applicants: 145 },
    { id: "j9", title: "Electrician", company: "L&T Construction", location: "Chennai", state: "Tamil Nadu", salary: "₹3-5 LPA", type: "Full-time", skills: ["Electrical Wiring", "Safety Protocols"], posted: "1 week ago", description: "Industrial electrical installations", applicants: 45 },
    { id: "j10", title: "DevOps Engineer", company: "PhonePe", location: "Pune", state: "Maharashtra", salary: "₹14-24 LPA", type: "Full-time", skills: ["Docker", "Kubernetes", "AWS", "Jenkins"], posted: "2 days ago", description: "Manage CI/CD and cloud infrastructure", applicants: 98 },
    { id: "j11", title: "Mobile Developer", company: "Swiggy", location: "Bangalore", state: "Karnataka", salary: "₹10-20 LPA", type: "Full-time", skills: ["React Native", "JavaScript", "Firebase"], posted: "4 days ago", description: "Build cross-platform mobile apps", applicants: 132 },
    { id: "j12", title: "Business Analyst", company: "Deloitte", location: "Mumbai", state: "Maharashtra", salary: "₹8-15 LPA", type: "Full-time", skills: ["SQL", "Excel", "Communication", "Agile"], posted: "1 day ago", description: "Gather and analyze requirements", applicants: 167 },
];

// ============ INTERVIEW QUESTIONS ============
export interface InterviewQuestion {
    id: string;
    role: string;
    question: string;
    difficulty: "Easy" | "Medium" | "Hard";
    category: string;
    sampleAnswer: string;
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
    { id: "iq1", role: "Full Stack Developer", question: "Explain the difference between REST and GraphQL APIs.", difficulty: "Medium", category: "Technical", sampleAnswer: "REST uses fixed endpoints with HTTP methods, while GraphQL uses a single endpoint with flexible queries. REST can cause over/under-fetching, while GraphQL lets clients request exactly what they need." },
    { id: "iq2", role: "Full Stack Developer", question: "What is the virtual DOM in React and how does it work?", difficulty: "Easy", category: "Technical", sampleAnswer: "The virtual DOM is a lightweight copy of the actual DOM. React uses it to batch updates and only re-render changed elements, improving performance through a diffing algorithm." },
    { id: "iq3", role: "Data Scientist", question: "Explain the bias-variance tradeoff in machine learning.", difficulty: "Medium", category: "Technical", sampleAnswer: "Bias measures how far predictions are from true values (underfitting). Variance measures prediction variability (overfitting). The goal is to find the sweet spot that minimizes both." },
    { id: "iq4", role: "Data Scientist", question: "How would you handle a highly imbalanced dataset?", difficulty: "Hard", category: "Technical", sampleAnswer: "Methods include SMOTE oversampling, undersampling, using weighted loss functions, ensemble methods like balanced random forests, or evaluation metrics like F1-score and AUC-ROC instead of accuracy." },
    { id: "iq5", role: "Cloud Engineer", question: "What is the difference between horizontal and vertical scaling?", difficulty: "Easy", category: "Technical", sampleAnswer: "Vertical scaling (scale up) adds more resources to existing servers. Horizontal scaling (scale out) adds more servers. Horizontal is generally preferred for cloud applications because it provides better fault tolerance." },
    { id: "iq6", role: "General", question: "Tell me about a time you faced a challenging project deadline.", difficulty: "Medium", category: "Behavioral", sampleAnswer: "Use the STAR method: Situation, Task, Action, Result. Describe the challenge, your approach to solving it, and the positive outcome." },
    { id: "iq7", role: "General", question: "Where do you see yourself in 5 years?", difficulty: "Easy", category: "Behavioral", sampleAnswer: "Focus on growth within the field, taking on more responsibilities, leading teams, and contributing to innovative projects. Align your answer with the company's growth trajectory." },
    { id: "iq8", role: "AI/ML Engineer", question: "Explain the transformer architecture and attention mechanism.", difficulty: "Hard", category: "Technical", sampleAnswer: "Transformers use self-attention to weigh the importance of different parts of the input. Multi-head attention allows parallel processing of different representation subspaces. Key components: encoder-decoder, positional encoding, layer normalization." },
];

// ============ DISTRICT ANALYTICS ============
export interface DistrictData {
    state: string;
    district: string;
    totalWorkers: number;
    trainedWorkers: number;
    placedWorkers: number;
    topSkillGaps: string[];
    demandRoles: string[];
    trainingCenters: number;
}

export const DISTRICT_ANALYTICS: DistrictData[] = [
    { state: "Karnataka", district: "Bangalore Urban", totalWorkers: 450000, trainedWorkers: 180000, placedWorkers: 145000, topSkillGaps: ["Cloud Computing", "AI/ML", "DevOps"], demandRoles: ["Software Developer", "Data Scientist", "Cloud Engineer"], trainingCenters: 156 },
    { state: "Maharashtra", district: "Pune", totalWorkers: 380000, trainedWorkers: 152000, placedWorkers: 121000, topSkillGaps: ["Full Stack", "Cybersecurity", "Data Analysis"], demandRoles: ["Full Stack Developer", "DevOps Engineer", "Business Analyst"], trainingCenters: 132 },
    { state: "Telangana", district: "Hyderabad", totalWorkers: 320000, trainedWorkers: 140000, placedWorkers: 112000, topSkillGaps: ["AI/ML", "Cloud Computing", "Data Science"], demandRoles: ["ML Engineer", "Data Scientist", "Cloud Architect"], trainingCenters: 98 },
    { state: "Tamil Nadu", district: "Chennai", totalWorkers: 290000, trainedWorkers: 116000, placedWorkers: 93000, topSkillGaps: ["Embedded Systems", "Full Stack", "IoT"], demandRoles: ["Embedded Developer", "Web Developer", "IoT Engineer"], trainingCenters: 87 },
    { state: "Uttar Pradesh", district: "Noida", totalWorkers: 210000, trainedWorkers: 84000, placedWorkers: 63000, topSkillGaps: ["Java", "Testing", "Digital Marketing"], demandRoles: ["Java Developer", "QA Engineer", "Marketing Analyst"], trainingCenters: 65 },
    { state: "Haryana", district: "Gurugram", totalWorkers: 260000, trainedWorkers: 104000, placedWorkers: 83000, topSkillGaps: ["Finance Tech", "Data Analysis", "Product Management"], demandRoles: ["FinTech Developer", "Data Analyst", "Product Manager"], trainingCenters: 78 },
    { state: "Rajasthan", district: "Jaipur", totalWorkers: 140000, trainedWorkers: 42000, placedWorkers: 29000, topSkillGaps: ["Computer Basics", "Tally", "Welding"], demandRoles: ["Data Entry Operator", "Accountant", "Welder"], trainingCenters: 45 },
    { state: "Bihar", district: "Patna", totalWorkers: 95000, trainedWorkers: 19000, placedWorkers: 11000, topSkillGaps: ["Digital Literacy", "Tally", "Plumbing"], demandRoles: ["Office Assistant", "Accountant", "Plumber"], trainingCenters: 28 },
    { state: "Kerala", district: "Kochi", totalWorkers: 180000, trainedWorkers: 90000, placedWorkers: 72000, topSkillGaps: ["React", "Cloud Computing", "Mobile Dev"], demandRoles: ["Frontend Developer", "Cloud Engineer", "Mobile Developer"], trainingCenters: 67 },
    { state: "Gujarat", district: "Ahmedabad", totalWorkers: 220000, trainedWorkers: 77000, placedWorkers: 55000, topSkillGaps: ["CNC Operation", "AutoCAD", "Digital Marketing"], demandRoles: ["CNC Operator", "Draftsman", "Digital Marketer"], trainingCenters: 54 },
];
