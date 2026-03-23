"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import Link from "next/link";

interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
}

export default function ChatSidebar() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await fetch("/api/sessions");
            const data = await res.json();
            setSessions(data.sessions || []);
        } catch (err) {
            console.error("Failed to load chats");
        }
    };

    return (
        <div className="w-[260px] h-screen bg-[#fafafa] border-r border-gray-200 flex flex-col">

            {/* New Chat */}
            <div className="p-3">
                <Link href="/chat">
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white hover:bg-[#222] transition">
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                </Link>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2">
                {sessions.map((chat) => (
                    <Link key={chat.id} href={`/chat/${chat.id}`}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 cursor-pointer text-sm text-[#333]">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <span className="truncate">{chat.title}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}