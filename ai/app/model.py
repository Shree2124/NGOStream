import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from joblib import dump, load
from datetime import datetime

MODEL_PATH = 'app/static/model.joblib'

def validate_and_clean_data(donations):
    df = pd.DataFrame(donations)

    required_fields = ['createdAt', 'monetaryDetails', 'donationType']
    for field in required_fields:
        if field not in df.columns:
            raise ValueError(f"Missing required field: {field}")
    df['createdAt'] = pd.to_datetime(df['createdAt'], errors='coerce')
    df = df.dropna(subset=['createdAt'])

    df['amount'] = df['monetaryDetails'].apply(
        lambda x: x.get('amount', 0) if isinstance(x, dict) and 'amount' in x else 0
    )
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['donationType'] = df['donationType'].fillna('Unknown')

    df['year'] = df['createdAt'].dt.year
    df['month'] = df['createdAt'].dt.month
    df['day'] = df['createdAt'].dt.day
    df['day_of_week'] = df['createdAt'].dt.dayofweek
    df['quarter'] = df['createdAt'].dt.quarter

    return df

def train_model(db):
    donations = list(db['donations'].find({}, {
        'createdAt': 1,
        'monetaryDetails.amount': 1,
        'donationType': 1,
    }))
    if not donations:
        raise ValueError("No donation data found in the database.")
    df = validate_and_clean_data(donations)

    grouped = df.groupby(['year', 'month', 'donationType']).agg({'amount': 'sum'}).reset_index()
    grouped = pd.get_dummies(grouped, columns=['donationType'], drop_first=True)

    X = grouped.drop(['amount'], axis=1)
    y = grouped['amount']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print(f"Model RMSE: {rmse}")

    dump(model, MODEL_PATH)
    print(f"Model trained and saved at: {MODEL_PATH}")
    return MODEL_PATH


def predict_donations(db):
    donations = list(db['donations'].find({}, {
        'createdAt': 1,
        'monetaryDetails.amount': 1,
        'donationType': 1,
    }))
    if not donations:
        raise ValueError("No donation data available for prediction.")
    df = validate_and_clean_data(donations)
    grouped = df.groupby(['year', 'month', 'donationType']).agg({'amount': 'sum'}).reset_index()
    grouped = pd.get_dummies(grouped, columns=['donationType'], drop_first=True)

    model = load(MODEL_PATH)
    last_row = grouped.iloc[-1].copy()
    last_row['month'] += 1
    if last_row['month'] > 12:
        last_row['month'] = 1
        last_row['year'] += 1
    X_pred = pd.DataFrame([last_row.drop('amount')])
    predicted_amount = model.predict(X_pred)[0]
    monthly_totals = grouped.groupby(['year', 'month']).agg({'amount': 'sum'}).reset_index()
    avg_donation = monthly_totals['amount'].mean()

    return avg_donation, predicted_amount, monthly_totals.to_dict(orient="records")
