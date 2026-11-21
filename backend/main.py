from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_URL
from weather import get_weather, WeatherServiceError

app = FastAPI(
    title="Weatherly API",
    description="Live weather and forecast API for the Weatherly 3D dashboard.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"name": "Weatherly API", "status": "running", "docs": "/docs"}

@app.get("/api/weather")
def weather(city: str = Query(..., min_length=2, max_length=100)):
    try:
        return get_weather(city.strip())
    except WeatherServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=502, detail="Unexpected weather service error. Please try again.")
