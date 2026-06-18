import subprocess
import os
import sys
import threading
import time

def run_backend():
    print("Starting Backend (FastAPI)...")
    env = os.environ.copy()
    cwd = os.path.join(os.getcwd(), "backend")
    
    # Use venv python if available
    venv_python = os.path.join(os.getcwd(), "backend", "venv", "Scripts", "python.exe")
    python_exe = venv_python if os.path.exists(venv_python) else sys.executable
    
    # Run uvicorn and log to backend.log
    with open("backend.log", "w") as f:
        try:
            backend_cmd = [
                python_exe, "-m", "uvicorn", "app.main:app",
                "--host", "0.0.0.0", "--port", "8000",
                "--reload", "--reload-dir", "app"
            ]
            subprocess.run(backend_cmd, cwd=cwd, env=env, stdout=f, stderr=f)
        except KeyboardInterrupt:
            pass

def run_frontend():
    print("Starting Frontend (Next.js)...")
    cwd = os.path.join(os.getcwd(), "frontend")
    
    # Check if node_modules exists
    if not os.path.exists(os.path.join(cwd, "node_modules")):
        print("📦 Installing frontend dependencies...")
        subprocess.run(["npm", "install"], cwd=cwd, shell=True)
    
    # Run npm run dev and log to frontend.log
    with open("frontend.log", "w") as f:
        try:
            subprocess.run(["npm", "run", "dev"], cwd=cwd, shell=True, stdout=f, stderr=f)
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    print("CAREER BRIDGE - AI - Starting Services")
    
    # Ensure logs aren't deleted by mistake later
    open("backend.log", "a").close()
    open("frontend.log", "a").close()

    backend_thread = threading.Thread(target=run_backend)
    frontend_thread = threading.Thread(target=run_frontend)
    
    backend_thread.start()
    
    # Give backend a small head start
    time.sleep(2)
    
    frontend_thread.start()
    
    try:
        backend_thread.join()
        frontend_thread.join()
    except KeyboardInterrupt:
        print("\n👋 Shutting down services...")
        sys.exit(0)
