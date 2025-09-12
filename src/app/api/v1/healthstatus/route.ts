import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the import path if needed

// Simple healthScore calculation function (scale 1-10)
function calculateHealthScore({
  proteinIntake,
  carbIntake,
  fatIntake,
  caloriesIntake,
  caloriesBurnt,
  sleepHours,
  waterIntake,
}: {
  proteinIntake?: number;
  carbIntake?: number;
  fatIntake?: number;
  caloriesIntake?: number;
  caloriesBurnt?: number;
  sleepHours?: number;
  waterIntake?: number;
}): number {
  let score = 0;
  let count = 0;

  // Example scoring logic (customize as needed)
  if (proteinIntake !== undefined) {
    // 50-150g protein is good
    if (proteinIntake >= 50 && proteinIntake <= 150) score += 1;
    count++;
  }
  if (carbIntake !== undefined) {
    // 100-300g carbs is good
    if (carbIntake >= 100 && carbIntake <= 300) score += 1;
    count++;
  }
  if (fatIntake !== undefined) {
    // 40-90g fat is good
    if (fatIntake >= 40 && fatIntake <= 90) score += 1;
    count++;
  }
  if (caloriesIntake !== undefined) {
    // 1500-3000 kcal is good
    if (caloriesIntake >= 1500 && caloriesIntake <= 3000) score += 1;
    count++;
  }
  if (caloriesBurnt !== undefined) {
    // 200+ kcal burnt is good
    if (caloriesBurnt >= 200) score += 1;
    count++;
  }
  if (sleepHours !== undefined) {
    // 7-9 hours is good
    if (sleepHours >= 7 && sleepHours <= 9) score += 1;
    count++;
  }
  if (waterIntake !== undefined) {
    // 2-4 liters is good
    if (waterIntake >= 2 && waterIntake <= 4) score += 1;
    count++;
  }

  // Scale score to 1-10
  if (count === 0) return 1;
  const scaledScore = Math.round((score / count) * 10);
  return Math.max(1, Math.min(10, scaledScore));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      date, // optional, defaults to today if not provided
      proteinIntake,
      carbIntake,
      fatIntake,
      caloriesIntake,
      caloriesBurnt,
      sleepHours,
      waterIntake,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // If date is provided, use it; otherwise, use today (without time)
    const recordDate = date ? new Date(date) : new Date();
    recordDate.setHours(0, 0, 0, 0);

    // Calculate healthScore
    const healthScore = calculateHealthScore({
      proteinIntake,
      carbIntake,
      fatIntake,
      caloriesIntake,
      caloriesBurnt,
      sleepHours,
      waterIntake,
    });

    // Upsert to avoid duplicate for same user and date
    const dailyRecord = await prisma.dailyHealthRecord.upsert({
      where: {
        userId_date: {
          userId,
          date: recordDate,
        },
      },
      update: {
        proteinIntake,
        carbIntake,
        fatIntake,
        caloriesIntake,
        caloriesBurnt,
        sleepHours,
        waterIntake,
        healthScore,
      },
      create: {
        userId,
        date: recordDate,
        proteinIntake,
        carbIntake,
        fatIntake,
        caloriesIntake,
        caloriesBurnt,
        sleepHours,
        waterIntake,
        healthScore,
      },
    });

    return NextResponse.json({ dailyHealthRecord: dailyRecord }, { status: 201 });
  } catch (error) {
    console.error("Daily health record error:", error);
    return NextResponse.json({ error: "Failed to add daily health record" }, { status: 500 });
  }
}