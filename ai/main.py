from app import create_app
from flask_cors import CORS

app = create_app()

CORS(app)

@app.route('/')
def hello():
    return 'Hello World!'

if __name__ == "__main__":
    app.run(debug=True,port=5000)
