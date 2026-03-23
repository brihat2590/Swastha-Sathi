"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Send,
  Copy,
  Check,
  RotateCcw,
  StopCircle,
  ArrowDown,
  Plus,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  error?: boolean;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiMessage {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT";
  createdAt: string;
}

const normalizeText = (text: string) =>
  text.replace(/\*\*/g, "").replace(/\n{2,}/g, "\n\n").trim();

const generateChatTitle = (text: string): string => {
  const cleaned = text
    .replace(/[*#`\n]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .join(" ");

  return cleaned.substring(0, 50) || "New chat";
};

const getInitialMessage = (): Message => ({
  id: `init-${Date.now()}`,
  content: "Hello! I'm your AI health assistant. How can I help you today?",
  role: "assistant",
  timestamp: new Date(),
});

function ThinkingDots() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex gap-1.5">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-2 w-2 rounded-full bg-gray-400"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          className="h-2 w-2 rounded-full bg-gray-400"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="h-2 w-2 rounded-full bg-gray-400"
        />
      </div>
      <span className="text-xs text-gray-500">Thinking...</span>
    </div>
  );
}

function StreamCursor() {
  return <span className="stream-cursor" />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  };

  return (
    <button onClick={handleCopy} className="msg-action-btn" title="Copy" aria-label="Copy">
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

const formatChatLabel = (chat: ChatSession) => chat.title?.trim() || "New chat";

export default function ChatInterface() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingAssistantIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  const scrollToBottom = useCallback((force = false) => {
    if (!force && userScrolledUpRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = dist > 120;
    setShowScrollBtn(dist > 200);
  };

  const fetchChats = useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const res = await fetch("/api/chat", { method: "GET" });
      if (!res.ok) throw new Error("Failed to load chats");
      const data = (await res.json()) as ChatSession[];
      setChats(data);
      return data;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load chats");
      return [];
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  const loadChatMessages = useCallback(async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      setErrorMsg(null);
      const res = await fetch(`/api/chat/${chatId}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = (await res.json()) as ApiMessage[];
      const mapped: Message[] = data.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role === "USER" ? "user" : "assistant",
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(mapped.length > 0 ? mapped : [getInitialMessage()]);
      setActiveChatId(chatId);
      userScrolledUpRef.current = false;
      requestAnimationFrame(() => scrollToBottom(true));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [scrollToBottom]);

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
      await fetchChats();
    })();
  }, [fetchChats]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    // @ts-ignore browser speech api
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      setInput(e.results[0][0].transcript.replace(/^ok\b[\s,]*/i, ""));
      setIsListening(false);
      inputRef.current?.focus();
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const createNewChat = async () => {
    if (isLoading || isLoadingMessages) return;

    try {
      setErrorMsg(null);
      const res = await fetch("/api/chat/new", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create chat");
      const chat = (await res.json()) as ChatSession;

      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      setMessages([getInitialMessage()]);
      setInput("");
      userScrolledUpRef.current = false;
      requestAnimationFrame(() => scrollToBottom(true));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create chat");
    }
  };

  const streamFromServer = async (userMessage: Message, assistantId: string, chatId: string) => {
    abortRef.current = new AbortController();

    try {
      setErrorMsg(null);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: true } : m))
      );

      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      const full = normalizeText(data?.response ?? "Sorry, no response received.");
      let displayed = "";

      for (const char of full) {
        if (abortRef.current?.signal.aborted) break;
        displayed += char;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: displayed, isStreaming: true } : m
          )
        );
        if (!userScrolledUpRef.current) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        await new Promise((r) => setTimeout(r, 10));
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: displayed, isStreaming: false } : m
        )
      );

      await fetchChats();
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Sorry, I'm having trouble responding.",
                  error: true,
                  isStreaming: false,
                }
              : m
          )
        );
        setErrorMsg(err?.message || "Failed to get response.");
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
        );
      }
    } finally {
      setIsLoading(false);
      pendingAssistantIdRef.current = null;
      abortRef.current = null;
    }
  };

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading || !activeChatId) return;

      userScrolledUpRef.current = false;
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
      inputRef.current?.focus();

      const userMsg: Message = {
        id: `${Date.now()}-user`,
        content: text.trim(),
        role: "user",
        timestamp: new Date(),
      };
      const asstMsg: Message = {
        id: `${Date.now()}-assistant`,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true,
      };

      // Generate and save title on first message
      if (messages.length <= 1) {
        const title = generateChatTitle(text);

        // Update local state immediately
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId ? { ...chat, title } : chat
          )
        );

        // Persist to backend using PUT
        fetch(`/api/chat/${activeChatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        }).catch((err) => console.error("Failed to update title:", err));
      }

      pendingAssistantIdRef.current = asstMsg.id;
      setMessages((prev) => [...prev, userMsg, asstMsg]);
      setIsLoading(true);
      void streamFromServer(userMsg, asstMsg.id, activeChatId);
    },
    [activeChatId, isLoading, messages.length]
  );

  const handleSend = () => sendMessage(input);

  const handleResend = (content: string) => {
    if (isLoading || !activeChatId) return;
    sendMessage(content);
  };

  const retryLast = () => {
    const last = [...messages].reverse().find((m) => m.role === "user");
    if (last) handleResend(last.content);
  };

  const handleStop = () => abortRef.current?.abort();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showHero = messages.length <= 1;

  return (
    <>
      <style>{`
        .stream-cursor { display:inline-block; width:2px; height:1em; background:#111; margin-left:1px; vertical-align:text-bottom; animation:blink .65s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .msg-action-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:transparent; border:none; color:#bbb; cursor:pointer; transition:color .15s, background .15s; }
        .msg-action-btn:hover { background:#f4f4f4; color:#111; }
        .msg-action-btn:disabled { opacity:.3; cursor:not-allowed; }

        .chat-textarea { width:100%; resize:none; background:transparent; border:none; outline:none; font-size:15px; line-height:1.65; color:#111; padding:0; min-height:24px; max-height:200px; font-family:inherit; }
        .chat-textarea::placeholder { color:#bbb; }

        .msgs-scroll { scrollbar-width:thin; scrollbar-color:#ebebeb transparent; }
        .msgs-scroll::-webkit-scrollbar { width:4px; }
        .msgs-scroll::-webkit-scrollbar-track { background:transparent; }
        .msgs-scroll::-webkit-scrollbar-thumb { background:#ebebeb; border-radius:4px; }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-white text-[#111]" style={{ fontFamily: "'ui-sans-serif', system-ui, sans-serif" }}>
        <aside className="hidden w-[270px] shrink-0 border-r border-gray-200 bg-[#fafafa] p-3 md:flex md:flex-col">
          <button
            onClick={createNewChat}
            className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-[#111] px-3 py-2 text-sm text-white transition hover:bg-[#2b2b2b]"
            disabled={isLoading || isLoadingMessages}
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>

          <div className="flex-1 space-y-1 overflow-y-auto">
            {isLoadingChats ? (
              <p className="px-2 py-1 text-xs text-gray-500">Loading chats...</p>
            ) : chats.length === 0 ? (
              <p className="px-2 py-1 text-xs text-gray-500">No chats yet. Start with New chat.</p>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => void loadChatMessages(chat.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeChatId === chat.id
                      ? "bg-white text-[#111] shadow-sm"
                      : "text-gray-600 hover:bg-white hover:text-[#111]"
                  }`}
                >
                  <p className="truncate font-medium">{formatChatLabel(chat)}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 md:hidden">
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700"
              disabled={isLoading || isLoadingMessages}
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
            <select
              className="max-w-[62%] truncate rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-600"
              value={activeChatId ?? ""}
              onChange={(e) => {
                const selected = e.target.value;
                if (selected) {
                  void loadChatMessages(selected);
                }
              }}
            >
              <option value="">Select chat</option>
              {chats.map((chat) => (
                <option key={chat.id} value={chat.id}>
                  {formatChatLabel(chat)}
                </option>
              ))}
            </select>
          </div>

          <div
            ref={scrollContainerRef}
            className="msgs-scroll flex-1 overflow-y-auto"
            onScroll={handleScroll}
            role="log"
            aria-live="polite"
          >
            <div className="mx-auto max-w-4xl px-5 pb-44 pt-10">
              <AnimatePresence>
                {showHero && (
                  <motion.div
                    key="hero"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="mb-12 text-center"
                  >
                    <h1 className="mb-1.5 text-[28px] font-semibold tracking-tight text-[#111]">
                      {user?.name ? `Good to see you, ${user.name}.` : "How can I help you?"}
                    </h1>
                    <p className="text-sm text-[#aaa]">AI Health Assistant</p>
                    {!activeChatId && (
                      <p className="mt-3 text-xs text-gray-500">
                        Click <strong>New chat</strong> to start, or open a saved chat from the sidebar.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isLoadingMessages ? (
                <p className="text-center text-sm text-gray-500">Loading messages...</p>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`group mb-8 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                    >
                      {msg.role === "user" ? (
                        <div className="flex max-w-xl flex-col items-end gap-1.5">
                          <div className="whitespace-pre-wrap rounded-[20px] rounded-tr-[6px] bg-[#f4f4f4] px-4 py-2.5 text-[15px] leading-relaxed text-[#111]">
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <CopyButton text={msg.content} />
                            <button
                              onClick={() => handleResend(msg.content)}
                              disabled={isLoading || !activeChatId}
                              className="msg-action-btn"
                              title="Resend"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full max-w-xl flex-col gap-1.5">
                          <div className="whitespace-pre-wrap text-[15px] leading-[1.78] text-[#111]">
                            {!msg.content && !msg.error ? (
                              <ThinkingDots />
                            ) : (
                              <>
                                {msg.content}
                                {msg.isStreaming && <StreamCursor />}
                              </>
                            )}
                            {msg.error && (
                              <span className="ml-1 text-sm text-red-400">
                                Something went wrong. {" "}
                                <button onClick={retryLast} className="underline decoration-dashed hover:text-red-500">
                                  Retry
                                </button>
                              </span>
                            )}
                          </div>
                          {!msg.isStreaming && msg.content && (
                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <CopyButton text={msg.content} />
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  userScrolledUpRef.current = false;
                  scrollToBottom(true);
                }}
                className="fixed bottom-[138px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] text-[#555] shadow-sm transition-all hover:bg-gray-50"
              >
                <ArrowDown className="h-3.5 w-3.5" />
                Scroll to bottom
              </motion.button>
            )}
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 bg-white">
            <div className="pointer-events-none -mt-10 h-10 bg-gradient-to-t from-white to-transparent" />

            <div className="mx-auto max-w-4xl px-5 pb-5">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="mb-3 flex justify-center"
                  >
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[13px] text-[#555] shadow-sm transition-all hover:bg-gray-50"
                    >
                      <StopCircle className="h-3.5 w-3.5 text-[#aaa]" />
                      Stop generating
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={activeChatId ? "Message..." : "Create or select a chat first"}
                  disabled={isLoading || !activeChatId}
                  rows={1}
                  aria-label="Chat input"
                  className="chat-textarea"
                />

                <div className="shrink-0 pb-[2px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMicClick}
                      disabled={isLoading || !recognitionRef.current || !activeChatId}
                      aria-label={isListening ? "Stop" : "Voice"}
                      className={`rounded-lg p-1.5 transition-all ${
                        isListening ? "animate-pulse text-blue-500" : "text-[#ccc] hover:text-[#666]"
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                    </button>

                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading || !activeChatId}
                      aria-label="Send"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111] transition-all hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#ebebeb]"
                    >
                      <Send className="h-3.5 w-3.5 text-white disabled:text-[#bbb]" />
                    </button>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                  {errorMsg}
                  <button onClick={retryLast} className="underline decoration-dashed hover:text-red-500">
                    Retry
                  </button>
                </div>
              )}

              <p className="mt-2 text-center text-[11px] text-[#d0d0d0]">
                Enter to send. Shift+Enter for new line.
              </p>

              <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-[#c4c4c4] md:hidden">
                <MessageSquare className="h-3 w-3" />
                Open desktop view for full chat history sidebar.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}