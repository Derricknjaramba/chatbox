import datetime
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, send, disconnect
from flask_cors import CORS

app = Flask(__name__)

# CORS Setup
CORS(app, origins="http://localhost:3000", methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"], supports_credentials=True)

# Initialize SocketIO with proper CORS configuration for websockets
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")  # Allow only from React

# Mapping of socket IDs to nicknames
users = {}

# Route to handle user login and JWT generation
@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", "")
    if username:
        return jsonify(message="Login successful"), 200
    return jsonify(message="Missing username"), 400

# Handle new user connections (Socket.IO)
@socketio.on("connect")
def handle_connect():
    print(f"A new user has connected. Socket ID: {request.sid}")

# Handle user disconnects (Socket.IO)
@socketio.on("disconnect")
def handle_disconnect():
    nickname = users.get(request.sid)
    if nickname:
        print(f"User {nickname} has disconnected.")
        del users[request.sid]  # Remove user from the mapping when they disconnect
    else:
        print("A user has disconnected.")

# Handle message sending with timestamp (Socket.IO)
@socketio.on("message")
def handle_message(msg):
    nickname = users.get(request.sid)  # Get the nickname associated with the socket ID
    if nickname:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        msg_with_timestamp = f"{timestamp} - {nickname}: {msg}"
        send(msg_with_timestamp, broadcast=True)  # Broadcast the message to all connected clients

# Handle nickname assignment (Socket.IO)
@socketio.on("set_nickname")
def set_nickname(nickname):
    if len(nickname) < 2:
        send("Nickname must be at least 2 characters long.", broadcast=False)
        return

    # Check if nickname is already taken by another user
    if nickname in users.values():
        send(f"Nickname '{nickname}' is already in use. Please choose another one.", broadcast=False)
    else:
        users[request.sid] = nickname  # Store the nickname with the socket ID
        send(f"{nickname} has joined the chat.", broadcast=True)
        print(f"User '{nickname}' joined the chat.")  # Server-side log for tracking

# Explicitly handle OPTIONS request for preflight
@app.route('/login', methods=["OPTIONS"])
def handle_options():
    return '', 200  # Just respond with 200 OK for preflight requests

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)  # Set the port to 5002

















