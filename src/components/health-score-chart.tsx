"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface HealthScoreChartProps {
  score: number
}

export function HealthScoreChart({ score }: HealthScoreChartProps) {
  const percentage = (score / 10) * 100

  const data = [
    { name: "Score", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 8) return "#15803d" // Green
    if (score >= 6) return "#84cc16" // Light green
    if (score >= 4) return "#fbbf24" // Yellow
    return "#dc2626" // Red
  }

  const COLORS = [getScoreColor(score), "#e5e7eb"]

  return (
    <div className="relative h-40 w-40 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>
            {score}
          </div>
          <div className="text-sm text-muted-foreground">/ 10</div>
        </div>
      </div>
    </div>
  )
}
