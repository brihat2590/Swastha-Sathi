import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { useAuthServer } from "@/hooks/useAuthServer";


// Helper to fetch user context from your own API
async function fetchUserContext(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/v1/getUserContext/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user context");
  return res.json();
}

// POST /api/chat
export async function POST(
  req: NextRequest,
  { params }: { params:Promise< { chatId: string }> }
) {
  try {
    const { message } = await req.json();
    const { chatId } = await params;
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ response: "Message is required" }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });
    const userId = session?.user.id;
    if (!userId) {
      return NextResponse.json({ response: "Unauthorized" }, { status: 401 });
    }

    const chat = await prisma.chatSession.findUnique({
      where: { id: chatId },
      select: { id: true, userId: true, title: true },
    });

    if (!chat || chat.userId !== userId) {
      return NextResponse.json({ response: "Chat not found" }, { status: 404 });
    }

    await prisma.message.create({
      data: {
        chatId,
        role: "USER",
        content: message.trim(),
      },
    });

    await prisma.chatSession.update({
      where: { id: chatId },
      data: {
        title: chat.title ?? message.trim().slice(0, 60),
      },
    });

    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

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
    const messagesForAI = history.map((m) => ({
      role: m.role === "USER" ? "user" : "assistant",
      content: m.content,
    }));

    const prompt =
      userContextText +
      messagesForAI.map((m) => m.content).join("\n");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });
    await prisma.message.create({
      data: {
        chatId,
        role: "ASSISTANT",
        content: text,
      },
    });

    await prisma.chatSession.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ response: "Sorry, I can't respond right now." }, { status: 500 });
  }
}
export async function GET(
  req: NextRequest,
  { params }: { params:Promise< { chatId: string }> }
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const{chatId} = await params;
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chat = await prisma.chatSession.findUnique({
    where: { id: chatId },
    select: { id: true, userId: true },
  });

  if (!chat || chat.userId !== userId) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { chatId: chatId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function PUT(
  req: NextRequest,
  { params }: { params:Promise< { chatId: string }> }
) {
//   const session = await auth.api.getSession({
//     headers: req.headers,
//   });
 const session=await useAuthServer();
  const{chatId} = await params;
  const userId =  session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chat = await prisma.chatSession.findUnique({
    where: { id: chatId },
    select: { id: true, userId: true },
  });

  if (!chat || chat.userId !== userId) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const { title } = await req.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  await prisma.chatSession.update({
    where: { id: chatId },
    data: { title },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE({params}:{params:Promise<{chatId:string}>}){
    const session=await useAuthServer();
    const{chatId}=await params;

    const chat=await prisma.chatSession.findUnique({
        where:{id:chatId},
        select:{id:true,userId:true}
})
if(!chat || chat.userId !== session?.user.id){
    return NextResponse.json({error:"Chat not found"},{status:404});
}
const deleted=await prisma.chatSession.delete({
    where:{id:chatId}
})

}