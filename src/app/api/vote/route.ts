import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Keep track of long-polling clients
let waitingClients: ((data: any) => void)[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }
  const voteCount=await prisma.voteCount.findUnique({
    postId:postId
  })

  return NextResponse.json({ voteCount: voteCount?.count || 0 });

  
  
}

export async function POST(req: NextRequest) {
  const { postId } = await req.json();

  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  // Increment vote count in the database
  const updatedVoteCount = await prisma.voteCount.upsert({
    where: { postId: postId },
    update: { count: { increment: 1 } },
    create: { postId: postId, count: 1 },
  });

  
 

  return NextResponse.json({ voteCount: updatedVoteCount.count });
}

