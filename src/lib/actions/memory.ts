"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { mem0Client } from "../mem0";

// ✅ Get all memories
export async function getUserMemories() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!mem0Client) {
    throw new Error("Memory client not initialized");
  }

  const userId = session.user.id;

  const memories = await mem0Client.search("user", {
    user_id: userId,
    limit: 50,
  });

  return memories.map((m: any) => ({
    id: m.id,
    text: m.memory || m.content || "No content",
  }));
}

// ✅ Delete single memory
export async function deleteMemory(memoryId: string) {
  const session = await auth.api.getSession({
    headers:await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!mem0Client) {
    throw new Error("Memory client not initialized");
  }

  await mem0Client.delete(memoryId);

  return { success: true };
}

// ✅ Delete all memories
export async function deleteAllMemories() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!mem0Client) {
    throw new Error("Memory client not initialized");
  }

  const userId = session.user.id;

  const memories = await mem0Client.search("user", {
    user_id: userId,
    limit: 50,
  });

  for (const m of memories) {
    if (m.id) {
      await mem0Client.delete(m.id);
    }
  }

  return { success: true };
}