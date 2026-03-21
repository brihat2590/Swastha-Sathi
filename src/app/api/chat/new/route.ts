import  prisma  from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const session = await auth.api.getSession({
    headers: req.headers
  });
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const chat = await prisma.chatSession.create({
    data:{
        userId:session?.user.id
    }
  });

  return NextResponse.json(chat);
}