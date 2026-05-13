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

    r = requests.get(
        "http://api.weatherapi.com/v1/current.json",
        params=params
    )

    data = r.json()

    return {
        "temp": round(data["current"]["temp_c"]),
        "desc": data["current"]["condition"]["text"]
    }


def get_weather_by_coords(lat, lon):
    params = {
        "key": API_KEY,
        "q": f"{lat},{lon}",
        "lang": "pt"
    }

    r = requests.get(
        "http://api.weatherapi.com/v1/current.json",
        params=params
    )

    d = r.json()

    return {
        "location": d["location"]["name"],
        "region": d["location"]["region"],

        "temp": round(d["current"]["temp_c"]),
        "desc": d["current"]["condition"]["text"],

        "icon": "https:" + d["current"]["condition"]["icon"],

        "wind_kph": round(d["current"]["wind_kph"]),
        "wind_dir": d["current"]["wind_dir"],

        "humidity": d["current"]["humidity"],
        "chance_of_rain": d["current"]["chance_of_rain"],

        "uv": d["current"]["uv"]
    }
