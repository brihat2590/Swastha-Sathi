"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  RefreshCw,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "motion/react";

interface Facility {
  id: number | string;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    phone?: string;
    opening_hours?: string;
  };
  distance?: number;
}

interface Location {
  city?: string;
  state?: string;
}

interface ApiResponse {
  elements: Facility[];
  location: Location | null;
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function NearbyHealthFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilityType, setFacilityType] = useState("all");
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: 12.9716,
    lon: 77.5946,
  });

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  const fetchNearby = async (latitude: number, longitude: number, isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axios.post<ApiResponse>("/api/nearby", {
        lat: latitude,
        lon: longitude,
        facilityType: facilityType !== "all" ? facilityType : undefined,
      });

      const facilitiesWithDistance = res.data.elements
        .map((facility) => ({
          ...facility,
          distance: calculateDistance(latitude, longitude, facility.lat, facility.lon),
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setFacilities(facilitiesWithDistance);
      setLocation(res.data.location);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch facilities");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setCoords(next);
          fetchNearby(next.lat, next.lon);
        },
        () => {
          setError("Using Bangalore as fallback.");
          fetchNearby(12.9716, 77.5946);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation not supported. Using Bangalore as fallback.");
      fetchNearby(12.9716, 77.5946);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityType]);

  const types = ["all", "hospital", "clinic", "pharmacy", "doctors", "dentist"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Animated ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-10 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl animate-pulse [animation-delay:300ms]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-pulse [animation-delay:700ms]" />
      </div>

      <main className="relative mx-auto max-w-4xl px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-500" />
              Nearby Health Facilities
            </h1>

            <button
              onClick={() => fetchNearby(coords.lat, coords.lon, true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {location && (
            <p className="mt-3 text-sm text-slate-600">
              Showing results near <strong>{location.city || "Unknown"}</strong>
              {location.state ? `, ${location.state}` : ""}
            </p>
          )}

          {/* Filters */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {types.map((type) => {
              const active = facilityType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFacilityType(type)}
                  className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm capitalize transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute inset-0 -z-10 rounded-full"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  {type}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </motion.p>
        )}

        {/* Content */}
        <section className="mt-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-1/4 rounded bg-slate-200" />
                  <div className="mt-4 h-3 w-2/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : facilities.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No facilities found nearby.</p>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              <AnimatePresence>
                {facilities.map((facility) => (
                  <motion.article
                    key={facility.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -3 }}
                    className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-200/70"
                  >
                    <h2 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Activity className="h-4 w-4" />
                      </span>
                      {facility.tags.name || "Unnamed Facility"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 capitalize">
                      {facility.tags.amenity || "healthcare"}
                    </p>

                    <div className="mt-3 grid gap-2 text-sm text-slate-700">
                      {facility.distance !== undefined && (
                        <p className="flex items-center gap-1.5">
                          <Navigation className="h-4 w-4 text-slate-500" />
                          {facility.distance.toFixed(2)} km away
                        </p>
                      )}
                      {facility.tags.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-slate-500" />
                          {facility.tags.phone}
                        </p>
                      )}
                      {facility.tags.opening_hours && (
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-500" />
                          {facility.tags.opening_hours}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lon}`}
                        target="_blank"
                        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        View on Map
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}