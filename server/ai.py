import os
import base64
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def chat_response(message):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": message}]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {e}"


def text_to_speech(text):
    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text,
            response_format="wav"
        )
        return base64.b64encode(response.content).decode("utf-8")
    except Exception as e:
        return f"Error: {e}"


def speech_to_text(audio_file):
    try:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file.file
        )
        return response.text
    except Exception as e:
        return f"Error: {e}"

def generate_image(prompt):
    try:
        response = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024"
        )

        image = response.data[0]

        if hasattr(image, "url") and image.url:
            return image.url
        else:
            return f"data:image/png;base64,{image.b64_json}"

    except Exception as e:
        return f"Error: {e}"