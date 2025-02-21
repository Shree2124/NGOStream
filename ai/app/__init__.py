from flask import Flask
from pymongo import MongoClient

def create_app():
    app = Flask(__name__)
    
    client = MongoClient("mongodb+srv://webseekers:webseekers@cluster0.8b3jv.mongodb.net/ngostream?retryWrites=true&w=majority")
    print(client)
    app.config['db'] = client["ngostream"]
    
    with app.app_context():
        from .routes import api
        app.register_blueprint(api)
        
    return app