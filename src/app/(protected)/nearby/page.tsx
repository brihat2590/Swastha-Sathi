"use client";
import React from "react"
import { useEffect, useState } from "react";

interface Facility {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    [key: string]: any;
  };
}

export default function NearbyHealthFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("📍 Got location:", latitude, longitude);

        const query = `
          [out:json];
          (
            node["amenity"="hospital"](around:5000,${latitude},${longitude});
            node["amenity"="clinic"](around:5000,${latitude},${longitude});
          );
          out body;
        `;

        try {
          const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: `data=${encodeURIComponent(query)}`,
          });

          console.log("📡 Overpass response status:", response.status);

          if (!response.ok) throw new Error("Overpass API request failed");

          const data = await response.json();
          console.log("✅ Overpass data:", data);

          setFacilities(data.elements || []);
        } catch (err: any) {
          console.error("❌ Fetch error:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <p>Loading nearby hospitals & clinics...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Nearby Hospitals & Clinics</h2>
      {facilities.length === 0 ? (
        <p>⚠️ No facilities found nearby. Try increasing the radius.</p>
      ) : (
        <ul className="space-y-2">
          {facilities.map((f) => (
            <li key={f.id} className="p-2 border rounded">
              <strong>{f.tags.name || "Unnamed Facility"}</strong>
              <p>Amenity: {f.tags.amenity}</p>
              <p>
                📍 {f.lat}, {f.lon}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
