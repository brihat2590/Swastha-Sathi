// app/api/nearby/route.ts
import { NextResponse } from "next/server";

import { getNearbyHealth } from "../../../utils/overpass";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const latParam = url.searchParams.get("lat");
    const lonParam = url.searchParams.get("lon");

    if (!latParam || !lonParam) {
      return NextResponse.json({ error: "Missing lat or lon query parameter" }, { status: 400 });
    }

    const lat = Number(latParam);
    const lon = Number(lonParam);
    const radius = Number(url.searchParams.get("radius") ?? "5000");
    const limit = Number(url.searchParams.get("limit") ?? "10");

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return NextResponse.json({ error: "Invalid lat or lon" }, { status: 400 });
    }

    const data = await getNearbyHealth(lat, lon, radius, limit);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API /api/nearby error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
