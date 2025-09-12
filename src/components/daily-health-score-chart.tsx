"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DailyHealthScoreChartProps {
  data: Array<{
    date: string
    score: number
  }>
}

export function DailyHealthScoreChart({ data }: DailyHealthScoreChartProps) {
  return (
    <ChartContainer
      config={{
        score: {
          label: "Health Score",
          color: "hsl(var(--primary))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-sm" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 10]} className="text-sm" tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
          <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} className="fill-primary" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
