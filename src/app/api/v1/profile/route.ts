// update the user profile route

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, // You must provide userId in the request body or get it from auth/session
      age,
      heightCm,
      weightKg,
      gender,
      bloodGroup,
      allergies,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        age,
        heightCm,
        weightKg,
        gender,
        bloodGroup,
        allergies,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}