import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from joblib import dump, load

MODEL_PATH = 'app/static/model.joblib'

def train_model(db):
    donations = list(db['donations'].find({}, {'createdAt': 1, 'monetaryDetails.amount': 1}))
    print("Donations:", donations)
    df = pd.DataFrame(donations)
    print("Initial DataFrame:\n", df)

    if 'createdAt' not in df.columns or 'monetaryDetails' not in df.columns:
        raise ValueError("Required fields 'createdAt' or 'monetaryDetails' are missing in the data.")

    df['amount'] = df['monetaryDetails'].apply(lambda x: x.get('amount', 0) if isinstance(x, dict) else 0)

    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

    df['createdAt'] = pd.to_datetime(df['createdAt'], errors='coerce')

    df = df.dropna(subset=['createdAt'])
    print("Cleaned DataFrame:\n", df)

    df['month'] = df['createdAt'].dt.to_period('M')
    monthly_totals = df.groupby('month')['amount'].sum().reset_index()
    print("Monthly Totals:\n", monthly_totals)
        
    monthly_totals['month_numeric'] = monthly_totals['month'].apply(lambda x: x.ordinal)
    X = monthly_totals['month_numeric'].values.reshape(-1, 1)
    y = monthly_totals['amount'].values
    model = LinearRegression()
    model.fit(X, y)

    dump(model, MODEL_PATH)
    print(f"Model trained and saved at: {MODEL_PATH}")
    return MODEL_PATH

def predict_donations(db):
    print("In predict_donations:", db)
    donations = list(
        db['donations'].find({}, {'createdAt': 1, 'monetaryDetails.amount': 1})
    )
    print("Donations:", donations)

    df = pd.DataFrame(donations)
    print("Initial DataFrame:\n", df)

    if 'createdAt' not in df.columns or 'monetaryDetails' not in df.columns:
        raise ValueError("Required fields 'createdAt' or 'monetaryDetails' are missing in the data.")
    df['amount'] = df['monetaryDetails'].apply(lambda x: x.get('amount', 0) if isinstance(x, dict) else 0)
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

    df['createdAt'] = pd.to_datetime(df['createdAt'], errors='coerce')
    df = df.dropna(subset=['createdAt'])
    print("Cleaned DataFrame:\n", df)
    
    df['month'] = df['createdAt'].dt.to_period('M')
    monthly_totals = df.groupby('month')['amount'].sum()

    print("Monthly Totals:\n", monthly_totals)

    monthly_totals_data = [
        {"month": str(month), "amount": amount}
        for month, amount in zip(monthly_totals.index, monthly_totals.values)
    ]

    X = np.arange(len(monthly_totals)).reshape(-1, 1)
    y = monthly_totals.values

    model = load(MODEL_PATH)

    next_month_index = len(X)
    prediction = model.predict([[next_month_index]])[0]

    return y.mean(), prediction, monthly_totals_data