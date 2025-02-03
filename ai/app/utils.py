import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

def generate_donation_trends_graph(db):
    donations = list(
        db['donations'].find({}, {'createdAt': 1, 'monetaryDetails.amount': 1})
    )
    print("Donations:", donations)

    df = pd.DataFrame(donations)

    if 'createdAt' not in df.columns or 'monetaryDetails' not in df.columns:
        raise ValueError("Required fields 'createdAt' or 'monetaryDetails' are missing in the data.")

    df['amount'] = df['monetaryDetails'].apply(lambda x: x.get('amount', 0) if isinstance(x, dict) else 0)

    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

    df['createdAt'] = pd.to_datetime(df['createdAt'], errors='coerce')

    df = df.dropna(subset=['createdAt', 'amount'])
    print("Cleaned DataFrame:\n", df)

    df['month'] = df['createdAt'].dt.to_period('M')
    monthly_totals = df.groupby('month')['amount'].sum().reset_index()

    monthly_totals['month'] = monthly_totals['month'].dt.to_timestamp()

    print("Monthly Totals:\n", monthly_totals)

    plt.figure(figsize=(10, 6))
    plt.plot(monthly_totals['month'], monthly_totals['amount'], marker='o', linestyle='-', color='b')
    plt.title('Donation Trends Over Time', fontsize=16)
    plt.xlabel('Month', fontsize=14)
    plt.ylabel('Total Donations', fontsize=14)
    plt.grid(visible=True, linestyle='--', alpha=0.7)

    plt.xticks(rotation=45, ha='right')

    img_io = io.BytesIO()
    plt.savefig(img_io, format='png', bbox_inches='tight')
    img_io.seek(0)
    plt.close()

    img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')

    return img_base64

def get_donation_data(db):
    donations = list(
        db['donations'].find({}, {'createdAt': 1, 'monetaryDetails.amount': 1})
    )
    print("Fetched donations:", donations)

    dates = []
    amounts = []
    numeric_data = []
    
    for donation in donations:
        created_at = donation.get('createdAt')
        monetary_details = donation.get('monetaryDetails', {})
        if created_at and isinstance(monetary_details, dict):
            date_str = created_at.strftime('%Y-%m-%d')
            amount = float(monetary_details.get('amount', 0))
            if amount > 0:
                dates.append(date_str)
                amounts.append(amount)
                numeric_data.append({"date": date_str, "amount": amount})
    
    return {'dates': dates, 'amounts': amounts, 'numeric_data': numeric_data}


def save_plot(data): 
    plt.figure(figsize=(10,6))
    data.plot(kind='line', title='Donation Trends', xlabel= 'Month', ylabel = "Total Amount")
    path = 'app/static/donation_trends.png'
    plt.savefig(path)
    plt.close()
    return path

nltk.download('stopwords')
nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    text = re.sub(r'\W', ' ', text)

    tokens = text.lower().split()
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return ' '.join(tokens)