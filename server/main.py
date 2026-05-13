from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai import chat_response, text_to_speech, generate_image, speech_to_text
from weather import get_weather, get_weather_by_coords
from vision import process_frame

app = FastAPI()

# ✅ allow Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- CHAT ----------
@app.post("/chat")
async def chat(data: dict):
    return {"response": chat_response(data["message"])}

# ---------- TEXT → SPEECH ----------
@app.post("/tts")
async def tts(data: dict):
    audio = text_to_speech(data["text"])
    return {"audio": audio}

# ---------- SPEECH → TEXT ----------
@app.post("/stt")
async def stt(file: UploadFile = File(...)):
    return {"text": speech_to_text(file)}

# ---------- IMAGE ----------
@app.post("/image")
async def image(data: dict):
    return {"url": generate_image(data["prompt"])}

# ---------- WEATHER ----------
@app.get("/weather")
def weather(location: str):
    return get_weather(location)

@app.get("/weather-coords")
def weather_coords(lat: float, lon: float):
    return get_weather_by_coords(lat, lon)

# ✅ ✅ ✅ VISION (NEW ARCHITECTURE ONLY)

class FrameRequest(BaseModel):
    image: str

@app.post("/vision/frame")
def vision_frame(req: FrameRequest):
    return process_frame(req.image)
