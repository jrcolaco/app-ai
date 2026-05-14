from flask import Flask, request, jsonify
from flask_cors import CORS

from vision import process_frame
from ai import chat_response, text_to_speech, generate_image, speech_to_text
from weather import get_weather, get_weather_by_coords


app = Flask(__name__)
CORS(app)


# ---------- ROOT ----------
@app.route("/")
def root():
    return jsonify({"status": "running ✅"})


# ---------- CHAT ----------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    return jsonify({
        "response": chat_response(data["message"])
    })


# ---------- TEXT → SPEECH ----------
@app.route("/tts", methods=["POST"])
def tts():
    data = request.get_json()
    audio = text_to_speech(data["text"])
    return jsonify({
        "audio": audio
    })


# ---------- SPEECH → TEXT ----------
@app.route("/stt", methods=["POST"])
def stt():
    file = request.files["file"]
    return jsonify({
        "text": speech_to_text(file)
    })


# ---------- IMAGE ----------
@app.route("/image", methods=["POST"])
def image():
    data = request.get_json()
    return jsonify({
        "url": generate_image(data["prompt"])
    })


# ---------- WEATHER ----------
@app.route("/weather", methods=["GET"])
def weather():
    location = request.args.get("location")
    return jsonify(get_weather(location))


@app.route("/weather-coords", methods=["GET"])
def weather_coords():
    lat = float(request.args.get("lat"))
    lon = float(request.args.get("lon"))
    return jsonify(get_weather_by_coords(lat, lon))


# ---------- VISION ----------
@app.route("/vision/frame", methods=["POST"])
def vision_frame():
    data = request.get_json()
    return jsonify(process_frame(data["image"]))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
