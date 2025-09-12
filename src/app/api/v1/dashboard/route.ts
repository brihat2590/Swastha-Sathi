import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the import path if needed
import { auth } from "@/lib/auth";

// GET /api/v1/dashboard?userId=USER_ID
export async function GET(req: NextRequest) {
    try {

        const session = await auth.api.getSession({
            headers: await req.headers // you need to pass the headers object.
        })
        const userId = session?.user.id;

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        // Fetch user personal info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                age: true,
                heightCm: true,
                weightKg: true,
                gender: true,
                bloodGroup: true,
                allergies: true,
                image: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch last 7 days of DailyHealthRecord (including today, sorted by date desc)
        const last7DaysRecords = await prisma.dailyHealthRecord.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 7,
            select: {
                date: true,
                proteinIntake: true,
                carbIntake: true,
                fatIntake: true,
                caloriesIntake: true,
                caloriesBurnt: true,
                sleepHours: true,
                waterIntake: true,
                healthScore: true,
            },
        });

        // Sort records by date ascending for charting
        last7DaysRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return NextResponse.json({
            user,
            last7DaysRecords,
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}