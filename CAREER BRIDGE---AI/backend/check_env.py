import os
import sys

def check_backend():
    print("--- Backend Environment Check ---")
    print(f"Python version: {sys.version}")
    
    try:
        import spacy
        print("✅ spacy is installed.")
        try:
            nlp = spacy.load("en_core_web_sm")
            print("✅ en_core_web_sm is installed and loads correctly.")
        except Exception as e:
            print(f"❌ en_core_web_sm failed to load: {e}")
            print("Action: Run 'python -m spacy download en_core_web_sm'")
    except ImportError:
        print("❌ spacy is NOT installed.")

    try:
        import joblib
        print("✅ joblib is installed.")
        model_path = "models/resume_scoring_model.joblib"
        if os.path.exists(model_path) or os.path.exists(os.path.join("backend", model_path)):
            try:
                joblib.load(model_path)
                print(f"✅ local model {model_path} loads correctly.")
            except Exception as e:
                print(f"❌ Failed to load local model {model_path}: {e}")
        else:
            print(f"❌ local model {model_path} NOT found.")
    except ImportError:
        print("❌ joblib is NOT installed.")

    try:
        import requests
        print("✅ requests is installed.")
    except ImportError:
        print("❌ requests is NOT installed.")

if __name__ == "__main__":
    check_backend()
