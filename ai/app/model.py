import pandas as pd
import os
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from joblib import dump, load
import urllib.request
import zipfile
from datetime import datetime
from .utils import preprocess_text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report
import os
import pandas as pd

MODEL_PATH = "app/static/model.joblib"


def validate_and_clean_data(donations):
    df = pd.DataFrame(donations)

    required_fields = ["createdAt", "monetaryDetails", "donationType"]
    for field in required_fields:
        if field not in df.columns:
            raise ValueError(f"Missing required field: {field}")
    df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
    df = df.dropna(subset=["createdAt"])

    df["amount"] = df["monetaryDetails"].apply(
        lambda x: x.get("amount", 0) if isinstance(x, dict) and "amount" in x else 0
    )
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    df["donationType"] = df["donationType"].fillna("Unknown")

    df["year"] = df["createdAt"].dt.year
    df["month"] = df["createdAt"].dt.month
    df["day"] = df["createdAt"].dt.day
    df["day_of_week"] = df["createdAt"].dt.dayofweek
    df["quarter"] = df["createdAt"].dt.quarter

    return df


def train_model(db):
    donations = list(
        db["donations"].find(
            {},
            {
                "createdAt": 1,
                "monetaryDetails.amount": 1,
                "donationType": 1,
            },
        )
    )
    if not donations:
        raise ValueError("No donation data found in the database.")
    df = validate_and_clean_data(donations)

    grouped = (
        df.groupby(["year", "month", "donationType"])
        .agg({"amount": "sum"})
        .reset_index()
    )
    grouped = pd.get_dummies(grouped, columns=["donationType"], drop_first=True)

    X = grouped.drop(["amount"], axis=1)
    y = grouped["amount"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print(f"Model RMSE: {rmse}")

    dump(model, MODEL_PATH)
    print(f"Model trained and saved at: {MODEL_PATH}")
    return MODEL_PATH


def predict_donations(db):
    donations = list(
        db["donations"].find(
            {},
            {
                "createdAt": 1,
                "monetaryDetails.amount": 1,
                "donationType": 1,
            },
        )
    )
    if not donations:
        raise ValueError("No donation data available for prediction.")

    df = validate_and_clean_data(donations)

    grouped = (
        df.groupby(["year", "month", "donationType"])
        .agg({"amount": "sum"})
        .reset_index()
    )
    grouped = pd.get_dummies(grouped, columns=["donationType"], drop_first=True)

    model = load(MODEL_PATH)
    last_row = grouped.iloc[-1].copy()
    last_row["month"] += 1
    if last_row["month"] > 12:
        last_row["month"] = 1
        last_row["year"] += 1

    X_pred = pd.DataFrame([last_row.drop("amount")])
    predicted_amount = model.predict(X_pred)[0]

    
    predicted_amount = max(predicted_amount, 0)

    monthly_totals = (
        grouped.groupby(["year", "month"])
        .agg({"amount": "sum"})
        .reset_index()
    )

    avg_donation = monthly_totals["amount"].mean()

    return avg_donation, predicted_amount, monthly_totals.to_dict(orient="records")


# def download_dataset():
#     dataset_url = 'https://cs.stanford.edu/people/alecmgo/trainingandtestdata.zip'
#     dataset_path = 'trainingandtestdata.zip'
#     if not os.path.exists(dataset_path):
#         print("Dataset not found. Downloading...")
#         urllib.request.urlretrieve(dataset_url, dataset_path)
#         print("Download complete.")
#     else:
#         print("Dataset already exists. Skipping download.")
#     with zipfile.ZipFile(dataset_path, 'r') as zip_ref:
#         zip_ref.extractall('data')
#     print("Dataset extracted.")







def preprocess_text(text):
    if pd.isna(text) or text.strip() == "":
        return ""
    return text

def load_and_preprocess_data():
    dataset_path = "data/ngo_event_feedbacks_337000.csv"
    print("Loading dataset from:", dataset_path)

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(
            f"Dataset not found at {dataset_path}. Please ensure the file exists."
        )

    columns = ["sentiment", "id", "event_title", "user", "text"]

    try:
        df = pd.read_csv(dataset_path, names=columns, on_bad_lines="skip", header=None, dtype=str)
    except Exception as e:
        raise ValueError(f"Error reading the CSV file: {e}")

    
    df["sentiment"] = pd.to_numeric(df["sentiment"], errors="coerce")
    df = df.dropna(subset=["sentiment"]) 
    df["sentiment"] = df["sentiment"].astype(int)

    # 0: Negative, 4: Positive, 2: Neutral, 3: Suggestion
    df = df[df["sentiment"].isin([0, 4, 2, 3])]  

    df = df.dropna(subset=["text"])
    df = df[df["text"].str.strip() != ""]
    df["processed_text"] = df["text"].apply(preprocess_text)

    negative_samples = df[df["sentiment"] == 0]
    positive_samples = df[df["sentiment"] == 4]
    neutral_samples = df[df["sentiment"] == 2]
    suggestion_samples = df[df["sentiment"] == 3]

    print(f"Number of negative samples: {len(negative_samples)}")
    print(f"Number of positive samples: {len(positive_samples)}")
    print(f"Number of neutral samples: {len(neutral_samples)}")
    print(f"Number of suggestion samples: {len(suggestion_samples)}")

    df_subset = pd.concat([negative_samples, positive_samples, neutral_samples, suggestion_samples])

    return df_subset




def train_feedback_model():
    
    model_path = "app/static/sentiment_model.pkl"

    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    if os.path.exists(model_path):
        print("Model already exists. Loading the existing model.")
        return

    df = load_and_preprocess_data()

    X = df["processed_text"]
    y = df["sentiment"]

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Training samples: {len(X_train)}, Validation samples: {len(X_val)}")

    model = Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            ("classifier", LogisticRegression(max_iter=1000)),
        ]
    )

    model.fit(X_train, y_train)
    dump(model, model_path)
    print(f"Model trained and saved to {model_path}.")

    predicted_classes = set(model.predict(X_val))
    print(f"Predicted classes: {predicted_classes}")

    target_names = ["Negative", "Positive", "Neutral", "Suggestion"]
    
    if len(predicted_classes) != len(target_names):
        target_names = [name for idx, name in enumerate(target_names) if idx in predicted_classes]

    y_pred = model.predict(X_val)
    print("Validation Classification Report:")
    print(
        classification_report(
            y_val,
            y_pred,
            target_names=target_names, 
        )
    )
