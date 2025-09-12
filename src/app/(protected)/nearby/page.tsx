"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Navigation, Star, Clock, Phone, RefreshCw, Filter, Crosshair, Activity, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Facility {
  id: string | number;
  lat: number;
  lon: number;
  tags: { 
    name?: string;
    amenity?: string;
    healthcare?: string;
    "contact:phone"?: string;
    opening_hours?: string;
  };
  distance?: number;
}

interface ApiResponse {
  elements: Facility[];
  location: { city?: string; state?: string } | null;
}

export default function NearbyHealthFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [location, setLocation] = useState<{ city?: string; state?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [userCoords, setUserCoords] = useState<{lat: number, lon: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNearby = async (isRefresh = false, facilityType = "all") => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({lat: latitude, lon: longitude});

        try {
          const res = await fetch("/api/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              lat: latitude, 
              lon: longitude,
              facilityType: facilityType !== "all" ? facilityType : undefined
            }),
          });

          if (!res.ok) throw new Error("Failed to fetch facilities");
          const data: ApiResponse = await res.json();

          // Calculate distances
          const facilitiesWithDistance = data.elements.map(facility => {
            const distance = calculateDistance(
              latitude, 
              longitude, 
              facility.lat, 
              facility.lon
            );
            return { ...facility, distance };
          });

          // Sort by distance
          facilitiesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

          setFacilities(facilitiesWithDistance);
          setFilteredFacilities(facilitiesWithDistance);
          setLocation(data.location);
        } catch (err: any) {
          setError(err.message || "Something went wrong");
        } finally {
          if (isRefresh) setRefreshing(false);
          else setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve location");
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(1));
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchNearby(false, filter);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query === "") {
      setFilteredFacilities(facilities);
    } else {
      setFilteredFacilities(
        facilities.filter(f => 
          f.tags.name?.toLowerCase().includes(query) ||
          f.tags.amenity?.toLowerCase().includes(query) ||
          f.tags.healthcare?.toLowerCase().includes(query)
        )
      );
    }
  };

  const getDirectionsUrl = (lat: number, lon: number): string => {
    if (!userCoords) return `https://www.google.com/maps?q=${lat},${lon}`;
    return `https://www.google.com/maps/dir/${userCoords.lat},${userCoords.lon}/${lat},${lon}`;
  };

  useEffect(() => {
    fetchNearby();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={"/dashboard"}><ChevronLeft/></Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-blue-600 " />
            Healthcare Finder
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover hospitals, clinics, pharmacies, and other healthcare facilities near your current location
          </p>
        </div>

        {/* Location and Refresh */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Your Current Location</h2>
              {location ? (
                <p className="text-gray-600">
                  {location.city || "Unknown City"}, {location.state || "Unknown State"}
                </p>
              ) : (
                <p className="text-gray-500">Locating...</p>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => fetchNearby(true, activeFilter)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#e98bad] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={` h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Location
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Facilities
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or type..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <div className="flex gap-2">
                <select 
                  value={activeFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Facilities</option>
                  <option value="hospital">Hospitals</option>
                  <option value="clinic">Clinics</option>
                  <option value="pharmacy">Pharmacies</option>
                  <option value="doctors">Doctors</option>
                  <option value="dentist">Dentists</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Filter className="h-4 w-4 mr-2" />
            Showing {filteredFacilities.length} of {facilities.length} facilities
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-medium">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md">
            <div className="animate-pulse bg-blue-100 p-5 rounded-full mb-6">
              <Crosshair className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Finding healthcare facilities</h3>
            <p className="text-gray-600">Searching for facilities near your location...</p>
          </div>
        )}

        {/* Results */}
        {!loading && filteredFacilities.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFacilities.map((facility) => (
              <div key={facility.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {facility.tags?.name || "Unnamed Facility"}
                    </h2>
                    <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      {facility.distance} km
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                      <span className="capitalize">
                        {facility.tags.healthcare || facility.tags.amenity || "Healthcare facility"}
                      </span>
                    </div>
                    
                    {facility.tags["contact:phone"] && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-5 w-5 mr-3 text-blue-500" />
                        <a href={`tel:${facility.tags["contact:phone"]}`} className="hover:text-blue-600 transition-colors">
                          {facility.tags["contact:phone"]}
                        </a>
                      </div>
                    )}
                    
                    {facility.tags.opening_hours && (
                      <div className="flex items-center text-gray-700">
                        <Clock className="h-5 w-5 mr-3 text-blue-500" />
                        <span>{facility.tags.opening_hours}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <a
                      href={getDirectionsUrl(facility.lat, facility.lon)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        <Navigation className="h-4 w-4" />
                        Directions
                      </button>
                    </a>
                    <a
                      href={`https://www.google.com/maps?q=${facility.lat},${facility.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                        View Map
                      </button>
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
                  Coordinates: {facility.lat.toFixed(5)}, {facility.lon.toFixed(5)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && facilities.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No facilities found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn't find any healthcare facilities in your area. Try refreshing your location or zooming out on the map.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Data provided by OpenStreetMap and Nominatim</p>
        </div>
      </div>
    </div>
  );
}