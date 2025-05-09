"""
server.py

Flask-SocketIO backend pentru primirea comenzilor și
trimiterea răspunsurilor prin WebSocket.
"""
import logging
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit

# Logging configurat
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

# Flask + CORS + SocketIO
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

# Stub-uri (înlocuiește cu logica reală)
def search_medicine_with_camera(med_name: str) -> bool:
    logging.info(f"[Camera] Căutare medicament '{med_name}'")
    return True

def initiate_robot_movement(med_name: str) -> bool:
    logging.info(f"[Robot] Inițiere mișcare pentru '{med_name}'")
    return True

# Eveniment la conectare nou client
@socketio.on('connect')
def on_connect():
    logging.info(f'Client conectat: {request.sid}')
    emit('status', {'message': 'Conexiune WebSocket stabilită'})


# Eveniment când browser-ul trimite comanda
@socketio.on('command')
def on_command(data):
    med = data.get('cmd', '').strip().lower()
    logging.info(f"[API WS] Comandă primită: '{med}'")
    # 1. Căutare cu camera
    if not search_medicine_with_camera(med):
        return emit('result', {
            'status': 'not_found',
            'message': f"Medicament '{med}' NU a fost găsit"
        })

    # 2. Inițiere mișcare robot
    if not initiate_robot_movement(med):
        return emit('result', {
            'status': 'error',
            'message': f"Medicament '{med}' găsit, dar mișcarea robotului a eșuat"
        })

    # 3. Succes
    emit('result', {
        'status': 'ok',
        'message': f"Medicament '{med}' găsit și robotul a pornit mișcarea"
    })


if __name__ == '__main__':
    # Folosim eventlet pentru suport WebSocket
    socketio.run(app, host='0.0.0.0', port=5000)
