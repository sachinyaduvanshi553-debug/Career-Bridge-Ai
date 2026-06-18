import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

def train_scorer():
    data_path = os.path.join(os.path.dirname(__file__), "../data/resume_dataset.csv")
    if not os.path.exists(data_path):
        print(f"Error: Dataset {data_path} not found. Please run generate_datasets.py first.")
        return

    # Column mapping from generate_datasets.py: ["Word_Count", "Section_Count", "Has_Links", "Skill_Count", "ATS_Score"]
    df = pd.read_csv(data_path)
    
    # Feature engineering/naming alignment
    X = df[["Skill_Count", "Section_Count", "Has_Links", "Word_Count"]]
    y = df["ATS_Score"]
    
    print(f"Training RandomForestRegressor on {len(df)} rows...")
    model = RandomForestRegressor(n_estimators=100)
    model.fit(X, y)
    
    output_path = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(output_path, exist_ok=True)
        
    joblib.dump(model, os.path.join(output_path, "resume_scoring_model.joblib"))
    print(f"Resume scoring model saved to {output_path}")

if __name__ == "__main__":
    train_scorer()
