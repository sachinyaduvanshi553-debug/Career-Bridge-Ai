@echo off
echo Setting up Git and pushing to GitHub...

cd /d "c:\Users\sachi\OneDrive\Desktop\career-setu\CAREER-SETU---AI\CAREER SETU"

echo Initializing git (if needed)...
git init

echo Creating .gitignore...
(
echo .venv/
echo __pycache__/
echo *.pyc
echo .env
echo node_modules/
echo .next/
echo *.joblib
echo *.pkl
echo /backend/models/*.joblib
echo /backend/models/*.pkl
echo /backend/models/*.npy
echo *.log
echo .DS_Store
) > .gitignore

echo Setting remote...
git remote remove origin 2>nul
git remote add origin https://github.com/sachinyaduvanshi553-debug/CAREER-SETU---AI.git

echo Staging files...
git add .

echo Committing...
git commit -m "feat: Implement Hybrid ML + Gemini AI integration with full fallback logic"

echo Pushing to main...
git push -u origin main

if %errorlevel% neq 0 (
    echo Trying master branch...
    git push -u origin master
)

echo Done! Check above for any errors.
pause
