# 🚀 AI HUB

A full-stack AI application that combines chat, voice interaction, image generation, and automatic weather detection in a single modern interface.

---

## 🧠 Features

### 💬 Chat Assistant
- Ask questions using text
- AI-generated responses (OpenAI)
- Press Enter to send

### 🎤 Voice Interaction
- Speak instead of typing
- Converts voice to text, then sends to AI
- Integrated directly into chat

### 🔊 Text-to-Speech
- Listen to AI responses
- Realistic voice playback

### 🖼️ Image Generator
- Describe an image
- Generate it using AI

### 🌍 Smart Weather Detection
- Automatically detects user location
- Displays weather info on startup
- No manual input required

---

## 🏗️ Tech Stack

Frontend:
- Angular (Standalone Components)
- Angular Signals
- HTML / CSS

Backend:
- FastAPI (Python)
- OpenAI API
- WeatherAPI

---

## 📁 Project Structure

project/
  ai-hub/    (Angular frontend)
  server/    (FastAPI backend)
  README.md

---

## ⚙️ Setup

Clone repository:

git clone YOUR_REPO_URL
cd project

---

## 🌐 Frontend (Angular)

cd ai-hub
npm install
ng serve

Open:
http://localhost:4200

---

## 🐍 Backend (FastAPI)

cd server
pip install fastapi uvicorn openai python-dotenv requests python-multipart
uvicorn main:app --reload

Open:
http://localhost:8000

Docs:
http://localhost:8000/docs

---

## 🔑 Environment Variables

Create a .env file inside the server folder:

OPENAI_API_KEY=your_openai_key
WEATHER_API_KEY=your_weather_key

---

## 🔗 API Endpoints

/chat → AI text response  
/tts → Text to speech  
/stt → Speech to text  
/image → Generate image  
/weather-coords → Weather by location  

---

## 🎯 Usage

1. Open the app
2. Allow location access
3. Use chat (type or speak)
4. Generate images
5. Use voice buttons to speak or listen

---

## ✅ Highlights

- Modern Angular (signals, no ngModel)
- Full voice pipeline
- Automatic weather detection
- Clean and simple UI

---

## 🚀 Future Improvements

- Chat history
- Typing animation
- Better UI styling
- Deployment online

---

## 👨‍💻 Author

Full-stack AI project combining Angular and FastAPI.

---

## ⭐ Notes

- Works best in Chrome
- Requires internet connection
- Requires microphone and location permissions
