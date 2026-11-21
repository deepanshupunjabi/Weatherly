"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, MapPin, Wind, Droplets, Gauge, Eye, Sunrise, Sunset,
  Cloud, CloudRain, Sun, CloudSnow, Loader2, RefreshCw
} from "lucide-react";
import WeatherScene from "@/components/WeatherScene";
import type { WeatherData } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function weatherKind(condition: string, icon: string) {
  const value = condition.toLowerCase();
  if (icon.endsWith("n")) return "night";
  if (value.includes("snow")) return "snow";
  if (value.includes("rain") || value.includes("drizzle") || value.includes("thunder")) return "rain";
  if (value.includes("cloud") || value.includes("mist") || value.includes("fog") || value.includes("haze")) return "cloud";
  return "sun";
}

function WeatherIcon({ condition, className = "h-5 w-5" }: { condition: string; className?: string }) {
  const c = condition.toLowerCase();
  if (c.includes("snow")) return <CloudSnow className={className} />;
  if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder")) return <CloudRain className={className} />;
  if (c.includes("cloud") || c.includes("mist") || c.includes("fog")) return <Cloud className={className} />;
  return <Sun className={className} />;
}

export default function Home() {
  const [city, setCity] = useState("Kota");
  const [query, setQuery] = useState("Kota");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadWeather(searchCity: string) {
    if (!searchCity.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(searchCity.trim())}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Unable to fetch weather.");
      setData(result);
      setCity(result.location.city);
      setQuery(result.location.city);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadWeather("Kota"); }, []);

  const kind = data ? weatherKind(data.current.condition, data.current.icon) : "sun";

  return (
    <main className={`weather-app theme-${kind}`}>
      <WeatherScene kind={kind} />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-7 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="brand-mark"><Sun className="h-6 w-6" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">weatherly<span className="text-cyan-200">.</span></h1>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Feel the atmosphere</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/75 backdrop-blur-xl">
            <span className="live-dot" /> LIVE WEATHER
          </div>
        </header>

        <section className="mx-auto mt-10 max-w-3xl text-center sm:mt-14">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100/75">
            Your world, in real time
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Weather, <span className="text-gradient">reimagined.</span>
          </motion.h2>
          <p className="mt-4 text-sm text-white/60 sm:text-base">Explore the sky above any city on the planet.</p>

          <form onSubmit={(e) => { e.preventDefault(); void loadWeather(query); }} className="search-shell mx-auto mt-8 flex max-w-xl items-center gap-3 p-2 pl-4">
            <Search className="h-5 w-5 shrink-0 text-white/50" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a city..." aria-label="Search city" />
            <button type="submit" disabled={loading} className="search-button">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Explore"}
            </button>
          </form>
          {error && <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p>}
        </section>

        {data ? (
          <motion.div key={data.location.city} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
            <section className="hero-panel grid gap-6 overflow-hidden p-6 sm:p-8 md:grid-cols-[1.1fr_.9fr]">
              <div className="relative z-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-white/65"><MapPin className="h-4 w-4" /> {data.location.city}{data.location.state ? `, ${data.location.state}` : ""}, {data.location.country}</div>
                <div className="mt-5 flex items-start">
                  <span className="temperature">{data.current.temperature}°</span>
                  <div className="pt-3 pl-2 text-white/65">
                    <p className="text-sm">Celsius</p>
                    <p className="mt-1 text-xs">Feels like {data.current.feels_like}°</p>
                  </div>
                </div>
                <h3 className="mt-1 text-2xl font-medium">{data.current.description}</h3>
                <p className="mt-2 text-sm text-white/55">H: {data.current.temp_max}° <span className="mx-2">•</span> L: {data.current.temp_min}°</p>
                <p className="mt-6 text-xs text-white/40">Last updated at {data.updated_at} local time</p>
              </div>
              <div className="relative flex min-h-[210px] items-center justify-center">
                <div className="hero-orb"><WeatherIcon condition={data.current.condition} className="h-20 w-20" /></div>
                <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                <span className="absolute bottom-1 right-2 text-[10px] uppercase tracking-[0.25em] text-white/35">Atmospheric view</span>
              </div>
            </section>

            <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={<Droplets />} label="Humidity" value={`${data.current.humidity}%`} detail="Relative humidity" />
              <Metric icon={<Wind />} label="Wind speed" value={`${data.current.wind_speed} m/s`} detail={`${data.current.wind_direction}° direction`} />
              <Metric icon={<Gauge />} label="Pressure" value={`${data.current.pressure} hPa`} detail="Atmospheric pressure" />
              <Metric icon={<Eye />} label="Visibility" value={`${data.current.visibility} km`} detail={`${data.current.clouds}% cloud cover`} />
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
              <div className="glass-panel p-5 sm:p-6">
                <SectionTitle title="The next hours" subtitle="A little look at what's coming" />
                <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {data.hourly.map((item, i) => (
                    <div key={`${item.time}-${i}`} className="forecast-hour">
                      <p className="text-[10px] text-white/45">{i === 0 ? "Now" : item.time}</p>
                      <div className="my-3 flex justify-center text-cyan-100"><WeatherIcon condition={item.condition} className="h-5 w-5" /></div>
                      <p className="text-lg font-semibold">{item.temperature}°</p>
                      <p className="mt-1 text-[9px] text-white/40">{item.rain_probability}% rain</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-5 sm:p-6">
                <SectionTitle title="Golden hours" subtitle="The rhythm of daylight" />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="sun-time-card"><Sunrise className="h-6 w-6 text-amber-200" /><p className="mt-4 text-xs text-white/50">SUNRISE</p><p className="mt-1 text-xl font-semibold">{data.sun.sunrise}</p></div>
                  <div className="sun-time-card"><Sunset className="h-6 w-6 text-orange-200" /><p className="mt-4 text-xs text-white/50">SUNSET</p><p className="mt-1 text-xl font-semibold">{data.sun.sunset}</p></div>
                </div>
              </div>
            </section>

            <section className="glass-panel mt-5 p-5 sm:p-6">
              <SectionTitle title="5-day outlook" subtitle="A forecast for the days ahead" />
              <div className="mt-5 divide-y divide-white/[0.08]">
                {data.daily.map((day) => (
                  <div key={day.date} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 py-3 text-sm">
                    <span className="font-medium">{day.day}</span>
                    <span className="flex items-center gap-2 text-white/65"><WeatherIcon condition={day.condition} /> <span className="hidden sm:inline">{day.condition}</span></span>
                    <span className="text-right text-xs text-white/45">{day.rain_probability}% rain</span>
                    <span className="min-w-16 text-right font-semibold">{day.max_temp}° <span className="font-normal text-white/45">{day.min_temp}°</span></span>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <div className="glass-panel mx-auto mt-12 max-w-xl p-10 text-center text-white/60">
            {loading ? "Reading the sky..." : "Search a city to discover its weather."}
          </div>
        )}

        <footer className="py-8 text-center text-[10px] tracking-wide text-white/35">
          WEATHERLY • MADE FOR THE CURIOUS • WEATHER DATA BY OPENWEATHER
        </footer>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between text-white/55"><span className="text-xs">{label}</span><span className="text-cyan-100">{icon}</span></div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-[10px] text-white/40">{detail}</p>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h3 className="text-base font-semibold">{title}</h3><p className="mt-1 text-xs text-white/45">{subtitle}</p></div>;
}
