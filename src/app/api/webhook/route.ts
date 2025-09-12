import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "testtoken";
    console.log("VERIFY_TOKEN:", VERIFY_TOKEN);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
    } else {
        return new Response("Forbidden", { status: 403 });
    }
}

export async function POST(req: NextRequest) {
    console.log('data received');
    const body = await req.json();
    console.log("Received webhook:", JSON.stringify(body, null, 2));
    return NextResponse.json({ status: "EVENT_RECEIVED" });
}