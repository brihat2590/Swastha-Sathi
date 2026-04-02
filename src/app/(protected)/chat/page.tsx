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
  Trash,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

/* ---------- Types ---------- */
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

/* ---------- Helpers ---------- */
const generateChatTitle = (text: string): string =>
  text
    .replace(/[*#`\n]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .join(" ")
    .substring(0, 50) || "New chat";

const getInitialMessage = (): Message => ({
  id: `init-${Date.now()}`,
  content: "Hello! I'm your AI health assistant. How can I help you today?",
  role: "assistant",
  timestamp: new Date(),
});

// CHANGED: Now returns exact time (e.g., 10:45 AM)
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/* ---------- UI Bits ---------- */
const ThinkingDots = () => (
  <div className="flex items-center gap-2 py-2 opacity-50">
    {[0, 0.08, 0.16].map((delay) => (
      <motion.div
        key={delay}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay }}
        className="h-2 w-2 rounded-full bg-gray-500"
      />
    ))}
  </div>
);

const StreamCursor = () => <span className="stream-cursor" />;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* no-op */
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="msg-action-btn"
      title="Copy"
      aria-label="Copy message"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function DeleteConfirmationModal({
  isOpen,
  chatTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  isOpen: boolean;
  chatTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            aria-label="Close delete dialog"
            className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/5"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-full bg-red-50 p-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete chat?</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This will permanently delete "{chatTitle}".
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
    </div>
  </div>
);

const formatChatLabel = (chat: ChatSession) => chat.title?.trim() || "New chat";

/* ---------- Main Component ---------- */
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
  const [isHydrated, setIsHydrated] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    chatId: string | null;
    chatTitle: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    chatId: null,
    chatTitle: "",
    isDeleting: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingAssistantIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // CHANGED: Improved scroll logic for smoothness
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (userScrolledUpRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    
    // Update user scroll state
    userScrolledUpRef.current = !isAtBottom;
    setShowScrollBtn(!isAtBottom && messages.length > 2);
  }, [messages.length]);

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

  const loadChatMessages = useCallback(
    async (chatId: string) => {
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
        localStorage.setItem("activeChatId", chatId);
        userScrolledUpRef.current = false;
        requestAnimationFrame(() => scrollToBottom("auto"));
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [scrollToBottom]
  );

  /* ---------- Init ---------- */
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

      const chatsData = await fetchChats();
      const savedChatId = localStorage.getItem("activeChatId");
      if (savedChatId && chatsData.some((c) => c.id === savedChatId)) {
        await loadChatMessages(savedChatId);
      }

      setIsHydrated(true);
    })();
  }, [fetchChats, loadChatMessages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

  // Initial scroll on message change
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChatId]);

  /* ---------- Handlers ---------- */
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
      localStorage.setItem("activeChatId", chat.id);
      setMessages([getInitialMessage()]);
      setInput("");
      userScrolledUpRef.current = false;
      requestAnimationFrame(() => scrollToBottom("auto"));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create chat");
    }
  };

  const openDeleteConfirm = (chatId: string, chatTitle: string) =>
    setDeleteConfirm({ isOpen: true, chatId, chatTitle, isDeleting: false });

  const closeDeleteConfirm = () =>
    setDeleteConfirm({ isOpen: false, chatId: null, chatTitle: "", isDeleting: false });

  const confirmDelete = async () => {
    if (!deleteConfirm.chatId) return;
    setDeleteConfirm((p) => ({ ...p, isDeleting: true }));
    try {
      const res = await fetch(`/api/chat/${deleteConfirm.chatId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete chat");

      setChats((prev) => prev.filter((c) => c.id !== deleteConfirm.chatId));
      if (activeChatId === deleteConfirm.chatId) {
        setActiveChatId(null);
        localStorage.removeItem("activeChatId");
        setMessages([getInitialMessage()]);
      }
      toast.success("Chat deleted");
      closeDeleteConfirm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete chat");
      setDeleteConfirm((p) => ({ ...p, isDeleting: false }));
    }
  };

  const streamFromServer = async (userMessage: Message, assistantId: string, chatId: string) => {
    abortRef.current = new AbortController();
    try {
      setErrorMsg(null);
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: true } : m)));

      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
        signal: abortRef.current.signal,
      });
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      const full = data?.response ?? "Sorry, no response received.";
      let displayed = "";

      for (const char of full) {
        if (abortRef.current?.signal.aborted) break;
        displayed += char;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: displayed, isStreaming: true } : m))
        );
        // CHANGED: Use auto behavior for streaming to prevent jitter
        if (!userScrolledUpRef.current) scrollToBottom("auto");
        await new Promise((r) => setTimeout(r, 6)); // Slightly faster typing
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: displayed, isStreaming: false } : m))
      );

      await fetchChats();
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Sorry, I’m having trouble responding.", error: true, isStreaming: false }
              : m
          )
        );
        setErrorMsg(err?.message || "Failed to get response.");
      } else {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)));
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

      if (messages.length <= 1) {
        const title = generateChatTitle(text);
        setChats((prev) => prev.map((chat) => (chat.id === activeChatId ? { ...chat, title } : chat)));
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
  const handleResend = (content: string) => !isLoading && activeChatId && sendMessage(content);
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

  if (!isHydrated) return <LoadingOverlay />;

  /* ---------- UI ---------- */
  return (
    <>
      <style>{`
        .stream-cursor { display:inline-block; width:6px; height:15px; background:#000; margin-left:2px; vertical-align:middle; border-radius: 1px; animation:blink .9s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .msg-action-btn { display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:6px; background:transparent; border:none; color:#a1a1aa; cursor:pointer; transition:all .15s; }
        .msg-action-btn:hover { background:#f4f4f5; color:#18181b; }
        .chat-textarea { width:100%; resize:none; background:transparent; border:none; outline:none; font-size:15px; line-height:1.6; color:#18181b; padding:0; min-height:24px; max-height:200px; font-family:inherit; }
        .chat-textarea::placeholder { color:#a1a1aa; }
        .msgs-scroll { scrollbar-width:thin; scrollbar-color:transparent transparent; }
        .msgs-scroll:hover { scrollbar-color:#e4e4e7 transparent; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-weight: 600; margin-top: 1.2em; margin-bottom: 0.6em; color: #111; }
        .markdown-content h1 { font-size: 1.4em; }
        .markdown-content h2 { font-size: 1.25em; }
        .markdown-content p { margin-bottom: 0.8em; line-height: 1.7; color: #374151; }
        .markdown-content ul, .markdown-content ol { margin-left: 1.2em; margin-bottom: 0.8em; color: #374151; }
        .markdown-content li { margin-bottom: 0.4em; }
        .markdown-content code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.85em; font-family: monospace; color: #111; }
        .markdown-content pre { background: #f9fafb; padding: 1em; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; border: 1px solid #e5e7eb; }
        .markdown-content pre code { background: transparent; padding: 0; color: inherit; }
        .markdown-content blockquote { border-left: 3px solid #e5e7eb; padding-left: 1em; color: #6b7280; font-style: italic; }
        .markdown-content a { color: #2563eb; text-decoration: none; font-weight: 500; }
        .markdown-content a:hover { text-decoration: underline; }
      `}</style>

      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        chatTitle={deleteConfirm.chatTitle}
        onConfirm={confirmDelete}
        onCancel={closeDeleteConfirm}
        isDeleting={deleteConfirm.isDeleting}
      />

      <div className="flex h-screen overflow-hidden bg-white text-gray-900 font-sans">
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 border-r border-gray-100 bg-gray-50/50 p-4 md:flex md:flex-col">
          <button
            onClick={createNewChat}
            className="mb-6 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black hover:shadow-md"
            disabled={isLoading || isLoadingMessages}
          >
            <Plus className="h-4 w-4" />
            <span className="flex-1 text-left">New Chat</span>
          </button>

          <Link
            href="/chat/voice"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            Open Voice Chat
          </Link>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {isLoadingChats ? (
              <div className="space-y-3 px-2">
                 <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                 <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            ) : chats.length === 0 ? (
              <p className="px-2 py-4 text-xs text-gray-400 text-center">Your chat history will appear here.</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative flex items-center rounded-lg px-3 py-2.5 transition-colors ${
                    activeChatId === chat.id
                      ? "bg-white shadow-sm ring-1 ring-gray-200/50"
                      : "hover:bg-gray-100/70"
                  }`}
                >
                  <button
                    onClick={() => void loadChatMessages(chat.id)}
                    className="flex-1 truncate text-left"
                  >
                    <p className={`truncate text-[13px] ${activeChatId === chat.id ? "font-medium text-gray-900" : "text-gray-600"}`}>
                      {formatChatLabel(chat)}
                    </p>
                  </button>
                  {activeChatId === chat.id && (
                     <button
                     onClick={(e) => {
                       e.stopPropagation();
                       openDeleteConfirm(chat.id, formatChatLabel(chat));
                     }}
                     className="ml-2 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                   >
                     <Trash className="h-3.5 w-3.5" />
                   </button>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="relative flex min-w-0 flex-1 flex-col bg-white">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 md:hidden">
             <span className="text-sm font-semibold">Health Assistant</span>
            <div className="flex items-center gap-2">
              <Link
                href="/chat/voice"
                className="rounded-md bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700"
              >
                Voice
              </Link>
              <button
                onClick={createNewChat}
                className="rounded-full bg-gray-100 p-2 text-gray-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="msgs-scroll flex-1 overflow-y-auto"
            role="log"
            aria-live="polite"
          >
            <div className="mx-auto max-w-3xl px-4 pb-48 pt-12">
              <AnimatePresence>
                {showHero && (
                  <motion.div
                    key="hero"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex h-[50vh] flex-col items-center justify-center text-center"
                  >
                    <div className="mb-6 rounded-full bg-gray-50 p-4 ring-1 ring-gray-100">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
                      {user?.name ? `Hello, ${user.name}` : "Health Assistant"}
                    </h1>
                    <p className="max-w-md text-sm text-gray-500">
                      I can help you analyze symptoms, explain medical terms, or track your wellness goals.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center pb-20">
                   <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`group mb-8 flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex max-w-2xl flex-col ${isUser ? "items-end" : "items-start"}`}>
                          <div className="mb-1.5 flex items-center gap-2 px-1">
                             <span className="text-[11px] font-medium text-gray-400">
                                {isUser ? "You" : "Assistant"}
                             </span>
                             <span className="text-[11px] text-gray-300">•</span>
                             <span className="text-[11px] text-gray-300">{formatTime(msg.timestamp)}</span>
                          </div>

                          {isUser ? (
                            // CHANGED: Blended user message (no border, subtle background)
                            <div className="relative rounded-3xl bg-gray-100/80 px-5 py-3 text-[15px] leading-relaxed text-gray-800">
                              {msg.content}
                              <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  onClick={() => handleResend(msg.content)}
                                  className="p-2 text-gray-400 hover:text-gray-600"
                                  title="Edit & Resend"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            // CHANGED: Blended assistant message (no card, no border)
                            <div className="w-full px-1">
                              {!msg.content && !msg.error ? (
                                <ThinkingDots />
                              ) : (
                                <div className="markdown-content text-[15px] text-gray-800">
                                  {msg.error ? (
                                    <span className="text-red-500">
                                      Something went wrong.{" "}
                                      <button onClick={retryLast} className="underline hover:text-red-600">
                                        Retry
                                      </button>
                                    </span>
                                  ) : (
                                    <>
                                      <ReactMarkdown
                                        components={{
                                          // Override components if needed for custom styling
                                          a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />,
                                        }}
                                      >
                                        {msg.content}
                                      </ReactMarkdown>
                                      {msg.isStreaming && <StreamCursor />}
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {!msg.isStreaming && msg.content && !msg.error && (
                                <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <CopyButton text={msg.content} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} className="h-px" />
            </div>
          </div>

          {/* Scroll button */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => scrollToBottom("smooth")}
                className="fixed bottom-32 left-1/2 -translate-x-1/2 rounded-full bg-white p-2 shadow-lg ring-1 ring-gray-200 transition hover:bg-gray-50 md:left-[60%]"
              >
                <ArrowDown className="h-4 w-4 text-gray-500" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/0 pt-10">
            <div className="mx-auto max-w-3xl px-4 pb-6">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-2 flex justify-center"
                  >
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      <StopCircle className="h-3 w-3" />
                      Stop generating
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative flex items-end gap-2 rounded-3xl bg-gray-50 p-2 ring-1 ring-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 shadow-sm transition-all">
                <div className="flex-1 pb-2 pl-4 pt-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={activeChatId ? "Ask anything..." : "Select a chat to start"}
                    disabled={isLoading || !activeChatId}
                    rows={1}
                    className="chat-textarea bg-transparent placeholder:text-gray-400"
                  />
                </div>
                
                <div className="flex shrink-0 items-center gap-1 pb-1 pr-1">
                   <button
                    onClick={handleMicClick}
                    disabled={isLoading || !recognitionRef.current || !activeChatId}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                      isListening ? "bg-red-100 text-red-600" : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || !activeChatId}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                       input.trim() 
                       ? "bg-black text-white shadow-md hover:translate-y-[-1px]" 
                       : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 text-center">
                 <p className="text-[10px] text-gray-400">
                    AI can make mistakes. Check important info.
                 </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}