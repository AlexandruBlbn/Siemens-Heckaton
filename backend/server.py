from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Optional: import cv2 or picamera for actual camera integration
# import cv2

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Stub function: here vei integra logica de căutare / procesare cu camera
# de exemplu poți captura un cadru și analiza imaginea pentru ambalajul
# medicamentului specificat.
def search_medicine_with_camera(med_name: str) -> bool:
    # TODO: înlocuiește cu codul tău de procesare OpenCV / Picamera
    logging.info(f"Căutare medicament '{med_name}' cu camera...")
    # simulăm întotdeauna succes
    return True

@app.route('/api/medicine', methods=['POST'])
def receive_medicine():
    data = request.get_json(force=True)
    med = data.get('cmd') or data.get('medicine')
    if not med:
        return jsonify(error='Lipsește parametrul "cmd" sau "medicine"'), 400

    # normalizează numele
    med = med.strip().lower()
    logging.info(f"Request primit: căutare medicament '{med}'")

    found = search_medicine_with_camera(med)
    if found:
        return jsonify(status='ok', medicine=med, message=f"Medicament '{med}' găsit"), 200
    else:
        return jsonify(status='not_found', medicine=med, message=f"Medicament '{med}' NU a fost găsit"), 404

if __name__ == '__main__':
    # rulează pe toate interfețele la portul 5000
    app.run(host='0.0.0.0', port=5000)
