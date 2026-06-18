# CAREER BRIDGE - AI – Testing Guide 🧪

Follow these steps to verify the full-stack functionality of the CAREER BRIDGE - AI platform.

## 1. Environment Check
First, ensure both servers are active:

### 🐍 TERMINAL 1: Backend (FastAPI - Python)
> [!IMPORTANT]
> **DO NOT** run `npm` here. This is a Python folder.

```bash
cd backend
# 1. Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# 2. Start the server
uvicorn app.main:app --reload --port 8000
```
- **Live Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### ⚛️ TERMINAL 2: Frontend (Next.js - Node)
> [!IMPORTANT]
> This is where you use `npm`.

```bash
cd frontend
# 1. Start the dev server
npm run dev
```
- **App URL**: [http://localhost:3000](http://localhost:3000)

---

## 2. Testing Scenarios

### A. AI Resume Scoring
1. Navigate to the **[Resume Analyzer](http://localhost:3000/resume)** page.
2. Drag and drop any `.pdf` or `.docx` file (or a plain text file).
3. **EXPECTED**: The UI should show "Analyzing..." for a few seconds, then display an **ATS Score**, a list of **Extracted Skills**, and **Improvement Tips**.

### B. Skill Gap & Roadmap
1. Navigate to the **[Skill Gap](http://localhost:3000/skills)** page.
2. Select a target role (e.g., "Full Stack Developer").
3. Click "Generate Gap Analysis".
4. **EXPECTED**: A visualization of missing skills.
5. Click "Generate Personal Roadmap".
6. **EXPECTED**: You should be redirected to the **Roadmap** page with a 90-day learning plan and curated course links.

### C. AI Mock Interview
1. Navigate to the **[Mock Interview](http://localhost:3000/interview)** page.
2. Choose a role and click "Start Interview".
3. Answer the AI's questions in the chat box.
4. **EXPECTED**: After each answer, the AI will provide a **Score (0-100)** and **Qualitative Feedback** on how to improve.

### D. Workforce Analytics (District-Level)
1. Navigate to the **[Analytics](http://localhost:3000/analytics)** dashboard.
2. Select a state from the filter dropdown (e.g., "Uttar Pradesh").
3. **EXPECTED**: The "District Insights" table and charts should update dynamically with region-specific labor data.

### E. Job Explorer
1. Navigate to the **[Jobs](http://localhost:3000/jobs)** page.
2. Use the search bar for "React" or filter by "State".
3. **EXPECTED**: Real-time job matching based on your live skill profile.

---

## 3. Automated Backend Test
You can run the automated health check script:
```bash
python backend/tests/verify_api.py
```
**EXPECTED**: All checks should return `status_code: 200`.

---

## 4. Troubleshooting
- **API Error**: If the frontend says "Failed to fetch", ensure the backend is running on port 8000.
- **Model Missing**: If logic fails, run `python -m spacy download en_core_web_sm` once to ensure NLP models are ready.
