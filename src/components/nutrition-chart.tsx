"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface NutritionChartProps {
  protein: number
  carbs: number
  fat: number
}

export function NutritionChart({ protein, carbs, fat }: NutritionChartProps) {
  const data = [
    { name: "Protein", value: protein * 4, grams: protein, color: "#15803d" }, // 4 kcal per gram
    { name: "Carbs", value: carbs * 4, grams: carbs, color: "#84cc16" }, // 4 kcal per gram
    { name: "Fat", value: fat * 9, grams: fat, color: "#fbbf24" }, // 9 kcal per gram
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.grams}g ({data.value} kcal)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>
                {value}: {entry.payload.grams}g
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
