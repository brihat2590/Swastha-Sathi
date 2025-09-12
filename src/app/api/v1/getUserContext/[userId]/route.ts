import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the import path if needed

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // Fetch user profile and latest daily health record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        age: true,
        heightCm: true,
        weightKg: true,
        gender: true,
        bloodGroup: true,
        allergies: true,
        dailyHealthRecords: {
          orderBy: { date: "desc" },
          take: 1,
          select: {
            date: true,
            proteinIntake: true,
            carbIntake: true,
            fatIntake: true,
            caloriesIntake: true,
            caloriesBurnt: true,
            sleepHours: true,
            waterIntake: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare context for LLM
    const context = {
      id: user.id,
      name: user.name,
      age: user.age,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      allergies: user.allergies,
      latestDailyHealthRecord: user.dailyHealthRecords[0] || null,
    };

    return NextResponse.json(context, { status: 200 });
  } catch (error) {
    console.error("Fetch user health context error:", error);
    return NextResponse.json({ error: "Failed to fetch user health context" }, { status: 500 });
  }
}