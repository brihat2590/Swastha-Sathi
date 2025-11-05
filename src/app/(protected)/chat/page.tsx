"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import TypingLoader from "@/components/blurLoader";

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
    <div className="border border-gray-800 ">
    <div className=" flex flex-col pt-10 md:pt-20 lg:pt-25  max-w-7xl mx-auto  ">
      {/* Navbar */}
      <div className=" top-0 z-50  border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center ">
            
            <div className="flex items-center justify-center ">
              {/* <h1 className="text-2xl font-semibold text-foreground">
                AI Health Assistant
              </h1>
              <p className="text-sm text-muted-foreground">Always here to help</p>

              <p>How can i help you {user?.name}</p> */}

              <h1 className="text-5xl font-sans text-center ">How can i help you {user?.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Chat container with spacing below navbar */}
      <div className="flex-1 overflow-y-auto mt-4 px-4 py-2">
        <div className="max-w-4xl mx-auto flex flex-col space-y-6 pb-24">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground border border-border"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <div className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {message.role === "user" && (
                <Avatar className="w-8 h-8 shrink-0">
                  {user?.image ? (
      <img src={user.image} alt={user.name || "User"} className="w-full h-full rounded-full" />
    ) : (
      // <AvatarFallback className="bg-secondary text-secondary-foreground">
      //   <User className="w-4 h-4" />
      // </AvatarFallback>
      

      <div>
        <TypingLoader/>

        
      </div>
    )}
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              loading...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border  bg-background/95 backdrop-blur   px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="min-h-[44px] pr-12 resize-none bg-input border-border focus:ring-2 focus:ring-ring focus:border-transparent rounded-xl"
            />
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              aria-label={isListening ? "Listening..." : "Speak"}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                isListening ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground hover:bg-primary/20"
              }`}
              style={{ outline: "none", border: "none" }}
            >
              <Mic className="w-5 h-5" />
            </button>
            {isListening && (
              <span className="absolute left-2 -top-6 text-xs text-primary animate-pulse">
                Listening... say "ok" to start
              </span>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}
