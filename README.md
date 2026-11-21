# Weatherly — 3D Weather Dashboard

A starter full-stack weather app built with Next.js, TypeScript, Tailwind CSS, React Three Fiber and Python FastAPI.

## Requirements
- Node.js 20+
- Python 3.10+
- OpenWeatherMap API key

## 1. Configure the API key
Create a `.env` file in the project root (same level as `frontend` and `backend`):

```env
OPENWEATHER_API_KEY=your_openweathermap_api_key
```

Never put this key in the frontend or commit `.env`.

## 2. Start the Python backend
Open a terminal in the project root:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend docs: http://localhost:8000/docs

## 3. Start the Next.js frontend
Open a second terminal in the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Notes
- Search for a city such as `Kota`, `Jaipur`, or `London`.
- The backend uses OpenWeatherMap Geocoding, Current Weather and 5-day/3-hour Forecast endpoints.
- The forecast is based on 3-hour provider data and is grouped into daily summaries; it is not a precise daily forecast.
- Sunrise/sunset are converted using the city's timezone offset.
- 3D weather visuals are illustrative animations selected from the returned weather condition.
