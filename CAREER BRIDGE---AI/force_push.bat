@echo off
git add .
git commit -m "chore: push project to new repository"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/sachinyaduvanshi553-debug/CAREER-SETU---AI.git
git push -u -f origin main
