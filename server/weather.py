import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

def get_weather(location):
    params = {
        "key": API_KEY,
        "q": location,
        "lang": "pt"
    }

    r = requests.get("http://api.weatherapi.com/v1/current.json", params=params)

    data = r.json()

    return {
        "temp": data["current"]["temp_c"],
        "desc": data["current"]["condition"]["text"]
    }

def get_weather_by_coords(lat, lon):
    params = {
        "key": API_KEY,
        "q": f"{lat},{lon}",
        "lang": "pt"
    }

    r = requests.get("http://api.weatherapi.com/v1/current.json", params=params)
    d = r.json()

    return {
        "location": d["location"]["name"],
        "temp": d["current"]["temp_c"],
        "desc": d["current"]["condition"]["text"]
    }