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
  last7DaysRecords: DailyRecord[]
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const URL = `/api/v1/dashboard`
        const response = await fetch(URL)
        

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("this is the data from dashboard",data)
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#edf5f0_0%,#f7f9f8_40%,#f6f7f8_100%)] px-4 py-10 md:px-8">
        <div className="mx-auto flex min-h-[420px] max-w-7xl items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#2a4f40] border-t-transparent" />
            <p className="font-medium text-[#4f5f57]">Loading your health dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#edf5f0_0%,#f7f9f8_40%,#f6f7f8_100%)] px-4 py-10 md:px-8">
        <div className="mx-auto flex min-h-[420px] max-w-7xl items-center justify-center">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-lg shadow-slate-300/20">
            <div className="text-lg font-semibold text-[#b63e3e]">Error loading dashboard</div>
            <p className="text-[#5a665f]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-[#2a4f40] px-5 py-2 text-white transition-colors hover:bg-[#1f3e34]"
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#edf5f0_0%,#f7f9f8_40%,#f6f7f8_100%)] px-4 py-10 md:px-8">
        <div className="mx-auto flex min-h-[420px] max-w-7xl items-center justify-center">
          <p className="text-[#5a665f]">No dashboard data available</p>
        </div>
      </div>
    )
  }

  
   return <HealthDashboard data={dashboardData} />
}
