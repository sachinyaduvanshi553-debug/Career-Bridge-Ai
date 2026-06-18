# CAREER BRIDGE - AI 🚀

Empowering the future workforce with AI-driven career intelligence.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**CAREER BRIDGE - AI** is a transformative platform designed to bridge the "Skill-to-Job" gap. Using Google Gemini and spaCy-driven NLP, it provides personalized resume scoring, mock interview coaching, and localized career roadmaps.

## ✨ Key Features

- 📑 **ATS 2.0 Resume Scorer**: AI-driven analysis for missing keywords and actionable feedback.
- 🗺️ **30/60/90 Day Roadmaps**: Structured learning paths with automated resource mapping.
- 🎙️ **AI Interview Coach**: Real-time feedback on technical proficiency and soft skills.
- 📊 **Workforce Analytics**: Heatmaps and demand vs. supply deficits for NGOs & Government.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion.
- **Backend**: FastAPI (Python 3.11), Pydantic.
- **AI**: Google Gemini Pro, spaCy NLP, scikit-learn.
- **DevOps**: Docker & Docker Compose.

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) (Recommended)
- [Node.js](https://nodejs.org/) & [Python 3.11+](https://www.python.org/) (For manual setup)

### Docker Setup (Easiest)

```bash
git clone https://github.com/sachinyaduvanshi553-debug/CAREER-SETU---AI.git
cd CAREER-SETU---AI
docker-compose up --build
```

- App: `http://localhost:3000`
- API: `http://localhost:8000/docs`

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m app.main
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```text
.
├── backend/        # FastAPI server & AI logic
├── frontend/       # Next.js web application
├── docker-compose.yml
└── README.md
```

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
