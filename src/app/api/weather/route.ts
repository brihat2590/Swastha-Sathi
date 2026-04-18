import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { lat, lon } = await request.json()

    const API_KEY = process.env.OPEN_WEATHER_API_KEY

    if (!API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Fetch weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    )

    // Fetch air quality data
    const airResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`,
    )

    const uvResponse = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`)

    // Fetch 5-day forecast for trend analysis
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    )

    const weather = weatherResponse.ok ? await weatherResponse.json().catch(() => null) : null
    const air = airResponse.ok ? await airResponse.json().catch(() => null) : null
    const uv = uvResponse.ok ? await uvResponse.json().catch(() => null) : null
    const forecast = forecastResponse.ok ? await forecastResponse.json().catch(() => null) : null

    return NextResponse.json({ weather, air, uv, forecast })
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
