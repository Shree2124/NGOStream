from flask import Blueprint, jsonify, current_app, request
from .model import train_model, predict_donations,train_feedback_model
from .utils import get_donation_data
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import joblib

api = Blueprint('api', __name__)

@api.route('/api/donation-trends', methods=['GET'])
def donation_trends():
    train()
    db = current_app.config['db']
    data = get_donation_data(db)
    print("Processed data:", data)
    
    plt.figure(figsize=(10, 6))
    plt.plot(data['dates'], data['amounts'], marker='o', label="Donations")
    plt.title('Donation Trends')
    plt.xlabel('Date')
    plt.ylabel('Amount')
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.legend()
    
    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    img_base64 = base64.b64encode(img.getvalue()).decode('utf-8')
    
    return jsonify({
        'message': 'Donation trends data',
        # 'graph': f"data:image/png;base64,{img_base64}",
        'numeric_data': data['numeric_data']
    }), 200
    
    
@api.route('/api/fundraising-metrics', methods=['GET'])
def fundraising_metrics():
    train()
    db = current_app.config['db']
    print(db)
    avg, prediction, monthly_totals = predict_donations(db)
    print(avg, prediction, monthly_totals)

    result = [
        {"month": item["month"], "amount": int(item["amount"])}
        for item in monthly_totals
    ]
    return jsonify({
        "average": avg,
        "predicted": prediction,
        "monthly_totals": result
    })
    
@api.route('/api/train-model', methods=['GET'])
def train():
    db = current_app.config['db']
    model_path = train_model(db)
    return jsonify({'message': 'Model trained and saved', 'model_path': model_path}), 200


@api.route("/api/analyze", methods=['POST'])
def analyze_sentiment():
    train_feedback_model()


    model = joblib.load('app/static/sentiment_model.pkl')



    data = request.get_json()

    texts = data.get('texts')
    if not texts or not isinstance(texts, list):
        return jsonify({'error': 'Invalid input. Expected a list of texts.'}), 400

    sentiments = []

    sentiment_labels = {
        0: 'negative',
        4: 'positive',
        2: 'neutral',
        3: 'suggestion'
    }

    for text in texts:
        sentiment = model.predict([text])[0]  
        sentiment_label = sentiment_labels.get(sentiment, 'unknown')
        sentiments.append({'text': text, 'sentiment': sentiment_label})

    return jsonify({'sentiments': sentiments})