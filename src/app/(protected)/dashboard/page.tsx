"use client"

import { useEffect, useState } from "react"
import { HealthDashboard } from "@/components/health-dashboard" 

interface UserData {
  id: string
  name: string
  email: string
  age: number
  heightCm: number
  weightKg: number
  gender: string
  bloodGroup: string | null
  allergies: string
  image: string
}

interface DailyRecord {
  date: string
  proteinIntake: number
  carbIntake: number
  fatIntake: number
  caloriesIntake: number
  caloriesBurnt: number
  sleepHours: number
  waterIntake: number
  healthScore: number
}

interface DashboardData {
  user: UserData
  dailyRecords: DailyRecord[]
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const URL = `http://localhost:3000/api/v1/dashboard`
        const response = await fetch(URL)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your health dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="text-destructive text-lg font-semibold">Error loading dashboard</div>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </div>
    )
  }

  return <HealthDashboard data={dashboardData} />
}
