import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// --- Reverse Geocode using Nominatim ---
async function reverseGeocode(lat: number, lon: number) {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon,
        format: "json",
      },
      headers: {
        "User-Agent": "HealthcareFinder/1.0 (contact@example.com)", // required
      },
    });

    const data = res.data;

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

    // Get user's location info (city/state)
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
        node["amenity"~"${amenityFilter}"](around:30000,${lat},${lon});
        way["amenity"~"${amenityFilter}"](around:30000,${lat},${lon});
        relation["amenity"~"${amenityFilter}"](around:30000,${lat},${lon});
      );
      out center;
    `;

    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const elements = response.data.elements
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
    console.error("Nearby API failed:", err.message);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
