import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { useAuthServer } from "@/hooks/useAuthServer";
import { mem0Client } from "@/lib/mem0";

// Helper: Fetch user context
async function fetchUserContext(userId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/v1/getUserContext/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user context");

  return res.json();
}

// =======================
// POST /api/chat/[chatId]
// =======================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { message } = await req.json();
    const { chatId } = await params;

    if (!message?.trim()) {
      return NextResponse.json(
        { response: "Message is required" },
        { status: 400 }
      );
    }

    // ✅ AUTH
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { response: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ CHAT VALIDATION
    const chat = await prisma.chatSession.findUnique({
      where: { id: chatId },
      select: { id: true, userId: true, title: true },
    });

    if (!chat || chat.userId !== userId) {
      return NextResponse.json(
        { response: "Chat not found" },
        { status: 404 }
      );
    }

    // ✅ SAVE USER MESSAGE
    await prisma.message.create({
      data: {
        chatId,
        role: "USER",
        content: message.trim(),
      },
    });

    // ✅ UPDATE TITLE
    if (!chat.title) {
      await prisma.chatSession.update({
        where: { id: chatId },
        data: {
          title: message.slice(0, 60),
        },
      });
    }

    // =======================
    // 🔥 MEM0 RETRIEVAL
    // =======================
    let memoryContext = "";

    if (mem0Client) {
      try {
        const memories = await mem0Client.search("user", {
          user_id: userId,
          limit: 10,
          query: message,
        });

        memoryContext =
          memories
            ?.map((m: any) => m.memory || m.content || "")
            .join("\n") || "";
      } catch (err) {
        console.warn("Mem0 retrieval failed:", err);
      }
    }

    // =======================
    // 📊 USER CONTEXT
    // =======================
    let userContextText = "";

    try {
      const userContext = await fetchUserContext(userId);

      if (userContext) {
        userContextText = `
User Profile:
- Age: ${userContext.age}
- Weight: ${userContext.weightKg}kg
- Height: ${userContext.heightCm}cm
- Calories Intake: ${userContext.caloriesIntake}
- Calories Burnt: ${userContext.caloriesBurnt}
- Sleep: ${userContext.sleepHours}h
- Water: ${userContext.waterIntake}L
- Allergies: ${userContext.allergies || "None"}
`;
      }
    } catch (err) {
      console.warn("User context fetch failed:", err);
    }

    // =======================
    // 🧠 CHAT HISTORY
    // =======================
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    const trimmedHistory = history.slice(-4);

    const historyText = trimmedHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    // =======================
    // 🤖 FINAL PROMPT
    // =======================
    const prompt = `
You are Health AI, a smart health assistant.

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

    // =======================
    // 🚀 GENERATE RESPONSE
    // =======================
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    const reply = text.trim();

    // =======================
    // 💾 STORE MEMORY (IMPORTANT)
    // =======================
    if (mem0Client) {
      try {
        await mem0Client.add( [
          {
            role: "user",
            content: message,
          },
          {
            role: "assistant",
            content: reply,
          },
        ], {
          user_id: userId,
        });
      } catch (err) {
        console.warn("Mem0 add failed:", err);
      }
    }

    // =======================
    // 💾 SAVE AI RESPONSE
    // =======================
    await prisma.message.create({
      data: {
        chatId,
        role: "ASSISTANT",
        content: reply,
      },
    });

    await prisma.chatSession.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ response: reply });

  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { response: "Something went wrong" },
      { status: 500 }
    );
  }
}