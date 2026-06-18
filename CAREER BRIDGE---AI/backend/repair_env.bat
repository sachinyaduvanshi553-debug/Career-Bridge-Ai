@echo off
echo --- CAREER BRIDGE - AI Environment Repair ---

cd backend

echo [1/3] Updating core dependencies to fix Python 3.13 hangs...
pip install --upgrade certifi importlib-metadata requests spacy

echo [2/3] Downloading spacy model...
python -m spacy download en_core_web_sm

echo [3/3] Verifying environment...
python check_env.py

echo.
echo Repair complete. If check_env.py showed no errors, you can restart the backend.
pause
