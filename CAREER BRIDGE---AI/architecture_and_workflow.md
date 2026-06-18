# CAREER BRIDGE - AI: Working Flow & Architecture

This document provides a deep dive into the technical architecture, core working principles, and feature workflows of the CAREER BRIDGE - AI platform.

---

## 🏗️ 1. High-Level Architecture

CAREER BRIDGE - AI follows a modern **Decoupled Full-Stack Architecture**, ensuring scalability and clear separation of concerns.

### **Frontend: Next.js 14 (App Router)**
- **Role**: Client interface, user state management, and visual rendering.
- **Key Tech**: React, Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Behavior**: Uses client-side components to handle complex multi-step interactions (like the Interview and Resume upload flows).

### **Backend: FastAPI (Python 3.11)**
- **Role**: Business logic, AI engine execution, and API fulfillment.
- **Key Tech**: FastAPI, Uvicorn, Pydantic, python-dotenv.
- **Engines**: The backend is modularly organized into "Engines" for specific tasks (Scoring, Matching, Analytics).

---

## 🧠 2. Core Working Principles

### **The Hybrid AI Strategy**
The platform uses a two-tier AI approach to balance speed and intelligence:

1.  **Local NLP Tier (spaCy)**: 
    - Used for **Entity Recognition** and **Skill Extraction**.
    - Processes text locally on the server to identify technical and soft skills without external latency.
2.  **Cloud LLM Tier (Google Gemini)**: 
    - Used for **Reasoning and Qualitative Analysis**.
    - Handles complex tasks like generating 90-day learning roadmaps, providing professional career advice, and evaluating interview answers with "human-like" nuance.

---

## 🔄 3. Feature Workflows

### **A. Intelligent Resume Analysis**
1.  **Upload**: User drops a file (`.pdf`, `.txt`) in the frontend.
2.  **API Call**: Frontend sends file to `/api/resume/analyze`.
3.  **Extraction**: Backend uses `SkillExtractor` (spaCy) to get raw data.
4.  **AI Scoring**: `ResumeScorer` sends the text + Target Role to **Gemini API**.
5.  **Result**: Gemini returns a JSON object containing the ATS score, breakdown, and specific improvement tips.

### **B. Skill Gap & Adaptive Roadmaps**
1.  **Selection**: User selects a target "Future Role" (e.g., Data Scientist).
2.  **Comparison**: Backend retrieves role requirements and compares them against the user's current profile skills.
3.  **Gap Analysis**: `SkillGapAnalyzer` calculates exactly what's missing.
4.  **Roadmap Generation**: `RoadmapGenerator` takes the "Missing Skills" and asks **Gemini** to structure a 30-60-90 day learning path, matching items to available courses in the database.

### **C. AI Interview Coaching**
1.  **Initialization**: User chooses a role; backend fetches relevant questions (from a pre-seeded bank or AI generation).
2.  **Interaction**: Frontend manages the session state (current question index, timer, and answer input).
3.  **Evaluation**: Once an answer is submitted, the `InterviewEngine` sends the Question + User Answer to **Gemini**.
4.  **Feedback**: The user receives a score and technical feedback highlighting what was good and what was missed.

---

## 📊 4. Workspace & Data Principles

- **Mock Data Layer**: The system is designed to work out-of-the-box with high-quality mock datasets for Jobs, Courses, and Districts, allowing for immediate demonstration of value.
- **CORS & Port Management**: The system is configured for cross-origin resource sharing, typically running the Frontend on port `3000` and the Backend on port `8001` (to avoid common Windows port 8000 conflicts).
- **Extensibility**: The engine-based architecture allows for new AI features (like a Job Matcher or Career Recommender) to be added as independent Python modules without affecting the core API.

---

## 💻 5. Tech Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 | Responsive UI & Route Management |
| **Styling** | Tailwind CSS | Modern Utility-First Design |
| **API** | FastAPI (Python) | High-performance Asynchronous Backend |
| **Database/Mock** | Python Pydantic | Structured Data Modeling |
| **NLP** | spaCy | Local Skill Identification |
| **LLM** | Google Gemini | Deep reasoning & Generative Insights |
| **Deployment**| Docker | Containerized Environment Sync |

---
*Created for the CAREER BRIDGE - AI technical documentation.*
