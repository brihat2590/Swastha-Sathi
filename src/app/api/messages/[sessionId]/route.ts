import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"

export async function GET({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params;
    const messages = await prisma.message.findMany({
        where: {
            chatId: sessionId,

        }, orderBy: {
            createdAt: "asc"
        }
    })
    return NextResponse.json({ messages })
}