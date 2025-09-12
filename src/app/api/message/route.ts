import { NextResponse } from "next/server";

export async function POST(request: Request) {
    console.log("Received a POST request");
    
    return NextResponse.json({ message: "Hello from the API!" });
}