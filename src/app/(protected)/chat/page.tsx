"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mic,
  Send,
  Copy,
  Check,
  Loader2,
  RotateCcw,
  StopCircle,
  ArrowDown,
  Plus,
  MessageSquare,
  Trash,
  AlertCircle,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

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

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const splitStreamChunks = (text: string) => {
  const wordChunks = text.match(/\S+\s*/g);
  if (wordChunks && wordChunks.length > 0) return wordChunks;

  const charChunks = text.match(/.{1,8}/g);
  return charChunks && charChunks.length > 0 ? charChunks : [text];
};

/* ---------- UI Bits ---------- */
const ThinkingDots = () => (
  <div className="flex items-center gap-1.5 py-1.5 opacity-75">
    {[0, 0.12, 0.24].map((delay) => (
      <motion.span
        key={delay}
        animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay }}
        className="h-2 w-2 rounded-full bg-slate-400"
      />
    ))}
  </div>
);

const StreamingPlaceholder = () => (
  <div className="flex items-center gap-3 rounded-[22px] border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur">
    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/20">
      <Loader2 className="h-4 w-4 animate-spin" />
    </span>
    <div className="flex flex-col gap-1">
      <span className="font-medium text-slate-700">Health AI is typing</span>
      <ThinkingDots />
    </div>
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
            className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm"
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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-full bg-red-50 p-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Delete chat?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  This will permanently delete "{chatTitle}".
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(255,255,255,0.98))] px-4">
    <div className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white/85 px-6 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Loading your chat</p>
          <p className="mt-1 text-xs text-slate-500">Restoring history and profile context.</p>
        </div>
      </div>
    </div>
  </div>
);

const formatChatLabel = (chat: ChatSession) => chat.title?.trim() || "New chat";

