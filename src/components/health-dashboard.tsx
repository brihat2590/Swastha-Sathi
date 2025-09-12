"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Activity, Droplets, Moon, Utensils, Flame, Scale, Ruler, Edit, TrendingUp, Target } from "lucide-react"
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
    const dailyData = data.last7DaysRecords[0] || {} // Use most recent record

    const last7DaysHealthScores = data.last7DaysRecords
        .slice(0, 7)
        .reverse()
        .map((record, index) => ({
            date: new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: record.healthScore,
        }))

    const bmi = (userData.weightKg / (userData.heightCm / 100) ** 2).toFixed(1)
    const netCalories = dailyData.caloriesIntake - dailyData.caloriesBurnt

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-balance">Health Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Track your wellness journey</p>
                </div>
                <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    <Link href={'/profile'}>
                        Edit Profile
                    </Link>
                </Button>
            </div>

            {/* User Profile Section */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={userData.image || "/placeholder.svg"} alt={userData.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                {userData.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{userData.name}</CardTitle>
                            <p className="text-muted-foreground">
                                {userData.age} years old • {userData.gender} • {userData.bloodGroup || "Not specified"}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <Ruler className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Height</p>
                                <p className="font-semibold">{userData.heightCm} cm</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Scale className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Weight</p>
                                <p className="font-semibold">{userData.weightKg} kg</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">BMI</p>
                                <p className="font-semibold">{bmi}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Heart className="w-5 h-5 text-destructive" />
                            <div>
                                <p className="text-sm text-muted-foreground">Allergies</p>
                                <p className="font-semibold text-xs">{userData.allergies === "{}" ? "None" : userData.allergies}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Health Score & Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center space-x-2">
                            <Target className="w-5 h-5 text-primary" />
                            <span>Health Score</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <HealthScoreChart score={dailyData.healthScore} />
                        <p className="text-sm text-muted-foreground mt-4">
                            {dailyData.healthScore >= 8
                                ? "Excellent!"
                                : dailyData.healthScore >= 6
                                    ? "Good progress"
                                    : "Needs improvement"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <span>Today's Overview</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Net Calories</span>
                                    <span className={netCalories > 0 ? "text-accent" : "text-destructive"}>
                                        {netCalories > 0 ? "+" : ""}
                                        {netCalories} kcal
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Water Intake</span>
                                    <span>
                                        {dailyData.waterIntake}L / {3.0}L
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Sleep</span>
                                    <span>
                                        {dailyData.sleepHours}h / {8}h
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Calories Burned</span>
                                    <span className="text-destructive">{dailyData.caloriesBurnt} kcal</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Health Score Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <span>Daily Health Score (Last 7 Days)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DailyHealthScoreChart data={last7DaysHealthScores} />
                </CardContent>
            </Card>

            {/* Daily Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Nutrition Intake */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-lg">
                            <Utensils className="w-5 h-5 text-primary" />
                            <span>Nutrition</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Protein</span>
                                <span>
                                    {dailyData.proteinIntake}g / {100}g
                                </span>
                            </div>
                            <Progress value={(dailyData.proteinIntake / 100) * 100} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Carbs</span>
                                <span>
                                    {dailyData.carbIntake}g / {250}g
                                </span>
                            </div>
                            <Progress value={(dailyData.carbIntake / 250) * 100} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Fat</span>
                                <span>
                                    {dailyData.fatIntake}g / {70}g
                                </span>
                            </div>
                            <Progress value={(dailyData.fatIntake / 70) * 100} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Calories */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-lg">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span>Calories</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{dailyData.caloriesIntake}</div>
                            <div className="text-sm text-muted-foreground">of {2200} kcal</div>
                            <Progress value={(dailyData.caloriesIntake / 2200) * 100} className="mt-2 h-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Burned</span>
                            <Badge variant="destructive">{dailyData.caloriesBurnt} kcal</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Water Intake */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-lg">
                            <Droplets className="w-5 h-5 text-blue-500" />
                            <span>Hydration</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-500">{dailyData.waterIntake}L</div>
                            <div className="text-sm text-muted-foreground">of {3.0}L</div>
                            <Progress value={(dailyData.waterIntake / 3.0) * 100} className="mt-2 h-2" />
                        </div>
                        <div className="text-center">
                            <Badge variant={dailyData.waterIntake >= 3.0 ? "default" : "secondary"}>
                                {dailyData.waterIntake >= 3.0 ? "Goal Reached!" : "Keep Going!"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Sleep */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-lg">
                            <Moon className="w-5 h-5 text-purple-500" />
                            <span>Sleep</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-500">{dailyData.sleepHours}h</div>
                            <div className="text-sm text-muted-foreground">of {8}h</div>
                            <Progress value={(dailyData.sleepHours / 8) * 100} className="mt-2 h-2" />
                        </div>
                        <div className="text-center">
                            <Badge variant={dailyData.sleepHours >= 8 ? "default" : "secondary"}>
                                {dailyData.sleepHours >= 8 ? "Well Rested" : "Need More Sleep"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Nutrition Breakdown Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <span>Nutrition Breakdown</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <NutritionChart protein={dailyData.proteinIntake} carbs={dailyData.carbIntake} fat={dailyData.fatIntake} />
                </CardContent>
            </Card>
        </div>
    )
}
