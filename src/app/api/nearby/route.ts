// app/api/nearby/route.ts
import { NextRequest, NextResponse } from "next/server";

// --- Reverse Geocode using Nominatim ---
async function reverseGeocode(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "HealthcareFinder/1.0 (contact@example.com)", // required by Nominatim
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    return {
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.hamlet ||
        null,
      state:
        data.address?.state ||
        data.address?.region ||
        data.address?.province ||
        null,
    };
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lat, lon, facilityType } = body;

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Get user's location info (city/state for top of UI)
    const location = await reverseGeocode(lat, lon);

    // Define facility type filters
    let amenityFilter = "hospital|clinic|doctors|dentist|pharmacy";
    if (facilityType) {
      switch (facilityType) {
        case "hospital":
          amenityFilter = "hospital";
          break;
        case "clinic":
          amenityFilter = "clinic";
          break;
        case "pharmacy":
          amenityFilter = "pharmacy";
          break;
        case "doctors":
          amenityFilter = "doctors";
          break;
        case "dentist":
          amenityFilter = "dentist";
          break;
        default:
          amenityFilter = "hospital|clinic|doctors|dentist|pharmacy";
      }
    }

    const query = `
      [out:json];
      (
        node["amenity"~"${amenityFilter}"](around:20000,${lat},${lon});
        way["amenity"~"${amenityFilter}"](around:20000,${lat},${lon});
        relation["amenity"~"${amenityFilter}"](around:20000,${lat},${lon});
      );
      out center;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: query,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from Overpass API");
    }

    const data = await response.json();

    const elements = data.elements
      .map((el: any) => {
        if (el.type === "node") {
          return { id: el.id, lat: el.lat, lon: el.lon, tags: el.tags || {} };
        }
        if (el.center) {
          return {
            id: el.id,
            lat: el.center.lat,
            lon: el.center.lon,
            tags: el.tags || {},
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ elements, location });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}