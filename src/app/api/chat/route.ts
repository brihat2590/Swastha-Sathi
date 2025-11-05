import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";


// Helper to fetch user context from your own API
async function fetchUserContext(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/v1/getUserContext/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user context");
  return res.json();
}

// POST /api/chat
export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const session = await auth.api.getSession({
      headers: await req.headers // you need to pass the headers object.
    })
    const userId = session?.user.id;

    // Fetch user context if userId is provided
    let userContextText = "";
    if (userId) {
      try {
        const userContext = await fetchUserContext(userId);
        userContextText = `User Context:\n${JSON.stringify(userContext, null, 2)}\n`;
      } catch (err) {
        console.warn("Could not fetch user context:", err);
      }
    }

    // Construct prompt for Gemini
    const messagesForAI = [
      { role: "system", content: "You are a helpful health assistant. Answer safely and clearly." },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const prompt =
      userContextText +
      messagesForAI.map((m) => m.content).join("\n");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ response: "Sorry, I can't respond right now." }, { status: 500 });
  }
}
