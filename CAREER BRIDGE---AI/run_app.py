import subprocess
import os
import sys
import threading
import time

def run_backend():
    print("🚀 Starting Backend (FastAPI)...")
    # Use the current python interpreter
    # Assuming backend is in 'backend' directory
    env = os.environ.copy()
    cwd = os.path.join(os.getcwd(), "backend")
    
    # Run uvicorn
    try:
        subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"], cwd=cwd, env=env)
    except KeyboardInterrupt:
        pass

def run_frontend():
    print("🌐 Starting Frontend (Next.js)...")
    # Assuming frontend is in 'frontend' directory
    cwd = os.path.join(os.getcwd(), "frontend")
    
    # Check if node_modules exists
    if not os.path.exists(os.path.join(cwd, "node_modules")):
        print("📦 Installing frontend dependencies...")
        subprocess.run(["npm", "install"], cwd=cwd, shell=True)
    
    # Run npm run dev
    try:
        subprocess.run(["npm", "run", "dev"], cwd=cwd, shell=True)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    print("🌟 CAREER BRIDGE - AI - Starting Services 🌟")
    
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
