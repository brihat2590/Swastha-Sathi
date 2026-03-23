export interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    error?: boolean;
    isStreaming?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
}