/* ---------- Main Component ---------- */
export default function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
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
  const chatMessagesCacheRef = useRef<Map<string, Message[]>>(new Map());
  const userScrolledUpRef = useRef(false);
  const autoOpenNewChatRef = useRef(false);
  const isCreatingChatRef = useRef(false);
  const shouldOpenNewChat = searchParams.get("new") === "1";

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (userScrolledUpRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 96;
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

  const createNewChat = useCallback(async () => {
    if (isCreatingChatRef.current) return null;
    isCreatingChatRef.current = true;
    try {
      setErrorMsg(null);
      const res = await fetch("/api/chat/new", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create chat");
      const chat = (await res.json()) as ChatSession;
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      localStorage.setItem("activeChatId", chat.id);
      const initialMessages = [getInitialMessage()];
      setMessages(initialMessages);
      chatMessagesCacheRef.current.set(chat.id, initialMessages);
      setInput("");
      userScrolledUpRef.current = false;
      requestAnimationFrame(() => scrollToBottom("auto"));
      return chat;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create chat");
      return null;
    } finally {
      isCreatingChatRef.current = false;
    }
  }, [scrollToBottom]);

  const loadChatMessages = useCallback(
    async (chatId: string) => {
      const cachedMessages = chatMessagesCacheRef.current.get(chatId);

      if (cachedMessages) {
        setErrorMsg(null);
        setLoadingChatId(null);
        setIsLoadingMessages(false);
        setMessages(cachedMessages);
        setActiveChatId(chatId);
        localStorage.setItem("activeChatId", chatId);
        userScrolledUpRef.current = false;
        requestAnimationFrame(() => scrollToBottom("auto"));
        return;
      }

      try {
        setLoadingChatId(chatId);
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
        const nextMessages = mapped.length > 0 ? mapped : [getInitialMessage()];
        setMessages(nextMessages);
        chatMessagesCacheRef.current.set(chatId, nextMessages);
        setActiveChatId(chatId);
        localStorage.setItem("activeChatId", chatId);
        userScrolledUpRef.current = false;
        requestAnimationFrame(() => scrollToBottom("auto"));
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setLoadingChatId(null);
        setIsLoadingMessages(false);
      }
    },
    [scrollToBottom]
  );

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

      if (shouldOpenNewChat && !autoOpenNewChatRef.current) {
        autoOpenNewChatRef.current = true;
        const createdChat = await createNewChat();
        if (createdChat) {
          router.replace("/chat");
        }
        setIsHydrated(true);
        return;
      }

      const savedChatId = localStorage.getItem("activeChatId");
      if (savedChatId && chatsData.some((c) => c.id === savedChatId)) {
        await loadChatMessages(savedChatId);
      }

      setIsHydrated(true);
    })();
  }, [createNewChat, fetchChats, loadChatMessages, router, shouldOpenNewChat]);

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

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages.length, scrollToBottom]);

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

  const streamFromServer = async (
    baseMessages: Message[],
    userMessage: Message,
    assistantId: string,
    chatId: string
  ) => {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setErrorMsg(null);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: "", isStreaming: true } : m))
      );

      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      const full = (data?.response ?? "Sorry, no response received.").trim();
      const chunks = splitStreamChunks(full);
      let displayed = "";

      for (let index = 0; index < chunks.length; index += 1) {
        if (controller.signal.aborted) break;
        displayed += chunks[index];
        const isLastChunk = index === chunks.length - 1;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: displayed, isStreaming: !isLastChunk } : m
          )
        );

        if (scrollContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
          const isUserScrolledUp = scrollHeight - scrollTop - clientHeight > 96;
          if (isUserScrolledUp) {
            userScrolledUpRef.current = true;
          }
        }

        if (!userScrolledUpRef.current) scrollToBottom("auto");

        if (!isLastChunk) {
          const delay = full.length > 700 ? 14 : 22;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: displayed || full, isStreaming: false } : m
        )
      );

      chatMessagesCacheRef.current.set(chatId, [
        ...baseMessages,
        userMessage,
        {
          id: assistantId,
          content: displayed || full,
          role: "assistant",
          timestamp: new Date(),
          isStreaming: false,
        },
      ]);

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
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      userScrolledUpRef.current = false;
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
      inputRef.current?.focus();

      let currentChatId = activeChatId;
      if (!currentChatId) {
        const newChat = await createNewChat();
        if (!newChat) return;
        currentChatId = newChat.id;
      }

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
        const generatedTitle = generateChatTitle(text);
        setChats((prev) => prev.map((chat) => (chat.id === currentChatId ? { ...chat, title: generatedTitle } : chat)));

        try {
          await fetch(`/api/chat/${currentChatId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: generatedTitle }),
          });
        } catch (err) {
          console.error("Failed to save title to backend:", err);
        }
      }

      pendingAssistantIdRef.current = asstMsg.id;
      const nextMessages = [...messages, userMsg, asstMsg];
      setMessages(nextMessages);
      chatMessagesCacheRef.current.set(currentChatId!, nextMessages);
      setIsLoading(true);
      await streamFromServer(messages, userMsg, asstMsg.id, currentChatId!);
    },
    [activeChatId, createNewChat, isLoading, messages.length]
  );

  const handleSend = () => sendMessage(input);
  const handleResend = (content: string) => !isLoading && sendMessage(content);
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
  const activeChatLabel = chats.find((chat) => chat.id === activeChatId)?.title?.trim() || "Health Assistant";

  if (!isHydrated) return <LoadingOverlay />;

  return (
    <>
      <style>{`
        .stream-cursor { display:inline-block; width:8px; height:18px; background:linear-gradient(180deg,#0f172a,#2563eb); margin-left:4px; vertical-align:middle; border-radius:999px; animation:blink .9s step-end infinite; box-shadow:0 0 0 1px rgba(255,255,255,0.75); }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .msg-action-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:999px; background:rgba(255,255,255,0.88); border:1px solid rgba(226,232,240,0.9); color:#64748b; cursor:pointer; transition:transform .15s ease, box-shadow .15s ease, color .15s ease, background .15s ease; box-shadow:0 6px 18px rgba(15,23,42,0.04); }
        .msg-action-btn:hover { background:#ffffff; color:#0f172a; transform:translateY(-1px); box-shadow:0 10px 24px rgba(15,23,42,0.08); }
        .chat-textarea { width:100%; resize:none; background:transparent; border:none; outline:none; font-size:15px; line-height:1.7; color:#0f172a; padding:0; min-height:24px; max-height:200px; font-family:inherit; }
        .chat-textarea::placeholder { color:#94a3b8; }
        .msgs-scroll { scrollbar-width:thin; scrollbar-color:transparent transparent; }
        .msgs-scroll:hover { scrollbar-color:#cbd5e1 transparent; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-weight:650; margin-top:1.15em; margin-bottom:0.55em; color:#0f172a; letter-spacing:-0.01em; }
        .markdown-content h1 { font-size:1.45em; }
        .markdown-content h2 { font-size:1.22em; }
        .markdown-content p { margin-bottom:0.85em; line-height:1.75; color:#334155; }
        .markdown-content ul, .markdown-content ol { margin-left:1.15em; margin-bottom:0.85em; color:#334155; }
        .markdown-content li { margin-bottom:0.45em; }
        .markdown-content code { background:#e2e8f0; padding:0.2em 0.45em; border-radius:8px; font-size:0.85em; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color:#0f172a; }
        .markdown-content pre { background:linear-gradient(180deg, #f8fafc, #eef2ff); padding:1em 1.1em; border-radius:16px; overflow-x:auto; margin-bottom:1em; border:1px solid rgba(203,213,225,0.85); box-shadow:inset 0 1px 0 rgba(255,255,255,0.85); }
        .markdown-content pre code { background:transparent; padding:0; color:inherit; }
        .markdown-content blockquote { border-left:3px solid #cbd5e1; padding-left:1em; color:#64748b; font-style:italic; }
        .markdown-content a { color:#2563eb; text-decoration:none; font-weight:500; }
        .markdown-content a:hover { text-decoration:underline; }
      `}</style>

      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        chatTitle={deleteConfirm.chatTitle}
        onConfirm={confirmDelete}
        onCancel={closeDeleteConfirm}
        isDeleting={deleteConfirm.isDeleting}
      />

      <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_46%,#eef6ff_100%)] text-slate-900 font-sans">
        <aside className="hidden w-[280px] shrink-0 border-r border-slate-200/70 bg-white/70 p-4 backdrop-blur-xl md:flex md:flex-col">
          <button
            onClick={createNewChat}
            className="mb-6 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
            disabled={isLoading || isLoadingMessages}
          >
            <Plus className="h-4 w-4" />
            <span className="flex-1 text-left">New Chat</span>
          </button>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <Brain className="h-4 w-4 text-slate-900" />
            <button
              className="text-left"
              onClick={() => {
                router.push("/memories");
              }}
            >
              Memories
            </button>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {isLoadingChats ? (
              <div className="space-y-3 px-2">
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : chats.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-slate-400">Your chat history will appear here.</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative flex items-center rounded-xl px-3 py-2.5 transition-colors ${
                    activeChatId === chat.id
                      ? "bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]"
                      : "hover:bg-slate-100/80"
                  }`}
                >
                  <button
                    onClick={() => void loadChatMessages(chat.id)}
                    className="flex-1 truncate text-left"
                  >
                    <p className={`truncate text-[13px] ${activeChatId === chat.id ? "font-medium text-white" : "text-slate-600"}`}>
                      {formatChatLabel(chat)}
                    </p>
                  </button>
                  {loadingChatId === chat.id && (
                    <span className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full ${activeChatId === chat.id ? "bg-white/10" : "bg-slate-100"}`}>
                      <Loader2 className={`h-3.5 w-3.5 animate-spin ${activeChatId === chat.id ? "text-white/80" : "text-slate-500"}`} />
                    </span>
                  )}
                  {activeChatId === chat.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirm(chat.id, formatChatLabel(chat));
                      }}
                      className="ml-2 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.08),_transparent_26%)]" />

          <div className="relative z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/60 px-4 py-3 backdrop-blur-xl md:hidden">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Conversation</p>
              <span className="text-sm font-semibold text-slate-900">{activeChatLabel}</span>
            </div>
            <button
              onClick={createNewChat}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="msgs-scroll relative z-10 flex-1 overflow-y-auto"
            role="log"
            aria-live="polite"
          >
            {isLoadingMessages && loadingChatId && (
              <div className="absolute inset-0 z-20 flex items-start justify-center bg-white/40 px-4 pt-20 backdrop-blur-[2px]">
                <div className="w-full max-w-md rounded-[24px] border border-slate-200/80 bg-white/90 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/20">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Opening chat</p>
                      <p className="text-xs text-slate-500">Loading messages and restoring the conversation.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mx-auto max-w-4xl px-4 pb-48 pt-8 md:pt-12">
              <AnimatePresence>
                {showHero && (
                  <motion.div
                    key="hero"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex min-h-[48vh] flex-col items-center justify-center text-center"
                  >
                    <div className="mb-6 rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                      <MessageSquare className="h-8 w-8 text-slate-400" />
                    </div>
                    <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                      {user?.name ? `Hello, ${user.name}` : "Health Assistant"}
                    </h1>
                    <p className="max-w-md text-sm leading-6 text-slate-500">
                      I can help you analyze symptoms, explain medical terms, or track your wellness goals.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLoadingMessages && !loadingChatId ? (
                <div className="flex h-full items-center justify-center pb-20">
                  <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/20">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Loading messages</p>
                        <p className="text-xs text-slate-500">Restoring this conversation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`group mb-7 flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex max-w-3xl flex-col ${isUser ? "items-end" : "items-start"}`}>
                          <div className="mb-2 flex items-center gap-2 px-1">
                            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                              {isUser ? "You" : ""}
                            </span>
                            
                            <span className="text-[11px] text-slate-400">{formatTime(msg.timestamp)}</span>
                          </div>

                          {isUser ? (
                            <div className="relative rounded-[24px] rounded-br-md bg-slate-900 px-5 py-4 text-[15px] leading-relaxed text-white shadow-[0_16px_32px_rgba(15,23,42,0.14)]">
                              {msg.content}
                              <div className="absolute -left-11 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  onClick={() => handleResend(msg.content)}
                                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 shadow-sm hover:text-slate-700"
                                  title="Edit & Resend"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full px-1">
                              {!msg.content && !msg.error ? (
                                <StreamingPlaceholder />
                              ) : msg.error ? (
                                <div className="rounded-[24px] rounded-bl-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 shadow-sm">
                                  Something went wrong. <button onClick={retryLast} className="underline hover:text-red-700">Retry</button>
                                </div>
                              ) : msg.isStreaming ? (
                                <div className="rounded-[24px] rounded-bl-md border border-slate-200/80 bg-white/85 px-5 py-4 text-[15px] leading-relaxed text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                                  <div className="whitespace-pre-wrap text-slate-700">
                                    {msg.content}
                                    <StreamCursor />
                                  </div>
                                </div>
                              ) : (
                                <div className="markdown-content rounded-[24px] rounded-bl-md border border-slate-200/80 bg-white/85 px-5 py-4 text-[15px] text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                                  <ReactMarkdown
                                    components={{
                                      a: (props) => (
                                        <a
                                          {...props}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        />
                                      ),
                                    }}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                  <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <CopyButton text={msg.content} />
                                  </div>
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

          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => scrollToBottom("smooth")}
                className="fixed bottom-32 left-1/2 z-20 -translate-x-1/2 rounded-full border border-slate-200/80 bg-white/90 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white md:left-[60%]"
              >
                <ArrowDown className="h-4 w-4 text-slate-600" />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white/95 to-white/0 pt-10">
            <div className="mx-auto max-w-4xl px-4 pb-6">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-3 flex justify-center"
                  >
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-medium text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:bg-white"
                    >
                      <StopCircle className="h-3 w-3" />
                      Stop generating
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative flex items-end gap-2 rounded-[28px] border border-slate-200/80 bg-white/88 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all focus-within:border-sky-300 focus-within:shadow-[0_24px_70px_rgba(56,189,248,0.14)]">
                <div className="flex-1 pb-2 pl-4 pt-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    disabled={isLoading}
                    rows={1}
                    className="chat-textarea bg-transparent placeholder:text-slate-400"
                  />
                </div>

                <div className="flex shrink-0 items-center gap-1 pb-1 pr-1">
                  <button
                    onClick={handleMicClick}
                    disabled={isLoading || !recognitionRef.current}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                      isListening ? "bg-red-100 text-red-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                      input.trim()
                        ? "bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.2)] hover:-translate-y-0.5"
                        : "cursor-not-allowed bg-slate-200 text-slate-400"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 text-center">
                <p className="text-[10px] text-slate-400">AI can make mistakes. Check important info.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
