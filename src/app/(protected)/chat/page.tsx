"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, LeafyGreen, Mic, Sparkles, Send, User } from "lucide-react";
import { TbAlienFilled } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import SuggestionBar from "@/components/suggestionBar";
import TypingLoader from "@/components/blurLoader";
import { authClient } from "@/lib/auth-client";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  error?: boolean;
}

const normalizeText = (text: string) =>
  text.replace(/\*\*/g, "").replace(/\n{2,}/g, "\n\n").trim();

export default function ChatInterface() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const initialMessage: Message = {
    id: "init",
    content: "Hello! I'm your AI health assistant. How can I help you today?",
    role: "assistant",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingAssistantIdRef = useRef<string | null>(null);
  const userAutoScrollRef = useRef(true); // track if user is near bottom

  const heroTitle = [
    { id: 0, icon: <Sparkles />, title: "Create" },
    { id: 1, icon: <Code />, title: "Explore" },
    { id: 2, icon: <LeafyGreen />, title: "Learn" },
  ];

  // Session
  useEffect(() => {
    (async () => {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser({
          name: session.data.user.name,
          email: session.data.user.email,
          image: session.data.user.image || undefined,
        });
      }
    })();
  }, []);

  // Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript.replace(/^ok\b[\s,]*/i, ""));
      setIsListening(false);
      inputRef.current?.focus();
    };
    rec.onerror = () => {
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Smart scroll (only if near bottom)
  // const scrollToBottom = () => {
  //   if (!userAutoScrollRef.current) return;
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const threshold = 160;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    userAutoScrollRef.current = distanceFromBottom < threshold;
  };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const streamAssistantText = async (full: string, assistantId: string) => {
    setIsTyping(true);
    let displayed = "";
    for (const char of full) {
      displayed += char;
      setMessages(prev =>
        prev.map(m => (m.id === assistantId ? { ...m, content: displayed } : m))
      );
      await new Promise(r => setTimeout(r, 12));
    }
    setIsTyping(false);
  };

  const sendToServer = async (userMessage: Message, assistantId: string) => {
    try {
      setErrorMsg(null);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history: messages }),
      });

      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      const text = normalizeText(data?.response ?? "Sorry, no response received.");
      await streamAssistantText(text, assistantId);
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: "Sorry, I'm having trouble responding.", error: true }
            : m
        )
      );
      setErrorMsg(err?.message || "Failed to get response.");
    } finally {
      setIsLoading(false);
      pendingAssistantIdRef.current = null;
    }
  };

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    const trimmed = input.trim();
    setInput("");
    inputRef.current?.focus();

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      content: trimmed,
      role: "user",
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };

    pendingAssistantIdRef.current = assistantMessage.id;

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);
    sendToServer(userMessage, assistantMessage.id);
  }, [input, isLoading, messages]);

  const retryLast = () => {
    if (pendingAssistantIdRef.current || isLoading) return;
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    const assistantMessage: Message = {
      id: `${Date.now()}-assistant-retry`,
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };
    pendingAssistantIdRef.current = assistantMessage.id;
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(true);
    setErrorMsg(null);
    sendToServer(lastUser, assistantMessage.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
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
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6"
              >
                How can I help you{user?.name ? `, ${user.name}` : ""}?
              </motion.h1>

              <div className="flex items-center justify-center gap-4 md:gap-8 rounded-2xl py-6 px-4">
                {heroTitle.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="bg-white text-purple-800 rounded-xl p-3 shadow-md ring-1 ring-purple-100">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat container */}
        <div
          className="flex-1 overflow-y-auto mt-8 px-4 py-2 scroll-smooth"
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
        >
          <div className="max-w-4xl mx-auto flex flex-col  pb-20">
            <AnimatePresence initial={false}>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div
                      className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center text-black text-xl shadow-md ring-1 ring-gray-200"
                      aria-label="Assistant avatar "
                    >
                      <TbAlienFilled />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[70%] rounded-2xl px-5 py-3 mt-6  shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        : "bg-gray-50 text-gray-900 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content || (message.role === "assistant" && !message.error && (
                       
                          <TypingLoader />
                        
                      ))}
                    </p>
                    {message.error && (
                      <div className="mt-2 text-xs text-red-600 flex items-center gap-2">
                        Failed to load response.
                        <button
                          onClick={retryLast}
                          className="underline decoration-dashed hover:text-red-700"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    <div
                      className={`text-xs mt-2 ${
                        message.role === "user" ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-10 h-10 shrink-0" aria-label="User avatar">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-full h-full rounded-full object-cover shadow-md ring-1 ring-gray-200"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-md">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm flex items-center gap-2">
                  <TypingLoader /> Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <SuggestionBar onSelect={text => setInput(text)} />

        {/* Input */}
        <div className="left-0 right-0 bg-white px-4 py-4 border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message... (Enter to send)"
                disabled={isLoading}
                aria-label="Chat input"
                className="min-h-[52px] pr-16 resize-none bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl text-gray-900 placeholder:text-gray-400"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isLoading || !recognitionRef.current}
                  aria-label={isListening ? "Listening..." : "Speak"}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening
                      ? "bg-blue-500 text-white animate-pulse shadow-md"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              {isListening && (
                <span className="absolute left-3 -top-6 text-xs text-blue-600 font-medium animate-pulse">
                  Listening... say "ok" to start
                </span>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              aria-label="Send message"
              className="h-[52px] w-[52px] rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          {errorMsg && (
            <div className="max-w-4xl mx-auto mt-3 text-xs text-red-600 flex items-center gap-3">
              {errorMsg}
              <button
                onClick={retryLast}
                className="px-2 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-medium"
              >
                Retry
              </button>
            </div>
          )}
          <div className="max-w-4xl mx-auto mt-2 text-[11px] text-gray-400 flex justify-between">
            <span>Press Enter to send. Ctrl+Enter for quick submit.</span>
            <span>{isListening ? "Voice input active" : "Voice input ready"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}