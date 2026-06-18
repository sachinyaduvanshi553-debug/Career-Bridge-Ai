@echo off
cd backend
if not exist venv (
    echo 📦 Creating virtual environment...
    python -m venv venv
)
echo 🚀 Activating virtual environment and installing dependencies...
call venv\Scripts\activate
pip install -r requirements.txt
pip install email-validator
echo \U0001f9e0 Downloading Spacy Model...
python -m spacy download en_core_web_sm
echo 🌟 Starting Backend Server...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir app
pause
