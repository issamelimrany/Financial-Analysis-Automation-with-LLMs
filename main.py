from flask import Flask, render_template, request, jsonify
from utils import get_ai_response
import dotenv
import os

dotenv.load_dotenv()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    query = data.get('message')
    
    if not query:
        return jsonify({'error': 'No message provided'}), 400
    
    try:
        response = get_ai_response(query)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)