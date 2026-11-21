from datetime import datetime, timezone
import requests
from config import OPENWEATHER_API_KEY

BASE_URL = "https://api.openweathermap.org"

class WeatherServiceError(Exception):
    pass

def api_get(path: str, params: dict):
    if not OPENWEATHER_API_KEY:
        raise WeatherServiceError("OPENWEATHER_API_KEY is missing. Add it to the project-root .env file.")
    try:
        response = requests.get(
            f"{BASE_URL}{path}",
            params={**params, "appid": OPENWEATHER_API_KEY},
            timeout=15,
        )
    except requests.RequestException as exc:
        raise WeatherServiceError("Could not reach the weather provider. Please try again.") from exc

    if response.status_code == 404:
        raise WeatherServiceError("City not found. Check the spelling and try again.")
    if response.status_code == 401:
        raise WeatherServiceError("Weather API key is invalid or not activated yet.")
    if response.status_code == 429:
        raise WeatherServiceError("Weather API rate limit reached. Please try again later.")
    if not response.ok:
        raise WeatherServiceError(f"Weather provider returned an error ({response.status_code}).")
    return response.json()

def city_local_time(timestamp: int, offset: int) -> str:
    local_dt = datetime.fromtimestamp(timestamp + offset, tz=timezone.utc)
    return local_dt.strftime("%I:%M %p").lstrip("0")

def get_weather(city: str) -> dict:
    locations = api_get("/geo/1.0/direct", {"q": city, "limit": 1})
    if not locations:
        raise WeatherServiceError("City not found. Check the spelling and try again.")

    place = locations[0]
    lat, lon = place["lat"], place["lon"]
    current = api_get("/data/2.5/weather", {
        "lat": lat, "lon": lon, "units": "metric"
    })
    forecast = api_get("/data/2.5/forecast", {
        "lat": lat, "lon": lon, "units": "metric"
    })

    offset = current.get("timezone", 0)
    condition = current["weather"][0]
    main = current["main"]

    hourly = []
    for item in forecast.get("list", [])[:8]:
        weather = item["weather"][0]
        hourly.append({
            "time": city_local_time(item["dt"], offset),
            "temperature": round(item["main"]["temp"]),
            "condition": weather["main"],
            "description": weather["description"],
            "icon": weather["icon"],
            "rain_probability": round(item.get("pop", 0) * 100),
        })

    grouped = {}
    for item in forecast.get("list", []):
        local_dt = datetime.fromtimestamp(item["dt"] + offset, tz=timezone.utc)
        key = local_dt.strftime("%Y-%m-%d")
        grouped.setdefault(key, []).append((local_dt, item))

    daily = []
    for date_key, entries in list(grouped.items())[:5]:
        temps = [entry[1]["main"]["temp"] for entry in entries]
        midday_dt, midday = min(entries, key=lambda pair: abs(pair[0].hour - 12))
        weather = midday["weather"][0]
        daily.append({
            "date": date_key,
            "day": midday_dt.strftime("%a"),
            "max_temp": round(max(temps)),
            "min_temp": round(min(temps)),
            "condition": weather["main"],
            "description": weather["description"],
            "icon": weather["icon"],
            "rain_probability": round(max(entry[1].get("pop", 0) for entry in entries) * 100),
        })

    return {
        "location": {
            "city": place.get("name", current.get("name", city)),
            "state": place.get("state", ""),
            "country": place.get("country", ""),
            "latitude": lat,
            "longitude": lon,
        },
        "current": {
            "temperature": round(main["temp"]),
            "feels_like": round(main["feels_like"]),
            "temp_min": round(main.get("temp_min", main["temp"])),
            "temp_max": round(main.get("temp_max", main["temp"])),
            "condition": condition["main"],
            "description": condition["description"].title(),
            "icon": condition["icon"],
            "humidity": main["humidity"],
            "pressure": main["pressure"],
            "wind_speed": current.get("wind", {}).get("speed", 0),
            "wind_direction": current.get("wind", {}).get("deg", 0),
            "visibility": round(current.get("visibility", 0) / 1000, 1),
            "clouds": current.get("clouds", {}).get("all", 0),
            "uv_index": None,
        },
        "sun": {
            "sunrise": city_local_time(current["sys"]["sunrise"], offset),
            "sunset": city_local_time(current["sys"]["sunset"], offset),
        },
        "hourly": hourly,
        "daily": daily,
        "timezone_offset": offset,
        "updated_at": city_local_time(current["dt"], offset),
    }
