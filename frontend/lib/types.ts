export type HourForecast = {
  time: string; temperature: number; condition: string; description: string;
  icon: string; rain_probability: number;
};
export type DayForecast = {
  date: string; day: string; max_temp: number; min_temp: number;
  condition: string; description: string; icon: string; rain_probability: number;
};
export type WeatherData = {
  location: { city: string; state: string; country: string; latitude: number; longitude: number };
  current: {
    temperature: number; feels_like: number; temp_min: number; temp_max: number;
    condition: string; description: string; icon: string; humidity: number;
    pressure: number; wind_speed: number; wind_direction: number;
    visibility: number; clouds: number; uv_index: number | null;
  };
  sun: { sunrise: string; sunset: string };
  hourly: HourForecast[];
  daily: DayForecast[];
  timezone_offset: number;
  updated_at: string;
};
