import { MemoryClient } from "mem0ai";

const apiKey = process.env.MEM0_API_KEY;

// ❗ DO NOT throw here
if (!apiKey) {
  console.warn("⚠️ MEM0_API_KEY is not set");
}

export const mem0Client = apiKey
  ? new MemoryClient({ apiKey })
  : null;