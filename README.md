<div align="center">
  <a href="#">
    <img src="logo.png" alt="Career Bridge AI Logo" width="180" style="border-radius: 50%; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-bottom: 20px; transition: transform 0.3s ease-in-out;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"/>
  </a>
  <h1 align="center" style="font-family: 'Inter', sans-serif; font-size: 3.5em; color: #1a202c; margin-bottom: 10px; font-weight: 800; letter-spacing: -1px;">
    CAREER BRIDGE - AI <span style="display:inline-block; animation: wave 2s infinite;">🚀</span>
  </h1>
  <p align="center" style="font-size: 1.3em; color: #4a5568; font-weight: 400; max-width: 600px; margin: 0 auto; line-height: 1.6;">
    Empowering the future workforce with AI-driven career intelligence, modern UI, and intelligent insights.
  </p>

  <br />

  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
    <a href="https://framer.com/motion/"><img src="https://img.shields.io/badge/Animation-Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" /></a>
  </p>
</div>

<br/>

<hr style="border: 1px solid #e2e8f0; border-radius: 5px;"/>

## 🌟 About The Project

**CAREER BRIDGE - AI** is a transformative platform designed to bridge the "Skill-to-Job" gap. Utilizing the power of **Google Gemini** and **spaCy-driven NLP**, we provide personalized career guidance, resume scoring, mock interview coaching, and localized career roadmaps to job seekers worldwide.

<details open>
<summary><strong style="font-size: 1.2em; cursor: pointer;">✨ Reveal Key Features</strong></summary>
<br>

| Feature | Description |
|---------|-------------|
| 📑 **ATS 2.0 Resume Scorer** | AI-driven analysis of resumes to identify missing keywords and provide actionable feedback, ensuring higher ATS compatibility. |
| 🗺️ **30/60/90 Day Roadmaps** | Dynamically generated, structured learning paths with automated resource mapping based on current skills and target roles. |
| 🎙️ **AI Interview Coach** | Simulates interviews and offers real-time feedback on technical proficiency, confidence, and soft skills using Gemini AI. |
| 📊 **Workforce Analytics** | Predictive heatmaps and demand-supply deficit trackers designed for educational institutions, NGOs, and government planning. |

</details>

---

## 🎨 Detailed Design, Modern Animations & Smooth Transitions

To deliver a world-class user experience, **CAREER BRIDGE - AI** heavily emphasizes UI/UX through modern styling techniques and performant animations.

### 1. Fancy Styling & Theming (Tailwind CSS)
- **Glassmorphism:** We utilize backdrop-blur filters, semi-transparent backgrounds, and subtle borders to create depth and modern glass-like aesthetics for cards and modals.
- **Dark/Light Mode Ready:** Built with semantic color tokens ensuring smooth transitions between themes without jarring flashes.
- **Typography:** Leveraging variable fonts (like Inter) with tight letter-spacing for headings and relaxed line-heights for body text, ensuring high readability and a sleek look.

### 2. Modern Animations (Framer Motion)
- **Page Transitions:** Every route change is wrapped in AnimatePresence, providing fade-in, slide-up, and scale-out transitions that make navigation feel fluid and app-like.
- **Micro-interactions:** Buttons and actionable items have `whileHover={{ scale: 1.05 }}` and `whileTap={{ scale: 0.95 }}` properties, giving tactile, satisfying feedback to users.
- **Staggered Orchestration:** Lists (like roadmap steps or resume feedback points) use staggered entry animations (`staggerChildren`) so elements cascade elegantly onto the screen rather than appearing all at once.

### 3. Smooth Transitions & Performance
- **CSS Hardware Acceleration:** Heavy animations (transforms, opacity) are optimized using `translate3d` and `will-change` properties.
- **Layout Animations:** Using Framer Motion's `layoutId`, elements seamlessly morph and glide across the screen when state changes (e.g., expanding a roadmap card).
- **Loading States:** Skeleton loaders with animated shimmering gradients ensure the user is engaged even while backend AI computations are happening.

---

## 🛠️ Detailed Tech Stack

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/spaCy-09A3D5?style=flat-square&logo=spacy&logoColor=white" alt="spaCy" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</div>

- **Frontend Interface**: Next.js 14 server-side rendering, styled with Tailwind CSS for utility-first responsive design, and enriched with Framer Motion for buttery smooth animations.
- **Backend Services**: FastAPI leveraging Python 3.11 asyncio capabilities for high-throughput AI task queues. Data validation via Pydantic.
- **AI/ML Engine**: Natural Language Processing powered by spaCy. Generative AI features (coaching, roadmaps) powered by Google Gemini Pro.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running.

### Prerequisites

- [Git](https://git-scm.com/)
- [Docker & Docker Compose](https://www.docker.com/get-started) (Recommended)
- *OR* [Node.js](https://nodejs.org/) & [Python 3.11+](https://www.python.org/) (For manual setup)

### 🐳 Docker Setup (Easiest)

```bash
# Clone the repository
git clone https://github.com/sachinyaduvanshi553-debug/CAREER-BRIDGE-AI.git

# Navigate to the project directory
cd CAREER-BRIDGE-AI

# Build and spin up the containers
docker-compose up --build
```
> App runs at `http://localhost:3000` | API Docs at `http://localhost:8000/docs`

### ⚙️ Manual Setup

#### 1. Backend Initialization

```bash
cd backend
python -m venv venv 
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m app.main
```

#### 2. Frontend Initialization

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Architecture

```text
CAREER-BRIDGE-AI/
├── backend/                  # FastAPI Application Core
│   ├── app/                  # Application Logic (Routers, Services)
│   ├── core/                 # Configurations & Security
│   ├── models/               # Pydantic Schemas
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # Next.js Application Core
│   ├── app/                  # App Router Pages & Layouts
│   ├── components/           # Reusable UI Components
│   └── public/               # Static Assets
├── architecture_and_workflow.md 
├── docker-compose.yml        
└── README.md                 
```

---

## 🤝 Contributing & License

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details.

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<br />

<div align="center">
  <p style="font-size: 1.1em; color: #718096;">Built with precision, performance, and modern web standards in mind.</p>
  <b>Made with ❤️ by the Career Bridge AI Team.</b>
</div>
