import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";


// Helper to fetch user context from your own API
async function fetchUserContext(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/v1/getUserContext/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user context");
  return res.json();
}

// POST /api/chat
export async function POST(req: NextRequest,{params}:{params:{chatId:string}}) {
  try {
    const { message } = await req.json();
    const {chatId}=await params;
    

    const session = await auth.api.getSession({
      headers: await req.headers // you need to pass the headers object.
    })
    const userId = session?.user.id;

    await prisma.message.create({
        data: {
            chatId,
            role: "USER",
            content: message,
            
        },
    })

    const history=await prisma.message.findMany({
        where:{chatId},
        orderBy:{createdAt:"desc"},
        take:20
    })

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
    const messagesForAI =history.map((m)=>({
        role:m.role==="USER"?"user":"assistant",
        content:m.content
    }))

    const prompt =
      userContextText +
      messagesForAI.map((m) => m.content).join("\n");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });
    await prisma.message.create({
        data:{
            chatId,
            role:"ASSISTANT",
            content:text
        }
    })

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ response: "Sorry, I can't respond right now." }, { status: 500 });
  }
}
export async function GET(
    req: Request,
    { params }: { params: { chatId: string } }
  ) {
  
    const messages = await prisma.message.findMany({
      where: { chatId: params.chatId },
      orderBy: { createdAt: "asc" }
    });
  
    return Response.json(messages);
  }