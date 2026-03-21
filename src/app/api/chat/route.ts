import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { mem0Client } from "@/lib/mem0";

// Helper to fetch user context
async function fetchUserContext(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/v1/getUserContext/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user context");
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if(!mem0Client){
      return NextResponse.json({ response: "Memory client not initialized" }, { status: 500 });
    }

    // ✅ Validate input
    if (!message) {
      return NextResponse.json({ response: "Message is required" }, { status: 400 });
    }

    // ✅ Get session (ONLY THIS)
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ response: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ✅ Get memory
    const memories = await mem0Client.search(message, {
      user_id: userId,
      limit: 5,
    });

    const memoryContext = memories
      ?.map((m: any) => m.memory || m.content || "")
      .join("\n");

    // ✅ Fetch extra user context
    let userContextText = "";
    try {
      const userContext = await fetchUserContext(userId);
      userContextText = `User Context:\n${JSON.stringify(userContext)}\n`;
    } catch (err) {
      console.warn("User context fetch failed");
    }

    // ✅ Build FINAL prompt (single source of truth)
    const prompt = `
You are JivanMitra AI, a helpful health assistant.

Rules:
- Give safe, practical advice
- Be concise
- Be friendly

${userContextText}

Memory:
${memoryContext}

Conversation:
${(history || []).map((m: any) => `${m.role}: ${m.content}`).join("\n")}

User: ${message}
`;

    // ✅ Gemini call
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    const reply = text.trim();

    // ✅ Store memory
    await mem0Client.add(
      [
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ],
      { user_id: userId }
    );

    return NextResponse.json({ response: reply });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { response: "Sorry, something went wrong." },
      { status: 500 }
    );
  }
}