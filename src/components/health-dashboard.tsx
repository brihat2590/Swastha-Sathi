"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Heart,
    Activity,
    Droplets,
    Moon,
    Utensils,
    Flame,
    Scale,
    Ruler,
    Edit,
    TrendingUp,
    Target,
    Sparkles,
    ArrowUpRight,
} from "lucide-react"
import { NutritionChart } from "./nutrition-chart"
import { HealthScoreChart } from "./health-score-chart"
import { DailyHealthScoreChart } from "./daily-health-score-chart"
import Link from "next/link"

interface HealthDashboardProps {
    data: {
        user: {
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
        last7DaysRecords: Array<{
            date: string
            proteinIntake: number
            carbIntake: number
            fatIntake: number
            caloriesIntake: number
            caloriesBurnt: number
            sleepHours: number
            waterIntake: number
            healthScore: number
        }>
    }
}

export function HealthDashboard({ data }: HealthDashboardProps) {
    const userData = data.user
    const sortedRecords = [...data.last7DaysRecords].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const dailyData = sortedRecords[0] ?? {
        proteinIntake: 0,
        carbIntake: 0,
        fatIntake: 0,
        caloriesIntake: 0,
        caloriesBurnt: 0,
        sleepHours: 0,
        waterIntake: 0,
        healthScore: 0,
    }

    const last7DaysHealthScores = data.last7DaysRecords
        .slice(0, 7)
        .reverse()
        .map((record) => ({
            date: new Date(record.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            score: record.healthScore,
        }))

    const bmi = (userData.weightKg / (userData.heightCm / 100) ** 2).toFixed(1)
    const netCalories = dailyData.caloriesIntake - dailyData.caloriesBurnt
    const allergiesText = userData.allergies === "{}" ? "None" : userData.allergies
    const clamp = (value: number) => Math.max(0, Math.min(value, 100))

    const goals = {
        protein: 100,
        carbs: 250,
        fat: 70,
        calories: 2200,
        water: 3,
        sleep: 8,
    }

    const scoreLabel =
        dailyData.healthScore >= 8
            ? "Excellent rhythm"
            : dailyData.healthScore >= 6
                ? "Solid momentum"
                : "Needs attention"

    const todayText = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    })

