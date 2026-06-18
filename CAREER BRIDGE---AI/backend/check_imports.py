import importlib
import sys

def check_package(package_name, import_name=None):
    if import_name is None:
        import_name = package_name
    try:
        importlib.import_module(import_name)
        print(f"[OK] {package_name} is installed and importable.")
        return True
    except ImportError:
        print(f"[MISSING] {package_name} is MISSING.")
        return False

def check_spacy_model(model_name):
    try:
        import spacy
        if spacy.util.is_package(model_name):
            print(f"[OK] spaCy model '{model_name}' is installed.")
            return True
        else:
            print(f"[MISSING] spaCy model '{model_name}' is MISSING.")
            return False
    except ImportError:
        return False

def main():
    print("--- CAREER BRIDGE - AI: Backend Environment Diagnostic ---\n")
    
    packages = [
        "fastapi",
        "uvicorn",
        "pydantic",
        "python-dotenv",
        "spacy",
        "pypdf",
        "google-genai",
        "httpx",
        "motor",
        "firebase-admin"
    ]
    
    all_ok = True
    for pkg in packages:
        # Handle cases where package name != import name
        import_name = pkg
        if pkg == "python-dotenv": import_name = "dotenv"
        if pkg == "google-genai": import_name = "google.genai"
        if pkg == "firebase-admin": import_name = "firebase_admin"
        
        if not check_package(pkg, import_name):
            all_ok = False
            
    print("\n--- spaCy Models ---")
    if not check_spacy_model("en_core_web_sm"):
        all_ok = False
        
    print("\n" + "="*50)
    if all_ok:
        print("🎉 Your environment looks good!")
    else:
        print("🚨 Some dependencies are missing.")
        print("Please run: pip install -r backend/requirements.txt")
        print("And: python -m spacy download en_core_web_sm")
    print("="*50)

if __name__ == "__main__":
    main()
