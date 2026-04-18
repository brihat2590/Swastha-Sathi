import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { mem0Client } from "@/lib/mem0";

// IN-MEMORY CACHE FOR CONTEXT
const contextCache = new Map<string, { memoryContext: string; userContextText: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Helper: Fetch user context
async function fetchUserContext(userId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/v1/getUserContext/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user context");

  return res.json();
}

type RouteParams = { params: Promise<{ chatId: string }> };

async function getUserId(req: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return session?.user?.id ?? null;
}

async function getOwnedChat(chatId: string, userId: string) {
  const chat = await prisma.chatSession.findUnique({
    where: { id: chatId },
    select: { id: true, userId: true, title: true },
  });

  if (!chat || chat.userId !== userId) {
    return null;
  }

  return chat;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const chat = await getOwnedChat(chatId, userId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fetch chat messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const chat = await getOwnedChat(chatId, userId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const body = (await req.json()) as { title?: string };
    const title = body?.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updated = await prisma.chatSession.update({
      where: { id: chatId },
      data: {
        title: title.slice(0, 100),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update chat title error:", error);
    return NextResponse.json({ error: "Failed to update chat title" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const chat = await getOwnedChat(chatId, userId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await prisma.chatSession.delete({ where: { id: chatId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}

// =======================
// POST /api/chat/[chatId]
// =======================
export async function POST(
  req: NextRequest,
  { params }: RouteParams
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
    // �️ CACHED SESSIONS / MEM0 RETRIEVAL
    // =======================
    const cacheKey = `${userId}-${chatId}`;
    const now = Date.now();
    let cachedContext = contextCache.get(cacheKey);

    let memoryContext = "";
    let userContextText = "";

    if (cachedContext && (now - cachedContext.timestamp < CACHE_TTL)) {
      memoryContext = cachedContext.memoryContext;
      userContextText = cachedContext.userContextText;
    } else {
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

      // Store in memory cache
      contextCache.set(cacheKey, {
        memoryContext,
        userContextText,
        timestamp: now,
      });
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