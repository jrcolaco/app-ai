🚀 AI HUB: chat, voice, image generation, and weather.

---

📁 STRUCTURE

📦 app-ai/   → Angular frontend
🐍 server/   → Python 3.11 backend (Flask)
📁 Docs/     → PDF and Docs about AI

---

⚙️ SETUP

1️⃣ Create and activate Python environment (run in project root)

python -m venv devIA311
echo "alias aVenv311='source devIA311/Scripts/activate'" >> ~/.bashrc
source ~/.bashrc
aVenv311

---

2️⃣ Backend (Flask)

cd server
npm run install
npm run start

🌐 API: http://localhost:5000

---

3️⃣ Frontend (Angular)

cd app-ai
npm install
npm run start

🖥️ App: http://localhost:4200

---

🔑 ENVIRONMENT VARIABLES (create .env inside server)

OPENAI_API_KEY=your_key
WEATHER_API_KEY=your_key

---

✨ FEATURES

💬 Chat + Voice + Text-to-Speech  
🖼️ Image generation  
🌍 Automatic weather detection  

---

📝 NOTES

⚡ Backend uses Flask (not FastAPI)  
🐍 Python 3.11 required  
🌐 Use Chrome for best compatibility  
🎤 Requires microphone and location permissions  


