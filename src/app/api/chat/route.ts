import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { mem0Client } from "@/lib/mem0";
import { getUserContext } from "@/lib/actions/getUserContext";
import { getCachedUserContext,setCachedUserContext } from "@/lib/cache/userContextCache";

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json(
        { response: "Message is required" },
        { status: 400 }
      );
    }

    if (!mem0Client) {
      return NextResponse.json(
        { response: "Memory client not initialized" },
        { status: 500 }
      );
    }

    // ✅ Auth
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { response: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 🚀 PARALLEL EXECUTION (BIG WIN)
    const [memories, cachedContext] = await Promise.all([
      mem0Client.search(message, {
        user_id: userId,
        limit: 5,
      }),
      Promise.resolve(getCachedUserContext(userId)), // fast lookup
    ]);
    
    let userContext = cachedContext;
    
    // 🔥 Only fetch from DB if NOT in cache
    if (!userContext) {
      try {
        userContext = await getUserContext(userId);
    
        // ✅ store in cache
        setCachedUserContext(userId, userContext);
      } catch (err) {
        console.warn("User context fetch failed");
        userContext = null;
      }
    }

    // ✅ Lightweight memory
    const memoryContext =
      memories?.map((m: any) => m.memory || m.content || "").join("\n") || "";

    // ✅ OPTIMIZED user context (NO JSON.stringify)
    const userContextText = userContext
      ? `User Profile:
- Age: ${userContext.age}
- Weight: ${userContext.weightKg}kg
- Height: ${userContext.heightCm}cm
- Calories: ${userContext.caloriesIntake}
- Burnt: ${userContext.caloriesBurnt}
- Sleep: ${userContext.sleepHours}h
- Water: ${userContext.waterIntake}L
- Allergies: ${userContext.allergies || "None"}`
      : "";

    // ✅ LIMIT history (VERY IMPORTANT)
    const trimmedHistory = history.slice(-4);

    const historyText = trimmedHistory
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    // ✅ SHORT + EFFICIENT PROMPT
    const prompt = `
You are  Health AI, a health assistant.

Rules:
- Be concise
- Give actionable advice
- Avoid long explanations

${userContextText}

Memory:
${memoryContext}

Conversation:
${historyText}

User: ${message}
`;

    // 🚀 AI CALL
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    const reply = text.trim();

    // ⚡ NON-BLOCKING MEMORY WRITE
    mem0Client
      .add(
        [
          { role: "user", content: message },
          { role: "assistant", content: reply },
        ],
        { user_id: userId }
      )
      .catch(console.error);

    // ✅ FAST RESPONSE
    return NextResponse.json({ response: reply });

  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      { response: "Sorry, something went wrong." },
      { status: 500 }
    );
  }
}