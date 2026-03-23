import { useAuthServer } from "@/hooks/useAuthServer";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await useAuthServer();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const chatSessions = await prisma.chatSession.findMany({
        where: {
            userId: session.user.id
        }
    })
    return NextResponse.json({ chatSessions })
}