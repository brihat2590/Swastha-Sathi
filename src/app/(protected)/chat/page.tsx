"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, LeafyGreen, Mic } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {motion} from "framer-motion"
import { Send, Bot, User, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import TypingLoader from "@/components/blurLoader";
import { TbAlienFilled } from "react-icons/tb";
import SuggestionBar from "@/components/suggestionBar";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const normalizeText = (text: string) =>
  text.replace(/\*\*/g, "").replace(/\n{2,}/g, "\n\n").trim();

export default function ChatInterface() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI health assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const heroTitle = [
    {
      id: 0,
      icon: <Sparkles />,
      title: "Create",
    },
    {
      id: 1,
      icon: <Code />,
      title: "Explore",
    },
    {
      id: 2,
      icon: <LeafyGreen />,
      title: "Learn",
    },
  ];
  const [input, setInput] = useState("");
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    image?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    const getSession = async () => {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser({
          name: session.data.user.name,
          email: session.data.user.email,
          image: session.data.user.image || undefined,
        });
      }
    };
    getSession();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript.replace(/^ok\b[\s,]*/i, ""));
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history: messages }),
      });
      const data = await response.json();
      const text = normalizeText(data?.response ?? "Sorry, no response received.");

      let displayed = "";
      for (const char of text) {
        displayed += char;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: displayed } : m
          )
        );
        await new Promise((r) => setTimeout(r, 10));
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: "Sorry, I'm having trouble responding." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col pt-10 md:pt-20 lg:pt-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="top-0 z-50 bg-white">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
                How can I help you{user?.name ? `, ${user.name}` : ""}?
              </h1>

              <div className="flex items-center justify-center gap-4 md:gap-8   rounded-2xl py-6 px-4 ">
                {heroTitle.map((item) => {
                  return (
                    <div key={item.id} className="flex flex-col items-center gap-2">
                      <div className="bg-gradient-to-br bg-white text-purple-800 rounded-xl p-3 shadow-md">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 overflow-y-auto mt-8 px-4 py-2">
          <div className="max-w-4xl mx-auto flex flex-col space-y-6 pb-32">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center text-black text-xl shadow-md">
                    <TbAlienFilled />
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "bg-gray-50 max-w-[85%] text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-10 h-10 shrink-0">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-full h-full rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-md">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            

            <div ref={messagesEndRef} />
          </div>
        </div>
        <SuggestionBar onSelect={(text) => setInput(text)} />

        {/* Input */}
        <div className="  left-0 right-0 bg-white   px-4 py-4 ">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="min-h-[52px] pr-14 resize-none bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl text-gray-900 placeholder:text-gray-400 "
              />
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isLoading}
                aria-label={isListening ? "Listening..." : "Speak"}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                  isListening
                    ? "bg-blue-500 text-white animate-pulse shadow-md"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                style={{ outline: "none", border: "none" }}
              >
                <Mic className="w-5 h-5" />
              </button>
              {isListening && (
                <span className="absolute left-3 -top-7 text-xs text-blue-600 font-medium animate-pulse">
                  Listening... say "ok" to start
                </span>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-[52px] w-[52px] rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}