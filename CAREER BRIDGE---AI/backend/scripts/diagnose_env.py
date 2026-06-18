import sys
import os

print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")
print(f"sys.path: {sys.path}")

try:
    import motor
    print("✅ motor is installed.")
    print(f"motor version: {motor.__version__ if hasattr(motor, '__version__') else 'unknown'}")
except ImportError:
    print("❌ motor is NOT installed.")

try:
    import dotenv
    print("✅ python-dotenv is installed.")
except ImportError:
    print("❌ python-dotenv is NOT installed.")

try:
    # Try to import app.models relative to backend
    sys.path.append(os.getcwd())
    import app.models
    print("✅ app.models is importable from CWD.")
except ImportError as e:
    print(f"❌ app.models is NOT importable from CWD: {e}")

try:
    # Try to import app.models relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)
    sys.path.append(backend_dir)
    import app.models
    print("✅ app.models is importable from backend_dir.")
except ImportError as e:
    print(f"❌ app.models is NOT importable from backend_dir: {e}")
