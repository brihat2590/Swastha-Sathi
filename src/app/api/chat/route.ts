import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// POST /api/chat
export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    // Optional: you can construct a history array for context
    const messagesForAI = [
      { role: "system", content: "You are a helpful health assistant. Answer safely and clearly." },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: messagesForAI.map((m) => m.content).join("\n"),
    });

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ response: "Sorry, I can't respond right now." }, { status: 500 });
  }
}
