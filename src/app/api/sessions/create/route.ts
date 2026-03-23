import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { useAuthServer } from "@/hooks/useAuthServer";

export async function POST() {
    const session = await useAuthServer();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const chatSession = await prisma.chatSession.create({
        data: {
            userId: session.user.id,
            title: "New Chat"
        }
    })
    return NextResponse.json({ chatSession })
}