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

// Define the nutrition guide schema using Zod
const nutritionGuideSchema = z.object({
  caloriesRecommendation: z.string(),
  proteinRecommendation: z.string(),
  carbRecommendation: z.string(),
  fatRecommendation: z.string(),
  waterRecommendation: z.string(),
  vitaminsMinerals: z.string(),
  mealTips: z.string(),
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
You are a certified nutritionist AI. Based on the following user profile and latest health data, provide a personalized nutrition guide for the user in the specified JSON format.

User Profile & Health Data:
${JSON.stringify(userContext, null, 2)}

Return the nutrition guide as a JSON object with these fields:
- caloriesRecommendation
- proteinRecommendation
- carbRecommendation
- fatRecommendation
- waterRecommendation
- vitaminsMinerals
- mealTips
- caution
`;

    // 3. Call Gemini to generate nutrition guide as an object
    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      prompt,
      schema: nutritionGuideSchema,
    });

    // 4. Return the nutrition guide object
    return NextResponse.json(result.object, { status: 200 });
  } catch (error) {
    console.error("Error generating nutrition guide:", error);
    return NextResponse.json({ error: "Failed to generate nutrition guide" }, { status: 500 });
  }
}