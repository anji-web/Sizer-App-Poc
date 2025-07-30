from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from body_measurement import calculate_body_measurements

app = Flask(__name__)
CORS(app, origins='http://localhost:3000')


@app.route('/api/measure', methods=['POST','OPTIONS'])
def measure():
    try:
        landmarks = request.json['landmarks']
        measurements = calculate_body_measurements(landmarks)
        return jsonify(measurements)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000)