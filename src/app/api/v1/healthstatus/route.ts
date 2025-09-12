// route to add new info about daily health status of the user
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the import path if needed

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
    // Set time to 00:00:00 for uniqueness per day
    recordDate.setHours(0, 0, 0, 0);

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
      },
    });

    return NextResponse.json({ dailyHealthRecord: dailyRecord }, { status: 201 });
  } catch (error) {
    console.error("Daily health record error:", error);
    return NextResponse.json({ error: "Failed to add daily health record" }, { status: 500 });
  }
}