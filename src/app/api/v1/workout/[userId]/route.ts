import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Helper to fetch user context from your own API
async function fetchUserContext(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/v1/getUserContext/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user context");
  return res.json();
}

// Define the workout guide schema using Zod
const workoutGuideSchema = z.object({
  summary: z.string(),
  recommendedExercises: z.array(z.object({
    name: z.string(),
    description: z.string(),
    sets: z.string(),
    reps: z.string(),
    rest: z.string().optional(),
    tips: z.string().optional(),
  })),
  weeklyPlan: z.array(z.object({
    day: z.string(),
    focus: z.string(),
    exercises: z.array(z.string()),
  })),
  caution: z.string(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // 1. Fetch user context
    const userContext = await fetchUserContext(userId);

    // 2. Prepare prompt for Gemini
    const prompt = `
You are a certified fitness coach AI. Based on the following user profile and latest health data, provide a personalized workout guide for the user in the specified JSON format.

User Profile & Health Data:
${JSON.stringify(userContext, null, 2)}

Return the workout guide as a JSON object with these fields:
- summary: A brief summary of the user's workout needs and goals.
- recommendedExercises: An array of objects, each with name, description, sets, reps, and optional rest and tips.
- weeklyPlan: An array of objects, each with day, focus (e.g. "upper body", "cardio"), and a list of exercises for that day.
- caution: Any warnings or special considerations based on user context.
`;

    // 3. Call Gemini to generate workout guide as an object
    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      prompt,
      schema: workoutGuideSchema,
    });

    // 4. Return the workout guide object
    return NextResponse.json(result.object, { status: 200 });
  } catch (error) {
    console.error("Error generating workout guide:", error);
    return NextResponse.json({ error: "Failed to generate workout guide" }, { status: 500 });
  }
}