import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
import joblib
import os

def train_classifier():
    data_path = os.path.join(os.path.dirname(__file__), "../data/skills_roles_dataset.csv")
    if not os.path.exists(data_path):
        print(f"Error: Dataset {data_path} not found. Please run generate_datasets.py first.")
        return
        
    df = pd.read_csv(data_path)
    
    # Clean the Skills column: convert comma-separated string back to list
    df['skills'] = df['Skills'].apply(lambda x: [s.strip() for s in x.split(',') if s.strip()])
    
    print(f"Loaded dataset with {len(df)} rows.")
    
    mlb = MultiLabelBinarizer()
    X = mlb.fit_transform(df['skills'])
    y = df['Role']
    
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)
    
    output_path = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(output_path, exist_ok=True)
        
    joblib.dump(model, os.path.join(output_path, "career_recommendation_model.joblib"))
    joblib.dump(mlb, os.path.join(output_path, "skills_binarizer.joblib"))
    
    # Save a copy of roles list for easy access in API
    roles = df['Role'].unique().tolist()
    joblib.dump(roles, os.path.join(output_path, "known_roles.joblib"))
    
    print(f"Career prediction model and binarizer saved to {output_path}")

if __name__ == "__main__":
    train_classifier()
