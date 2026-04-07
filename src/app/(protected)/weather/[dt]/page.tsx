"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Cloud,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Thermometer,
  Wind,
} from "lucide-react";

export default function WeatherDetailPage() {
  const params = useParams<{ dt: string }>();
  const selectedDt = Number(params.dt);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/weather", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          });

          const result = await res.json();
          setData(result);
        } catch {
          toast.error("Unable to load weather details.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error("Location permission denied. Enable location to continue.");
        setLoading(false);
      }
    );
  }, []);

  const item = useMemo(() => {
    const list = data?.forecast?.list || [];
    if (list.length === 0 || Number.isNaN(selectedDt)) return null;

    const exact = list.find((entry: any) => Number(entry.dt) === selectedDt);
    if (exact) return exact;

    return list.reduce((closest: any, entry: any) => {
      const diff = Math.abs(Number(entry.dt) - selectedDt);
      const closestDiff = Math.abs(Number(closest.dt) - selectedDt);
      return diff < closestDiff ? entry : closest;
    }, list[0]);
  }, [data?.forecast?.list, selectedDt]);

  const location = data?.weather?.name || "Unknown";
  const country = data?.weather?.sys?.country ? `, ${data.weather.sys.country}` : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fbf8] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-[#1f8f4d] border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-[#3d4a3f] font-medium">Loading weather details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#f7fbf8] px-4 py-8">
        <div className="max-w-3xl mx-auto rounded-3xl border border-emerald-100 bg-white/80 p-8 text-center">
          <p className="text-lg font-semibold text-[#191c1b]">Forecast details not found for this time slot.</p>
          <Link href="/weather" className="inline-flex mt-6 items-center gap-2 rounded-full bg-[#006d37] px-6 py-2 text-white font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back to Weather
          </Link>
        </div>
      </div>
    );
  }

  const dateText = new Date(selectedDt * 1000).toLocaleString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#e4f8ed_0%,#f7fbf8_35%,#f5f8f6_100%)] text-[#191c1b] px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/weather" className="inline-flex items-center gap-2 text-[#006d37] font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Weather
        </Link>

        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-6 md:p-8 shadow-lg shadow-emerald-200/40">
          <div className="flex items-center gap-2 text-[#3d4a3f] mb-2">
            <MapPin className="h-4 w-4 text-[#1f8f4d]" />
            <span>{location}{country}</span>
          </div>
          <p className="text-sm text-[#3d4a3f]">{dateText}</p>

          <div className="mt-6 flex flex-wrap items-end gap-6">
            <h1 className="text-6xl md:text-7xl font-extrabold leading-none tracking-tighter">
              {Math.round(item.main?.temp ?? 0)}°C
            </h1>
            <div className="pb-2">
              <p className="text-2xl font-semibold capitalize text-[#1f8f4d]">{item.weather?.[0]?.description || "No data"}</p>
              <p className="text-[#3d4a3f]">Feels like {Math.round(item.main?.feels_like ?? 0)}°C</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-[#3d4a3f] text-sm">
              <Thermometer className="h-4 w-4 text-[#1f8f4d]" /> Temperature Range
            </div>
            <p className="mt-2 text-2xl font-bold">{Math.round(item.main?.temp_min ?? 0)}° / {Math.round(item.main?.temp_max ?? 0)}°</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-[#3d4a3f] text-sm">
              <Droplets className="h-4 w-4 text-[#1f8f4d]" /> Humidity
            </div>
            <p className="mt-2 text-2xl font-bold">{item.main?.humidity ?? "--"}%</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-[#3d4a3f] text-sm">
              <Gauge className="h-4 w-4 text-[#1f8f4d]" /> Pressure
            </div>
            <p className="mt-2 text-2xl font-bold">{item.main?.pressure ?? "--"} hPa</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-[#3d4a3f] text-sm">
              <Wind className="h-4 w-4 text-[#1f8f4d]" /> Wind
            </div>
            <p className="mt-2 text-2xl font-bold">{item.wind?.speed ?? "--"} m/s</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-[#3d4a3f] text-sm">
              <Cloud className="h-4 w-4 text-[#1f8f4d]" /> Cloudiness
            </div>
            <p className="mt-2 text-2xl font-bold">{item.clouds?.all ?? "--"}%</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-[#3d4a3f] text-sm">
              <Eye className="h-4 w-4 text-[#1f8f4d]" /> Visibility
            </div>
            <p className="mt-2 text-2xl font-bold">{typeof item.visibility === "number" ? `${(item.visibility / 1000).toFixed(1)} km` : "--"}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
