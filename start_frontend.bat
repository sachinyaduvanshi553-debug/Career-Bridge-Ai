@echo off
cd frontend
if not exist node_modules (
    echo 📦 Installing frontend dependencies...
    npm install
)
echo 🌟 Starting Frontend Server...
npm run dev
pause