    const proteinProgress = clamp((dailyData.proteinIntake / goals.protein) * 100)
    const carbProgress = clamp((dailyData.carbIntake / goals.carbs) * 100)
    const fatProgress = clamp((dailyData.fatIntake / goals.fat) * 100)
    const caloriesProgress = clamp((dailyData.caloriesIntake / goals.calories) * 100)
    const waterProgress = clamp((dailyData.waterIntake / goals.water) * 100)

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#edf5f0_0%,#f7f9f8_40%,#f6f7f8_100%)] text-[#191c1b]">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8 space-y-8">
                <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/85 px-6 py-6 md:px-8 md:py-8 shadow-lg shadow-slate-300/20">
                    <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[#4f8d72]/10 blur-3xl" />
                    <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="w-fit rounded-full bg-[#e9f2ed] px-3 py-1 text-[#2a4f40] hover:bg-[#e9f2ed]">
                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                Wellness Concierge
                            </Badge>
                            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Health Dashboard</h1>
                            <p className="max-w-2xl text-sm text-[#5a665f] md:text-base">
                                Precision snapshots for your nutrition, sleep and recovery, curated for a calmer and more intentional health routine.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 md:items-end">
                            <p className="text-sm font-medium text-[#5a665f]">{todayText}</p>
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full border-slate-300 bg-white/90 text-[#1f3e34] hover:bg-[#f3f7f5]"
                            >
                                <Link href="/profile">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="rounded-full bg-[#2a4f40] text-white hover:bg-[#1f3e34]"
                            >
                                <Link href="/updateHealth">
                                    Update Today
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 rounded-3xl border-slate-200/90 bg-white/80 shadow-md shadow-slate-300/15">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border border-slate-200/80">
                                    <AvatarImage src={userData.image || "/placeholder.svg"} alt={userData.name} />
                                    <AvatarFallback className="bg-[#2a4f40] text-white text-xl">
                                        {userData.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl tracking-tight">{userData.name}</CardTitle>
                                    <p className="text-sm text-[#5a665f]">
                                        {userData.age} years old • {userData.gender} • {userData.bloodGroup || "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="rounded-2xl border border-slate-200/70 bg-[#f9fbfa] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-[#2a4f40]">
                                        <Ruler className="h-4 w-4" />
                                        <p className="text-xs uppercase tracking-wider">Height</p>
                                    </div>
                                    <p className="text-lg font-semibold">{userData.heightCm} cm</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200/70 bg-[#f9fbfa] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-[#2a4f40]">
                                        <Scale className="h-4 w-4" />
                                        <p className="text-xs uppercase tracking-wider">Weight</p>
                                    </div>
                                    <p className="text-lg font-semibold">{userData.weightKg} kg</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200/70 bg-[#f9fbfa] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-[#2a4f40]">
                                        <Activity className="h-4 w-4" />
                                        <p className="text-xs uppercase tracking-wider">BMI</p>
                                    </div>
                                    <p className="text-lg font-semibold">{bmi}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200/70 bg-[#f9fbfa] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-[#cf4444]">
                                        <Heart className="h-4 w-4" />
                                        <p className="text-xs uppercase tracking-wider text-[#2a4f40]">Allergies</p>
                                    </div>
                                    <p className="line-clamp-2 text-sm font-semibold text-[#2b3730]">{allergiesText}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200/90 bg-white/80 shadow-md shadow-slate-300/15">
                        <CardHeader className="pb-3 text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-xl">
                                <Target className="h-5 w-5 text-[#2a4f40]" />
                                Health Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <HealthScoreChart score={dailyData.healthScore} />
                            <p className="text-sm font-medium text-[#5a665f]">{scoreLabel}</p>
                            <Badge className="rounded-full bg-[#eef4f0] text-[#2a4f40] hover:bg-[#eef4f0]">
                                Today: {dailyData.healthScore}/10
                            </Badge>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card className="rounded-2xl border-slate-200/90 bg-white/80 shadow-sm shadow-slate-200/50">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a665f]">Net Calories</p>
                            <p className={`mt-3 text-2xl font-bold ${netCalories >= 0 ? "text-[#2a4f40]" : "text-[#b63e3e]"}`}>
                                {netCalories >= 0 ? "+" : ""}
                                {netCalories}
                            </p>
                            <p className="mt-1 text-xs text-[#707d75]">kcal for today</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-slate-200/90 bg-white/80 shadow-sm shadow-slate-200/50">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a665f]">Hydration</p>
                            <p className="mt-3 text-2xl font-bold text-[#2a4f40]">{dailyData.waterIntake}L</p>
                            <p className="mt-1 text-xs text-[#707d75]">Target {goals.water}L</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-slate-200/90 bg-white/80 shadow-sm shadow-slate-200/50">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a665f]">Sleep</p>
                            <p className="mt-3 text-2xl font-bold text-[#2a4f40]">{dailyData.sleepHours}h</p>
                            <p className="mt-1 text-xs text-[#707d75]">Target {goals.sleep}h</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-slate-200/90 bg-white/80 shadow-sm shadow-slate-200/50">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a665f]">Calories Burned</p>
                            <p className="mt-3 text-2xl font-bold text-[#b63e3e]">{dailyData.caloriesBurnt}</p>
                            <p className="mt-1 text-xs text-[#707d75]">kcal burned</p>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="relative overflow-hidden rounded-3xl border-slate-200/90 bg-white/85 shadow-lg shadow-slate-300/20 lg:col-span-2">
                        <div className="pointer-events-none absolute -left-24 -top-16 h-56 w-56 rounded-full bg-[#5a9278]/10 blur-3xl" />
                        <CardHeader className="relative z-10">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <TrendingUp className="h-5 w-5 text-[#2a4f40]" />
                                        Daily Health Score Trend
                                    </CardTitle>
                                    <p className="mt-1 text-sm text-[#66736c]">A 7-day rhythm view of your recovery consistency.</p>
                                </div>
                                <Badge className="rounded-full bg-[#eaf2ed] text-[#2a4f40] hover:bg-[#eaf2ed]">
                                    7-Day View
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <DailyHealthScoreChart data={last7DaysHealthScores} />
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-3xl border-slate-200/90 bg-white/85 shadow-lg shadow-slate-300/20">
                        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[#84b79f]/15 blur-3xl" />
                        <CardHeader className="relative z-10">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Utensils className="h-5 w-5 text-[#2a4f40]" />
                                Nutrition Mix
                            </CardTitle>
                            <p className="text-sm text-[#66736c]">Macronutrient balance for today.</p>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <NutritionChart
                                protein={dailyData.proteinIntake}
                                carbs={dailyData.carbIntake}
                                fat={dailyData.fatIntake}
                            />
                        </CardContent>
                    </Card>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden rounded-3xl border-slate-200/90 bg-white/85 shadow-lg shadow-slate-300/15">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#b4d4c3]/20 blur-3xl" />
                        <CardHeader className="relative z-10 pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Utensils className="h-5 w-5 text-[#2a4f40]" />
                                Nutrition
                            </CardTitle>
                            <p className="text-xs text-[#6a766f]">Macro targets with smooth progress tracking.</p>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-4">
                            <div>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span>Protein</span>
                                    <span>{dailyData.proteinIntake}g / {goals.protein}g</span>
                                </div>
                                <Progress
                                    value={proteinProgress}
                                    className="h-2 bg-[#e8eeea] [&_[data-slot=progress-indicator]]:bg-[#40627b]"
                                />
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span>Carbs</span>
                                    <span>{dailyData.carbIntake}g / {goals.carbs}g</span>
                                </div>
                                <Progress
                                    value={carbProgress}
                                    className="h-2 bg-[#e8eeea] [&_[data-slot=progress-indicator]]:bg-[#4f8d72]"
                                />
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span>Fat</span>
                                    <span>{dailyData.fatIntake}g / {goals.fat}g</span>
                                </div>
                                <Progress
                                    value={fatProgress}
                                    className="h-2 bg-[#e8eeea] [&_[data-slot=progress-indicator]]:bg-[#2a4f40]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-3xl border-slate-200/90 bg-white/85 shadow-lg shadow-slate-300/15">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-100/35 blur-3xl" />
                        <CardHeader className="relative z-10 pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Flame className="h-5 w-5 text-orange-500" />
                                Calories
                            </CardTitle>
                            <p className="text-xs text-[#6a766f]">Daily energy budget against intake goal.</p>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#2a4f40]">{dailyData.caloriesIntake}</div>
                                <div className="text-sm text-[#707d75]">of {goals.calories} kcal</div>
                                <Progress
                                    value={caloriesProgress}
                                    className="mt-2 h-2 bg-orange-100/70 [&_[data-slot=progress-indicator]]:bg-orange-500"
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Burned</span>
                                <Badge variant="destructive">{dailyData.caloriesBurnt} kcal</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-3xl border-slate-200/90 bg-white/85 shadow-lg shadow-slate-300/15">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-100/50 blur-3xl" />
                        <CardHeader className="relative z-10 pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Droplets className="h-5 w-5 text-sky-600" />
                                Hydration
                            </CardTitle>
                            <p className="text-xs text-[#6a766f]">Fluid consistency and recovery support.</p>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-sky-700">{dailyData.waterIntake}L</div>
                                <div className="text-sm text-[#707d75]">of {goals.water}L</div>
                                <Progress
                                    value={waterProgress}
                                    className="mt-2 h-2 bg-sky-100/70 [&_[data-slot=progress-indicator]]:bg-sky-600"
                                />
                            </div>
                            <div className="text-center">
                                <Badge variant={dailyData.waterIntake >= goals.water ? "default" : "secondary"}>
                                    {dailyData.waterIntake >= goals.water ? "Goal Reached" : "Keep Going"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/90 bg-white/80 shadow-sm shadow-slate-200/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Moon className="h-5 w-5 text-violet-600" />
                                Sleep
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-violet-700">{dailyData.sleepHours}h</div>
                                <div className="text-sm text-[#707d75]">of {goals.sleep}h</div>
                                <Progress value={(dailyData.sleepHours / goals.sleep) * 100} className="mt-2 h-2" />
                            </div>
                            <div className="text-center">
                                <Badge variant={dailyData.sleepHours >= goals.sleep ? "default" : "secondary"}>
                                    {dailyData.sleepHours >= goals.sleep ? "Well Rested" : "Need More Sleep"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}
