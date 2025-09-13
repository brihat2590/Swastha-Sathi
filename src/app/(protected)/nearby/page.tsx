"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Navigation,
  Star,
  Clock,
  Phone,
  RefreshCw,
  Filter,
  Crosshair,
  Activity,
} from "lucide-react";
import Link from "next/link";

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

export default function NearbyHealthFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilityType, setFacilityType] = useState("all");

  // --- Distance Calculation ---
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
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

  // --- Fetch Nearby Facilities ---
  const fetchNearby = async (latitude: number, longitude: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axios.post<ApiResponse>("/api/nearby", {
        lat: latitude,
        lon: longitude,
        facilityType: facilityType !== "all" ? facilityType : undefined,
      });

      const data = res.data;

      // add distance to each facility
      const facilitiesWithDistance = data.elements.map((facility) => {
        const distance = calculateDistance(latitude, longitude, facility.lat, facility.lon);
        return { ...facility, distance };
      });

      facilitiesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setFacilities(facilitiesWithDistance);
      setFilteredFacilities(facilitiesWithDistance);
      setLocation(data.location);
    } catch (err: any) {
      setError(err.message || "Failed to fetch facilities");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  // --- On mount, get geolocation or fallback to Bangalore ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchNearby(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.error("Geolocation failed:", err);
          setError(" Using Bangalore as fallback.");
          // Fallback: Bangalore
          fetchNearby(12.9716, 77.5946);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation not supported. Using Bangalore as fallback.");
      fetchNearby(12.9716, 77.5946);
    }
  }, [facilityType]);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" />
          Nearby Health Facilities
        </h1>
        <button
          onClick={() => fetchNearby(12.9716, 77.5946, true)}
          disabled={refreshing}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Location Info */}
      {location && (
        <p className="text-sm text-gray-600">
          Showing results near <strong>{location.city || "Unknown"}</strong>,{" "}
          {location.state || ""}
        </p>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "hospital", "clinic", "pharmacy", "doctors", "dentist"].map((type) => (
          <button
            key={type}
            onClick={() => setFacilityType(type)}
            className={`px-3 py-1 rounded-full text-sm capitalize whitespace-nowrap ${
              facilityType === type ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Facilities List */}
      {loading ? (
        <p className="text-center py-4">Loading facilities...</p>
      ) : filteredFacilities.length === 0 ? (
        <p className="text-center py-4 text-gray-500">No facilities found nearby.</p>
      ) : (
        <div className="space-y-3">
          {filteredFacilities.map((facility) => (
            <div key={facility.id} className="p-4 border rounded-xl shadow-sm bg-white space-y-2">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                {facility.tags.name || "Unnamed Facility"}
              </h2>
              <p className="text-sm text-gray-600 capitalize">{facility.tags.amenity}</p>
              {facility.distance && (
                <p className="text-sm flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  {facility.distance.toFixed(2)} km away
                </p>
              )}
              {facility.tags.phone && (
                <p className="text-sm flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {facility.tags.phone}
                </p>
              )}
              {facility.tags.opening_hours && (
                <p className="text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {facility.tags.opening_hours}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lon}`}
                  target="_blank"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View on Map
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
