"use client";

import "leaflet/dist/leaflet.css";

import { useMemo, useState } from "react";
import { MapPin, Navigation, Pill, Stethoscope, Building2, RefreshCw, Phone, Clock3, Globe, Cross } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from "react-leaflet";
import L from "leaflet";

type PlaceType = "hospital" | "clinic" | "pharmacy";

type Place = {
  id: number | string;
  name: string;
  type: PlaceType;
  lat: number;
  lon: number;
  address?: string;
  phone?: string | null;
  openingHours?: string | null;
  website?: string | null;
  emergency?: string | null;
  wheelchair?: string | null;
  distanceKm?: number;
};

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];
const DEFAULT_RADIUS = 5000;

const typeMeta: Record<PlaceType, { label: string; color: string; icon: typeof Building2 }> = {
  hospital: { label: "Hospitals", color: "#dc2626", icon: Building2 },
  clinic: { label: "Clinics", color: "#ea580c", icon: Stethoscope },
  pharmacy: { label: "Pharmacies", color: "#16a34a", icon: Pill },
};

const markerHtml = (color: string) =>
  `<div style="
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: ${color};
    border: 2px solid white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  "></div>`;

function markerIcon(color: string) {
  return L.divIcon({
    className: "",
    html: markerHtml(color),
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, Math.max(map.getZoom(), 13));
  return null;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Nearby1Page() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocated, setHasLocated] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [types, setTypes] = useState<PlaceType[]>(["hospital", "clinic", "pharmacy"]);

  const grouped = useMemo(() => {
    return {
      hospital: places.filter((p) => p.type === "hospital"),
      clinic: places.filter((p) => p.type === "clinic"),
      pharmacy: places.filter((p) => p.type === "pharmacy"),
    };
  }, [places]);

  const selectedTypeCount = types.length;

  const fetchPlaces = async (lat: number, lon: number, activeRadius: number, activeTypes: PlaceType[]) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat,
          lon,
          radius: activeRadius,
          types: activeTypes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unable to fetch nearby places");
      }

      const normalizedPlaces = (Array.isArray(data?.places) ? data.places : [])
        .map((place: Place) => ({
          ...place,
          distanceKm: haversineKm(lat, lon, place.lat, place.lon),
        }))
        .sort((a: Place, b: Place) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

      setPlaces(normalizedPlaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch nearby places");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const locateAndSearch = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nextCenter: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(nextCenter);
        setHasLocated(true);
        await fetchPlaces(nextCenter[0], nextCenter[1], radius, types);
      },
      () => {
        setError("Location permission denied. Please allow location to find nearby places.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleType = (type: PlaceType) => {
    setTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== type);
      }
      return [...prev, type];
    });
  };

  const runSearch = async () => {
    await fetchPlaces(center[0], center[1], radius, types);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#effcf5_0%,#f8fbf9_35%,#eef8f1_100%)] px-4 py-6 md:px-8 lg:py-8 text-[#0f172a]">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#166534] font-semibold">Nearby Services</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Hospitals, Clinics & Pharmacies</h1>
            
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={locateAndSearch}
              className="inline-flex items-center gap-2 rounded-full bg-[#166534] px-4 py-2.5 text-white font-semibold hover:bg-[#14532d] transition-colors"
              type="button"
            >
              <Navigation className="h-4 w-4" />
              Use My Location
            </button>
            <button
              onClick={runSearch}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-[#14532d] font-semibold hover:bg-emerald-50 transition-colors"
              type="button"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm p-5 space-y-5 shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Search Radius: {radius / 1000} km</label>
              <input
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-[#166534]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Place Types ({selectedTypeCount} selected)</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(typeMeta) as PlaceType[]).map((type) => {
                  const active = types.includes(type);
                  const meta = typeMeta[type];
                  const Icon = meta.icon;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={active
                        ? "inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-[#14532d]"
                        : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                      }
                    >
                      <Icon className="h-4 w-4" style={{ color: meta.color }} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Results</p>
              <p className="mt-1">{places.length} places found</p>
              <ul className="mt-2 space-y-1 text-emerald-800/90">
                <li>Hospitals: {grouped.hospital.length}</li>
                <li>Clinics: {grouped.clinic.length}</li>
                <li>Pharmacies: {grouped.pharmacy.length}</li>
              </ul>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {!hasLocated && !error && (
              <p className="text-sm text-slate-600">Tap "Use My Location" to fetch nearby places around you.</p>
            )}
          </aside>

          <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
            <MapContainer
              center={center}
              zoom={13}
              scrollWheelZoom
              className="h-[580px] w-full"
            >
              <RecenterMap center={center} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle center={center} radius={radius} pathOptions={{ color: "#166534", fillColor: "#22c55e", fillOpacity: 0.1 }} />

              <Marker position={center} icon={markerIcon("#1d4ed8")}>
                <Popup>Your current location</Popup>
              </Marker>

              {places.map((place) => {
                const meta = typeMeta[place.type] ?? typeMeta.hospital;
                return (
                  <Marker key={`${place.id}-${place.type}`} position={[place.lat, place.lon]} icon={markerIcon(meta.color)}>
                    <Popup>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{place.name}</p>
                        <p className="text-xs text-slate-600 capitalize">{place.type}</p>
                        {place.address && <p className="text-xs text-slate-700">{place.address}</p>}
                        {place.phone && <p className="text-xs text-slate-700">Phone: {place.phone}</p>}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-4 md:p-6 shadow-[0_10px_40px_rgba(21,128,61,0.08)]">
          <div className="mb-4 flex items-end justify-between gap-2">
            <h2 className="text-lg md:text-xl font-extrabold tracking-tight">Nearby List</h2>
            <p className="text-xs text-slate-500">Sorted by distance</p>
          </div>
          {places.length === 0 ? (
            <p className="text-sm text-slate-600">No places yet. Use your location and search to load data.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {places.map((place) => {
                const meta = typeMeta[place.type] ?? typeMeta.hospital;
                return (
                  <article
                    key={`card-${place.id}-${place.type}`}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-emerald-50/30 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 leading-tight">{place.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs text-slate-600 capitalize">{place.type}</p>
                          {place.distanceKm != null && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                              {place.distanceKm.toFixed(1)} km
                            </span>
                          )}
                        </div>
                      </div>
                      <MapPin className="h-4 w-4" style={{ color: meta.color }} />
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      {place.address && (
                        <p className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                          <span>{place.address}</span>
                        </p>
                      )}

                      {place.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span>{place.phone}</span>
                        </p>
                      )}

                      {place.openingHours && (
                        <p className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-slate-500" />
                          <span>{place.openingHours}</span>
                        </p>
                      )}

                      {place.website && (
                        <p className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-500" />
                          <a
                            href={place.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2 truncate"
                          >
                            {place.website}
                          </a>
                        </p>
                      )}

                      {place.emergency && (
                        <p className="flex items-center gap-2">
                          <Cross className="h-4 w-4 text-red-500" />
                          <span className="capitalize">Emergency: {place.emergency}</span>
                        </p>
                      )}

                      <p className="text-xs text-slate-500">Coordinates: {place.lat.toFixed(5)}, {place.lon.toFixed(5)}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {place.phone && (
                        <a
                          href={`tel:${place.phone}`}
                          className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                        >
                          Call
                        </a>
                      )}
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Open in OSM
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
