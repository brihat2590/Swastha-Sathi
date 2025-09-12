"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, MapPin, Wind, Droplets, Thermometer, Sun, Activity, Heart, Shield, TrendingUp } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { toast } from "sonner"

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWeatherData = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords

        const res = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lon: longitude }),
        })

        const result = await res.json()
        setData(result)
        setLoading(false)
        setRefreshing(false)
      })
    } else {
toast.error("Geolocation is not supported by your browser.")
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchWeatherData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading weather & air quality data...</p>
        </div>
      </div>
    )
  }

  const weather = data?.weather
  const air = data?.air?.list?.[0]?.main
  const uv = data?.uv
  const forecast = data?.forecast
  console.log("weatherdata",data)

  const getUVInfo = (uvIndex: number) => {
    if (uvIndex <= 2)
      return { level: "Low", color: "bg-green-500", textColor: "text-green-600", advice: "Safe to be outside" }
    if (uvIndex <= 5)
      return {
        level: "Moderate",
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
        advice: "Seek shade during midday",
      }
    if (uvIndex <= 7)
      return { level: "High", color: "bg-orange-500", textColor: "text-orange-600", advice: "Protection required" }
    if (uvIndex <= 10)
      return { level: "Very High", color: "bg-red-500", textColor: "text-red-600", advice: "Extra protection required" }
    return { level: "Extreme", color: "bg-purple-600", textColor: "text-purple-600", advice: "Avoid being outside" }
  }

  const getComfortLevel = (temp: number, humidity: number) => {
    const heatIndex = temp + 0.5 * (humidity - 10)
    if (heatIndex < 21) return { level: "Cool", color: "bg-blue-500", comfort: 85 }
    if (heatIndex < 27) return { level: "Comfortable", color: "bg-green-500", comfort: 95 }
    if (heatIndex < 32) return { level: "Warm", color: "bg-yellow-500", comfort: 70 }
    if (heatIndex < 38) return { level: "Hot", color: "bg-orange-500", comfort: 45 }
    return { level: "Dangerous", color: "bg-red-500", comfort: 20 }
  }

  const temperatureTrend =
    forecast?.list?.slice(0, 8)?.map((item: any, index: number) => ({
      time: `${index * 3}h`,
      temp: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
    })) || []

  const healthMetrics = [
    { name: "Air Quality", value: air?.aqi ? (air.aqi / 5) * 100 : 0, color: "#8884d8" },
    { name: "UV Safety", value: uv?.value ? Math.max(0, 100 - uv.value * 10) : 50, color: "#82ca9d" },
    {
      name: "Comfort Level",
      value: weather?.main ? getComfortLevel(weather.main.temp, weather.main.humidity).comfort : 50,
      color: "#ffc658",
    },
  ]

  const getAQIInfo = (aqi: number) => {
    const aqiData = {
      1: {
        label: "Good",
        emoji: "😀",
        color: "bg-chart-1 text-white",
        description: "Air quality is satisfactory",
        textColor: "text-chart-1",
      },
      2: {
        label: "Fair",
        emoji: "🙂",
        color: "bg-chart-2 text-white",
        description: "Acceptable for most people",
        textColor: "text-chart-2",
      },
      3: {
        label: "Moderate",
        emoji: "😐",
        color: "bg-orange-500 text-white",
        description: "Sensitive groups may experience symptoms",
        textColor: "text-orange-600",
      },
      4: {
        label: "Poor",
        emoji: "😷",
        color: "bg-chart-3 text-white",
        description: "Health effects for sensitive groups",
        textColor: "text-chart-3",
      },
      5: {
        label: "Very Poor",
        emoji: "🤢",
        color: "bg-purple-600 text-white",
        description: "Health warnings for everyone",
        textColor: "text-purple-600",
      },
    }
    return aqiData[aqi as keyof typeof aqiData] || aqiData[1]
  }

  const aqiInfo = air?.aqi ? getAQIInfo(air.aqi) : null
  const uvInfo = uv?.value ? getUVInfo(uv.value) : null
  const comfortInfo = weather?.main ? getComfortLevel(weather.main.temp, weather.main.humidity) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 md:p-6">

        
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-balance">Health & Environment Monitor</h1>
            <p className="text-muted-foreground mt-1">Real-time health-focused environmental data</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Current Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{weather?.name || "Unknown Location"}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Thermometer className="h-6 w-6 text-primary" />
                  <span className="text-4xl font-bold">{Math.round(weather?.main?.temp) || "--"}°C</span>
                </div>
                <p className="text-lg capitalize text-muted-foreground mt-1">
                  {weather?.weather?.[0]?.description || "No data"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-primary" />
                Wind & Air Movement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-semibold">{weather?.wind?.speed || "--"} m/s</div>
                <p className="text-sm text-muted-foreground">Speed</p>
                {weather?.wind?.deg && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Direction: </span>
                    <span className="font-medium">{weather.wind.deg}°</span>
                  </div>
                )}
                <div className="mt-2 p-2 bg-muted rounded text-xs">Good air circulation helps disperse pollutants</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                Humidity & Comfort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Humidity</span>
                <span className="font-medium">{weather?.main?.humidity || "--"}%</span>
              </div>
              <Progress value={weather?.main?.humidity || 0} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {weather?.main?.humidity > 60
                  ? "High humidity may feel uncomfortable"
                  : weather?.main?.humidity < 30
                    ? "Low humidity may cause dry skin"
                    : "Comfortable humidity level"}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Feels like</span>
                <span className="font-medium">{Math.round(weather?.main?.feels_like) || "--"}°C</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Health Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2 text-sm">
                {air?.aqi > 3 && (
                  <div className="p-2 bg-red-50 text-red-700 rounded text-xs">⚠️ Limit outdoor activities</div>
                )}
                {uv?.value > 6 && (
                  <div className="p-2 bg-orange-50 text-orange-700 rounded text-xs">
                    ☀️ Use sunscreen & protective clothing
                  </div>
                )}
                {weather?.main?.temp > 30 && (
                  <div className="p-2 bg-yellow-50 text-yellow-700 rounded text-xs">🌡️ Stay hydrated & seek shade</div>
                )}
                {weather?.main?.temp < 5 && (
                  <div className="p-2 bg-blue-50 text-blue-700 rounded text-xs">
                    🧥 Dress warmly & protect extremities
                  </div>
                )}
                {(!air?.aqi || air.aqi <= 2) &&
                  (!uv?.value || uv.value <= 5) &&
                  weather?.main?.temp >= 15 &&
                  weather?.main?.temp <= 25 && (
                    <div className="p-2 bg-green-50 text-green-700 rounded text-xs">
                      ✅ Great conditions for outdoor activities!
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-500" />
                Air Quality Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aqiInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`text-3xl font-bold ${aqiInfo.textColor}`}>{air.aqi}/5</div>
                    <Badge className={aqiInfo.color}>{aqiInfo.label}</Badge>
                  </div>
                  <Progress value={(air.aqi / 5) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">{aqiInfo.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="h-5 w-5 text-yellow-500" />
                UV Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uvInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`text-3xl font-bold ${uvInfo.textColor}`}>{uv.value.toFixed(1)}</div>
                    <Badge className={`${uvInfo.color} text-white`}>{uvInfo.level}</Badge>
                  </div>
                  <Progress value={Math.min((uv.value / 11) * 100, 100)} className="h-2" />
                  <p className="text-sm text-muted-foreground">{uvInfo.advice}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No UV data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-red-500" />
                Comfort Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              {comfortInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-primary">{comfortInfo.comfort}%</div>
                    <Badge className={`${comfortInfo.color} text-white`}>{comfortInfo.level}</Badge>
                  </div>
                  <Progress value={comfortInfo.comfort} className="h-2" />
                  <p className="text-sm text-muted-foreground">Based on temperature & humidity</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No comfort data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                24-Hour Temperature Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={temperatureTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Temperature (°C)"
                    />
                    <Area
                      type="monotone"
                      dataKey="feels_like"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                      name="Feels Like (°C)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Health Impact Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthMetrics}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {healthMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Math.round(value as number)}%`, "Health Score"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: metric.color }}></div>
                    <div className="text-xs text-muted-foreground">{metric.name}</div>
                    <div className="text-sm font-semibold">{Math.round(metric.value)}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        

        {air && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Air Quality Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">Pollutant levels and health implications</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {air.co && (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{air.co.toFixed(1)}</div>
                    <div className="text-sm font-medium">Carbon Monoxide</div>
                    <div className="text-xs text-muted-foreground">μg/m³</div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {air.co > 10000 ? "High - Avoid prolonged exposure" : "Normal levels"}
                    </div>
                  </div>
                )}
                {air.no2 && (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{air.no2.toFixed(1)}</div>
                    <div className="text-sm font-medium">Nitrogen Dioxide</div>
                    <div className="text-xs text-muted-foreground">μg/m³</div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {air.no2 > 200 ? "High - May irritate airways" : "Acceptable levels"}
                    </div>
                  </div>
                )}
                {air.o3 && (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{air.o3.toFixed(1)}</div>
                    <div className="text-sm font-medium">Ozone</div>
                    <div className="text-xs text-muted-foreground">μg/m³</div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {air.o3 > 180 ? "High - Limit outdoor exercise" : "Safe levels"}
                    </div>
                  </div>
                )}
                {air.pm2_5 && (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{air.pm2_5.toFixed(1)}</div>
                    <div className="text-sm font-medium">Fine Particles</div>
                    <div className="text-xs text-muted-foreground">PM2.5 μg/m³</div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {air.pm2_5 > 25 ? "High - Use air purifier indoors" : "Good air quality"}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
