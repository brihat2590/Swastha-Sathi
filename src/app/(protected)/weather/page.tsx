"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  AirVent,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  MessageCircle,
  MoonStar,
  Snowflake,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";

type ForecastSlot = {
  key: number;
  dayLabel: string;
  time: string;
  temp: number;
  barHeight: number;
  isActive: boolean;
  kind:
    | "clear-day"
    | "clear-night"
    | "partly-cloudy-day"
    | "partly-cloudy-night"
    | "cloud"
    | "rain"
    | "drizzle"
    | "thunder"
    | "snow"
    | "fog";
};

export default function WeatherPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [now, setNow] = useState(new Date());

  const fetchWeatherData = async (lat: number, lon: number, silent = false) => {
    try {
      const res = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });

      const result = await res.json();
      setData(result);
    } catch {
      if (!silent) {
        toast.error("Unable to load weather data right now.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nextCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(nextCoords);
        await fetchWeatherData(nextCoords.lat, nextCoords.lon);
      },
      () => {
        toast.error("Location permission denied. Enable location to see weather impact.");
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (!coords) return;

    const weatherTimer = window.setInterval(() => {
      fetchWeatherData(coords.lat, coords.lon, true);
    }, 60_000);

    return () => window.clearInterval(weatherTimer);
  }, [coords]);

  const weather = data?.weather;
  const air = data?.air?.list?.[0]?.main;
  const uv = data?.uv;
  const forecast = data?.forecast;

  const aqiLabel = useMemo(() => {
    const map: Record<number, string> = {
      1: "Good",
      2: "Fair",
      3: "Moderate",
      4: "Poor",
      5: "Very Poor",
    };
    return map[air?.aqi ?? 0] || "Unknown";
  }, [air?.aqi]);

  const uvLabel = useMemo(() => {
    if (!uv?.value) return "Unknown";
    if (uv.value <= 2) return "Low";
    if (uv.value <= 5) return "Moderate";
    if (uv.value <= 7) return "High";
    if (uv.value <= 10) return "Very High";
    return "Extreme";
  }, [uv?.value]);

  const humidityNote = useMemo(() => {
    const humidity = weather?.main?.humidity;
    if (typeof humidity !== "number") return "No humidity data available.";
    if (humidity >= 70) return "Higher ambient moisture can increase fatigue. Add extra hydration today.";
    if (humidity <= 35) return "Low humidity can cause dryness. Keep hydration balanced through the day.";
    return "Humidity is in a comfortable range for most activities.";
  }, [weather?.main?.humidity]);

  const extendedForecast = useMemo((): ForecastSlot[] => {
    const source = forecast?.list || [];
    if (source.length === 0) return [];

    const getKind = (main: string, iconCode: string): ForecastSlot["kind"] => {
      const condition = main.toLowerCase();
      const isNight = iconCode.endsWith("n");

      if (condition.includes("thunder")) return "thunder";
      if (condition.includes("drizzle")) return "drizzle";
      if (condition.includes("rain")) return "rain";
      if (condition.includes("snow")) return "snow";
      if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) return "fog";
      if (condition.includes("cloud")) return isNight ? "partly-cloudy-night" : "partly-cloudy-day";
      if (condition.includes("clear")) return isNight ? "clear-night" : "clear-day";
      return "cloud";
    };

    const firstDate = new Date(Number(source[0].dt) * 1000);
    const roundedStart = new Date(firstDate);
    roundedStart.setMinutes(0, 0, 0);
    if (roundedStart < firstDate) {
      roundedStart.setHours(roundedStart.getHours() + 1);
    }
    const startHourTs = Math.floor(roundedStart.getTime() / 1000);
    const hoursToShow = 36;

    const slots = Array.from({ length: hoursToShow }, (_, index) => {
      const targetTs = startHourTs + index * 3600;

      const nextIndex = source.findIndex((entry: any) => Number(entry.dt) >= targetTs);
      const prevEntry = nextIndex <= 0 ? source[0] : source[nextIndex - 1];
      const nextEntry = nextIndex === -1 ? source[source.length - 1] : source[nextIndex];

      const prevTs = Number(prevEntry?.dt ?? targetTs);
      const nextTs = Number(nextEntry?.dt ?? targetTs);
      const ratio = nextTs === prevTs ? 0 : (targetTs - prevTs) / (nextTs - prevTs);

      const prevTemp = Number(prevEntry?.main?.temp ?? 0);
      const nextTemp = Number(nextEntry?.main?.temp ?? prevTemp);
      const interpolatedTemp = prevTemp + (nextTemp - prevTemp) * Math.max(0, Math.min(1, ratio));

      const conditionSource = ratio < 0.5 ? prevEntry : nextEntry;
      const mainCondition = String(conditionSource?.weather?.[0]?.main || "Clouds");
      const iconCode = String(conditionSource?.weather?.[0]?.icon || "03d");

      const slotDate = new Date(targetTs * 1000);
      const sameDay = slotDate.toDateString() === now.toDateString();

      return {
        key: targetTs,
        dayLabel: sameDay ? "Today" : slotDate.toLocaleDateString([], { weekday: "short" }),
        time: `${slotDate.getHours().toString().padStart(2, "0")}:00`,
        temp: Math.round(interpolatedTemp),
        barHeight: 40,
        isActive: index === 0,
        kind: getKind(mainCondition, iconCode),
      };
    });

    const temps = slots.map((slot) => slot.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const spread = Math.max(1, maxTemp - minTemp);

    return slots.map((slot) => ({
      ...slot,
      barHeight: 22 + ((slot.temp - minTemp) / spread) * 64,
    }));
  }, [forecast?.list, now]);

  const ForecastIcon = ({ kind, active }: { kind: ForecastSlot["kind"]; active: boolean }) => {
    if (kind === "clear-day") return <Sun className={`h-5 w-5 ${active ? "text-white" : "text-amber-500"}`} />;
    if (kind === "clear-night") return <MoonStar className={`h-5 w-5 ${active ? "text-white" : "text-indigo-500"}`} />;
    if (kind === "partly-cloudy-day") return <CloudSun className={`h-5 w-5 ${active ? "text-white" : "text-amber-500"}`} />;
    if (kind === "partly-cloudy-night") return <CloudMoon className={`h-5 w-5 ${active ? "text-white" : "text-indigo-500"}`} />;
    if (kind === "rain") return <CloudRain className={`h-5 w-5 ${active ? "text-white" : "text-blue-500"}`} />;
    if (kind === "drizzle") return <CloudDrizzle className={`h-5 w-5 ${active ? "text-white" : "text-cyan-500"}`} />;
    if (kind === "thunder") return <CloudLightning className={`h-5 w-5 ${active ? "text-white" : "text-yellow-500"}`} />;
    if (kind === "snow") return <Snowflake className={`h-5 w-5 ${active ? "text-white" : "text-sky-500"}`} />;
    if (kind === "fog") return <CloudFog className={`h-5 w-5 ${active ? "text-white" : "text-slate-500"}`} />;
    return <Cloud className={`h-5 w-5 ${active ? "text-white" : "text-slate-600"}`} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fbf8] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-[#1f8f4d] border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-[#3d4a3f] font-medium">Loading weather impact dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#e4f8ed_0%,#f7fbf8_35%,#f5f8f6_100%)] text-[#191c1b]">
      {/* <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
          <h1 className="text-lg md:text-xl font-bold text-emerald-950">Weather Impact</h1>
          <div className="relative ml-auto w-full max-w-md">
            <Search className="h-4 w-4 text-emerald-600/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-full bg-emerald-50 border border-emerald-100 rounded-full pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-300 outline-none"
              placeholder="Location or health query..."
              type="text"
            />
          </div>
          <button className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors">
            <UserCircle2 className="h-5 w-5" />
          </button>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 lg:py-8 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-[#3d4a3f] font-medium">
              <MapPin className="h-4 w-4 text-[#1f8f4d]" />
              <span>
                {weather?.name || "Unknown"}
                {weather?.sys?.country ? `, ${weather.sys.country}` : ""}
              </span>
            </div>
            <div className="flex items-baseline gap-6">
              <h2 className="text-[4rem] md:text-[5rem] lg:text-[7rem] font-extrabold leading-none tracking-tighter">
                {Math.round(weather?.main?.temp ?? 0)}°C
              </h2>
              <div className="space-y-1">
                <p className="text-xl md:text-2xl font-semibold text-[#1f8f4d] capitalize">
                  {weather?.weather?.[0]?.description || "No data"}
                </p>
                <p className="text-[#3d4a3f]">Feels like {Math.round(weather?.main?.feels_like ?? 0)}°C</p>
              </div>
            </div>
          </div>

          <div className="relative h-64 lg:h-80 w-full rounded-3xl overflow-hidden group shadow-xl shadow-emerald-200/40 lg:-mt-2">
            <img
              alt="Nature landscape for local time"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b5a2e]/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs uppercase tracking-widest opacity-80">Local Time</p>
              <p className="text-2xl font-bold">
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 rounded-3xl p-8 space-y-6 relative overflow-hidden border border-emerald-100 bg-white/70 backdrop-blur-md lg:-mt-2">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 shrink-0 text-[#ba1a1a] flex items-center justify-center">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#3d4a3f]">Humidity Warning</p>
                  <h3 className="text-xl font-bold">Clinical Alert: Humidity Impact</h3>
                </div>
              </div>
              <p className="text-[#3d4a3f] leading-relaxed text-lg mb-8">
                Ambient moisture is currently at <span className="font-bold text-[#191c1b]">{weather?.main?.humidity ?? "--"}%</span>. {humidityNote}
              </p>
              <button className="bg-[#006d37] hover:bg-[#1f8f4d] text-white px-8 py-3 rounded-full font-bold transition-all">
                Log Hydration
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#27ae60]/15 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="rounded-3xl p-8 flex flex-col justify-between border border-emerald-100 bg-white/70 backdrop-blur-md">
            <div className="space-y-4">
              <div className="h-10 w-10 shrink-0 text-[#006d37] flex items-center justify-center">
                <AirVent className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold">Air Quality</h4>
              <p className="text-sm text-[#3d4a3f]">Current conditions with health interpretation from AQI index.</p>
            </div>
            <div className="mt-8">
              <span className="text-4xl font-bold text-[#006d37] tracking-tight">{air?.aqi ?? "--"}/5</span>
              <p className="text-xs font-bold text-[#3d4a3f] mt-2 uppercase tracking-tighter">{aqiLabel}</p>
            </div>
          </div>

          <div className="rounded-3xl p-8 flex flex-col justify-between border border-emerald-100 bg-white/70 backdrop-blur-md">
            <div className="space-y-4">
              <div className="h-10 w-10 shrink-0 text-amber-600 flex items-center justify-center">
                <Sun className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold">UV Exposure</h4>
              <p className="text-sm text-[#3d4a3f]">Sunlight risk profile for prolonged outdoor activity.</p>
            </div>
            <div className="mt-8">
              <span className="text-4xl font-bold text-amber-600 tracking-tight">{uv?.value?.toFixed?.(1) ?? "--"}</span>
              <p className="text-xs font-bold text-[#3d4a3f] mt-2 uppercase tracking-tighter">Index: {uvLabel}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex justify-between items-end gap-3">
              <div>
                <h3 className="text-2xl font-bold">Hourly Forecast</h3>
                <p className="text-[#3d4a3f]">Hour-by-hour timeline for today and tomorrow. Tap any hour for full details.</p>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
              {extendedForecast.map((slot) => (
                <Link
                  href={`/weather/${slot.key}`}
                  key={slot.key}
                  className={slot.isActive
                    ? "w-[108px] rounded-2xl p-4 flex flex-col items-center gap-3 shadow-xl shadow-[#006d37]/20 scale-105 bg-[#006d37]"
                    : "w-[108px] rounded-2xl p-4 flex flex-col items-center gap-3 border border-emerald-100 bg-white/70 backdrop-blur-md transition-all hover:-translate-y-1"
                  }
                >
                  <p className={slot.isActive ? "text-[10px] font-semibold uppercase tracking-widest text-white/70" : "text-[10px] font-semibold uppercase tracking-widest text-[#3d4a3f]"}>{slot.dayLabel}</p>
                  <p className={slot.isActive ? "text-xs font-bold text-white/70" : "text-xs font-bold text-[#3d4a3f]"}>{slot.time}</p>
                  <ForecastIcon kind={slot.kind} active={slot.isActive} />
                  <p className={slot.isActive ? "text-xl font-bold text-white" : "text-xl font-bold text-[#191c1b]"}>{slot.temp}°</p>
                  <div className={slot.isActive ? "w-1 h-8 bg-white/20 rounded-full relative" : "w-1 h-8 bg-[#dbe4dd] rounded-full relative"}>
                    <div
                      className={slot.isActive ? "absolute bottom-0 w-full bg-white rounded-full" : "absolute bottom-0 w-full bg-[#006d37] rounded-full"}
                      style={{ height: `${slot.barHeight}%` }}
                    />
                  </div>
                </Link>
              ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-8 border border-emerald-100 bg-white/70 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-8">Atmospheric Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 shrink-0 text-[#1f8f4d] flex items-center justify-center">
                    <Gauge className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">Barometric Pressure</span>
                </div>
                <span className="text-base font-bold">{weather?.main?.pressure ?? "--"} hPa</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 shrink-0 text-[#1f8f4d] flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">Visibility</span>
                </div>
                <span className="text-base font-bold">
                  {typeof weather?.visibility === "number" ? `${(weather.visibility / 1000).toFixed(1)} km` : "--"}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 shrink-0 text-[#1f8f4d] flex items-center justify-center">
                    <Wind className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">Wind Velocity</span>
                </div>
                <span className="text-base font-bold">{weather?.wind?.speed ?? "--"} m/s</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 shrink-0 text-[#1f8f4d] flex items-center justify-center">
                    <Thermometer className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">Dew Point</span>
                </div>
                <span className="text-base font-bold">{weather?.main?.temp_min ? `${Math.round(weather.main.temp_min)}°C` : "--"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {air?.co != null && (
            <div className="p-4 rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur-md">
              <p className="text-xs uppercase tracking-wide text-[#3d4a3f]">Carbon Monoxide</p>
              <p className="text-2xl font-bold mt-2">{air.co.toFixed(1)}</p>
              <p className="text-xs text-[#3d4a3f] mt-1">ug/m3</p>
            </div>
          )}
          {air?.no2 != null && (
            <div className="p-4 rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur-md">
              <p className="text-xs uppercase tracking-wide text-[#3d4a3f]">Nitrogen Dioxide</p>
              <p className="text-2xl font-bold mt-2">{air.no2.toFixed(1)}</p>
              <p className="text-xs text-[#3d4a3f] mt-1">ug/m3</p>
            </div>
          )}
          {air?.o3 != null && (
            <div className="p-4 rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur-md">
              <p className="text-xs uppercase tracking-wide text-[#3d4a3f]">Ozone</p>
              <p className="text-2xl font-bold mt-2">{air.o3.toFixed(1)}</p>
              <p className="text-xs text-[#3d4a3f] mt-1">ug/m3</p>
            </div>
          )}
          {air?.pm2_5 != null && (
            <div className="p-4 rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur-md">
              <p className="text-xs uppercase tracking-wide text-[#3d4a3f]">PM2.5</p>
              <p className="text-2xl font-bold mt-2">{air.pm2_5.toFixed(1)}</p>
              <p className="text-xs text-[#3d4a3f] mt-1">ug/m3</p>
            </div>
          )}
        </section>
      </div>

      <button className="fixed bottom-6 right-6 h-14 w-14 bg-[#006d37] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-20">
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}