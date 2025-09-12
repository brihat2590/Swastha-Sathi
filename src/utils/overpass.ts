// utils/overpass.ts
export type Place = {
    id: number | string;
    name: string;
    type: string;           // amenity / emergency tag value (hospital / clinic / ambulance_station / etc)
    lat: number;
    lon: number;
    tags?: Record<string, string>;
  };
  
  const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
  
  /**
   * low-level fetch helper
   */
  async function fetchOverpass(query: string): Promise<any> {
    const url = `${OVERPASS_ENDPOINT}?data=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Overpass request failed: ${res.status} ${res.statusText} ${txt}`);
    }
    return res.json();
  }
  
  /**
   * Normalize OSM element to Place
   */
  function normalizeElements(elements: any[] = []): Place[] {
    return elements.map((el) => {
      const lat = typeof el.lat === "number" ? el.lat : el.center?.lat;
      const lon = typeof el.lon === "number" ? el.lon : el.center?.lon;
      return {
        id: el.id,
        name: el.tags?.name ?? el.tags?.operator ?? "Unnamed",
        type: el.tags?.amenity ?? el.tags?.emergency ?? "unknown",
        lat: Number(lat ?? 0),
        lon: Number(lon ?? 0),
        tags: el.tags ?? {},
      } as Place;
    });
  }
  
  /**
   * Build Overpass query for given filters (array of {k,v} objects)
   */
  function buildQuery(lat: number, lon: number, radius = 5000, filters: Array<{ k: string; v: string }>) {
    const parts = filters
      .map(({ k, v }) => {
        // search node/way/relation for the tag key/value
        return `node["${k}"="${v}"](around:${radius},${lat},${lon});way["${k}"="${v}"](around:${radius},${lat},${lon});relation["${k}"="${v}"](around:${radius},${lat},${lon});`;
      })
      .join("");
    return `[out:json][timeout:25];(${parts});out center;`;
  }
  
  /**
   * Public helpers
   */
  export async function getHospitals(lat: number, lon: number, radius = 5000, limit = 10): Promise<Place[]> {
    const q = buildQuery(lat, lon, radius, [{ k: "amenity", v: "hospital" }]);
    const json = await fetchOverpass(q);
    const normalized = normalizeElements(json.elements);
    return normalized.slice(0, limit);
  }
  
  export async function getClinics(lat: number, lon: number, radius = 5000, limit = 10): Promise<Place[]> {
    const q = buildQuery(lat, lon, radius, [{ k: "amenity", v: "clinic" }]);
    const json = await fetchOverpass(q);
    const normalized = normalizeElements(json.elements);
    return normalized.slice(0, limit);
  }
  
  export async function getAmbulanceStations(lat: number, lon: number, radius = 5000, limit = 10): Promise<Place[]> {
    const q = buildQuery(lat, lon, radius, [{ k: "emergency", v: "ambulance_station" }]);
    const json = await fetchOverpass(q);
    const normalized = normalizeElements(json.elements);
    return normalized.slice(0, limit);
  }
  
  /**
   * Convenience: fetch hospitals + clinics + ambulances in parallel
   */
  export async function getNearbyHealth(
    lat: number,
    lon: number,
    radius = 5000,
    limitPerType = 10
  ): Promise<{ hospitals: Place[]; clinics: Place[]; ambulances: Place[] }> {
    const [hospitals, clinics, ambulances] = await Promise.all([
      getHospitals(lat, lon, radius, limitPerType),
      getClinics(lat, lon, radius, limitPerType),
      getAmbulanceStations(lat, lon, radius, limitPerType),
    ]);
    return { hospitals, clinics, ambulances };
  }
  