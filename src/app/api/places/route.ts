import { NextRequest, NextResponse } from "next/server";

type PlaceType = "hospital" | "clinic" | "pharmacy";

const OVERPASS_ENDPOINTS = [
	"https://overpass-api.de/api/interpreter",
	"https://overpass.kumi.systems/api/interpreter",
];
const ALLOWED_TYPES: PlaceType[] = ["hospital", "clinic", "pharmacy"];

class OverpassUpstreamError extends Error {
	status: number;

	constructor(message: string, status = 502) {
		super(message);
		this.name = "OverpassUpstreamError";
		this.status = status;
	}
}

function normalizeTypes(rawTypes: unknown): PlaceType[] {
	if (!Array.isArray(rawTypes) || rawTypes.length === 0) {
		return ALLOWED_TYPES;
	}

	const filtered = rawTypes.filter(
		(item): item is PlaceType => typeof item === "string" && ALLOWED_TYPES.includes(item as PlaceType)
	);

	return filtered.length > 0 ? filtered : ALLOWED_TYPES;
}

function buildOverpassQuery(lat: number, lon: number, radius: number, types: PlaceType[]) {
	const amenityRegex = types.join("|");
	return `
		[out:json][timeout:25];
		(
			node["amenity"~"^(${amenityRegex})$"](around:${radius},${lat},${lon});
			way["amenity"~"^(${amenityRegex})$"](around:${radius},${lat},${lon});
			relation["amenity"~"^(${amenityRegex})$"](around:${radius},${lat},${lon});
		);
		out center;
	`;
}

async function fetchFromOverpass(query: string) {
	let lastErrorText = "";
	let lastStatus = 0;

	for (const endpoint of OVERPASS_ENDPOINTS) {
		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				},
				body: `data=${encodeURIComponent(query)}`,
				cache: "no-store",
			});

			if (response.ok) {
				const raw = await response.text();
				try {
					const parsed = JSON.parse(raw);
					if (!parsed || !Array.isArray(parsed.elements)) {
						lastStatus = 502;
						lastErrorText = "Overpass returned unexpected payload shape";
						continue;
					}
					return parsed;
				} catch {
					lastStatus = 502;
					lastErrorText = `Overpass returned non-JSON response: ${raw.slice(0, 120)}`;
					continue;
				}
			}

			lastStatus = response.status;
			lastErrorText = await response.text().catch(() => "");
		} catch (error) {
			lastErrorText = error instanceof Error ? error.message : "Unknown fetch error";
		}
	}

	throw new OverpassUpstreamError(`Overpass unavailable (${lastStatus || "network"}): ${lastErrorText.slice(0, 200)}`, 502);
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(() => ({}));
		const lat = Number(body?.lat);
		const lon = Number(body?.lon);
		const radius = Math.min(Math.max(Number(body?.radius) || 5000, 500), 30000);
		const types = normalizeTypes(body?.types);

		if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
			return NextResponse.json({ error: "Valid latitude and longitude are required" }, { status: 400 });
		}

		const query = buildOverpassQuery(lat, lon, radius, types);
		const overpassData = await fetchFromOverpass(query);

		const places = (overpassData?.elements || [])
			.map((el: any) => {
				const latValue = typeof el?.lat === "number" ? el.lat : el?.center?.lat;
				const lonValue = typeof el?.lon === "number" ? el.lon : el?.center?.lon;

				if (!Number.isFinite(latValue) || !Number.isFinite(lonValue)) return null;

				const amenity = String(el?.tags?.amenity || "");
				if (!ALLOWED_TYPES.includes(amenity as PlaceType)) return null;

				return {
					id: el.id,
					name: el?.tags?.name || `Unnamed ${amenity}`,
					type: amenity as PlaceType,
					lat: latValue,
					lon: lonValue,
					address: el?.tags?.["addr:full"] || [el?.tags?.["addr:street"], el?.tags?.["addr:city"]].filter(Boolean).join(", "),
					phone: el?.tags?.phone || el?.tags?.["contact:phone"] || null,
					openingHours: el?.tags?.opening_hours || null,
					website: el?.tags?.website || el?.tags?.["contact:website"] || null,
					emergency: el?.tags?.emergency || null,
					wheelchair: el?.tags?.wheelchair || null,
				};
			})
			.filter(Boolean);

		return NextResponse.json({ places, center: { lat, lon }, radius, types });
	} catch (error) {
		console.error("Places API failed:", error);
		if (error instanceof OverpassUpstreamError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		return NextResponse.json({ error: "Failed to fetch nearby places" }, { status: 500 });
	}
}
