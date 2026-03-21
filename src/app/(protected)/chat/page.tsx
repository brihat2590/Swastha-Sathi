"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, Copy, Check, RotateCcw, StopCircle, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SuggestionBar from "@/components/suggestionBar";
import { authClient } from "@/lib/auth-client";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  error?: boolean;
  isStreaming?: boolean;
}

const normalizeText = (text: string) =>
  text.replace(/\*\*/g, "").replace(/\n{2,}/g, "\n\n").trim();

/* ── Thinking dots ─────────────────────────────────────────────────────────── */
function ThinkingDots() {
  return (
    <span className="thinking-dots" aria-label="Thinking">
      <span /><span /><span />
    </span>
  );
}

/* ── Blinking cursor ───────────────────────────────────────────────────────── */
function StreamCursor() {
  return <span className="stream-cursor" />;
}

/* ── Copy button ───────────────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button onClick={handleCopy} className="msg-action-btn" title="Copy" aria-label="Copy">
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-500" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/* ── Main ──────────────────────────────────────────────────────────────────── */
export default function ChatInterface() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingAssistantIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  /* session */
  useEffect(() => {
    (async () => {
      const session = await authClient.getSession();
      if (session?.data?.user)
        setUser({ name: session.data.user.name, email: session.data.user.email, image: session.data.user.image || undefined });
    })();
  }, []);

  /* speech */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false; rec.lang = "en-US";
    rec.onresult = (e: any) => { setInput(e.results[0][0].transcript.replace(/^ok\b[\s,]*/i, "")); setIsListening(false); inputRef.current?.focus(); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { try { recognitionRef.current.start(); setIsListening(true); } catch { setIsListening(false); } }
  };

  /* scroll */
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

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* textarea auto-resize */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  /* streaming */
  const streamFromServer = async (userMessage: Message, assistantId: string) => {
    abortRef.current = new AbortController();
    try {
      setErrorMsg(null);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: true } : m));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history: messages }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("Network error");
      const ct = response.headers.get("content-type") ?? "";

      if (ct.includes("text/event-stream") || ct.includes("text/plain")) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const d = line.slice(6).trim();
              if (d === "[DONE]") break;
              try {
                const p = JSON.parse(d);
                acc += p?.choices?.[0]?.delta?.content ?? p?.delta?.text ?? p?.content ?? p?.token ?? "";
              } catch { acc += d; }
            } else if (!line.startsWith("event:") && !line.startsWith(":") && line.trim()) {
              acc += line;
            }
          }
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: normalizeText(acc), isStreaming: true } : m));
          if (!userScrolledUpRef.current) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: normalizeText(acc), isStreaming: false } : m));
      } else {
        const data = await response.json();
        const full = normalizeText(data?.response ?? "Sorry, no response received.");
        let displayed = "";
        for (const char of full) {
          if (abortRef.current?.signal.aborted) break;
          displayed += char;
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: displayed, isStreaming: true } : m));
          if (!userScrolledUpRef.current) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          await new Promise(r => setTimeout(r, 10));
        }
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: displayed, isStreaming: false } : m));
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "Sorry, I'm having trouble responding.", error: true, isStreaming: false } : m));
        setErrorMsg(err?.message || "Failed to get response.");
      } else {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
      }
    } finally {
      setIsLoading(false);
      pendingAssistantIdRef.current = null;
      abortRef.current = null;
    }
  };

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isLoading) return;
    userScrolledUpRef.current = false;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    inputRef.current?.focus();

    const userMsg: Message = { id: `${Date.now()}-user`, content: text.trim(), role: "user", timestamp: new Date() };
    const asstMsg: Message = { id: `${Date.now()}-assistant`, content: "", role: "assistant", timestamp: new Date(), isStreaming: true };

    pendingAssistantIdRef.current = asstMsg.id;
    setMessages(prev => [...prev, userMsg, asstMsg]);
    setIsLoading(true);
    streamFromServer(userMsg, asstMsg.id);
  }, [isLoading, messages]);

  const handleSend = () => sendMessage(input);

  const handleResend = (content: string) => {
    if (isLoading) return;
    userScrolledUpRef.current = false;
    const userMsg: Message = { id: `${Date.now()}-user`, content, role: "user", timestamp: new Date() };
    const asstMsg: Message = { id: `${Date.now()}-assistant`, content: "", role: "assistant", timestamp: new Date(), isStreaming: true };
    pendingAssistantIdRef.current = asstMsg.id;
    setMessages(prev => [...prev, userMsg, asstMsg]);
    setIsLoading(true);
    setErrorMsg(null);
    streamFromServer(userMsg, asstMsg.id);
  };

  const retryLast = () => {
    const last = [...messages].reverse().find(m => m.role === "user");
    if (last) handleResend(last.content);
  };

  const handleStop = () => abortRef.current?.abort();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const showHero = messages.length === 1;

  return (
    <>
      <style>{`
        /* Thinking dots */
        .thinking-dots { display:inline-flex; align-items:center; gap:4px; height:18px; }
        .thinking-dots span { width:5px; height:5px; border-radius:50%; background:#d1d5db; animation:dot-wave 1.2s ease-in-out infinite; }
        .thinking-dots span:nth-child(1) { animation-delay:0s; }
        .thinking-dots span:nth-child(2) { animation-delay:0.16s; }
        .thinking-dots span:nth-child(3) { animation-delay:0.32s; }
        @keyframes dot-wave {
          0%,60%,100% { transform:translateY(0); background:#d1d5db; }
          30% { transform:translateY(-5px); background:#111111; }
        }

        /* Cursor */
        .stream-cursor { display:inline-block; width:2px; height:1em; background:#111; margin-left:1px; vertical-align:text-bottom; animation:blink .65s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* Action buttons */
        .msg-action-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:transparent; border:none; color:#bbb; cursor:pointer; transition:color .15s, background .15s; }
        .msg-action-btn:hover { background:#f4f4f4; color:#111; }
        .msg-action-btn:disabled { opacity:.3; cursor:not-allowed; }

        /* Textarea */
        .chat-textarea { width:100%; resize:none; background:transparent; border:none; outline:none; font-size:15px; line-height:1.65; color:#111; padding:0; min-height:24px; max-height:200px; font-family:inherit; }
        .chat-textarea::placeholder { color:#bbb; }

        /* Scroll */
        .msgs-scroll { scrollbar-width:thin; scrollbar-color:#ebebeb transparent; }
        .msgs-scroll::-webkit-scrollbar { width:4px; }
        .msgs-scroll::-webkit-scrollbar-track { background:transparent; }
        .msgs-scroll::-webkit-scrollbar-thumb { background:#ebebeb; border-radius:4px; }
      `}</style>

      <div className="flex flex-col h-screen bg-white text-[#111] overflow-hidden" style={{ fontFamily: "'ui-sans-serif', system-ui, sans-serif" }}>

        {/* ── Messages ──────────────────────────────────────────────────────── */}
        <div
          ref={scrollContainerRef}
          className="msgs-scroll flex-1 overflow-y-auto"
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
        >
          <div className="max-w-[680px] mx-auto px-5 pt-12 pb-52">

            {/* Hero */}
            <AnimatePresence>
              {showHero && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                  className="mb-14 text-center"
                >
                  <h1 className="text-[28px] font-semibold text-[#111] mb-1.5 tracking-tight">
                    {user?.name ? `Good to see you, ${user.name}.` : "How can I help you?"}
                  </h1>
                  <p className="text-sm text-[#aaa]">AI Health Assistant</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message list */}
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
                    /* User */
                    <div className="flex flex-col items-end gap-1.5 max-w-[75%]">
                      <div className="bg-[#f4f4f4] text-[#111] rounded-[20px] rounded-tr-[6px] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={msg.content} />
                        <button
                          onClick={() => handleResend(msg.content)}
                          disabled={isLoading}
                          className="msg-action-btn"
                          title="Resend"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Assistant */
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="text-[15px] leading-[1.78] text-[#111] whitespace-pre-wrap">
                        {!msg.content && !msg.error
                          ? <ThinkingDots />
                          : <>
                              {msg.content}
                              {msg.isStreaming && <StreamCursor />}
                            </>
                        }
                        {msg.error && (
                          <span className="text-red-400 text-sm ml-1">
                            Something went wrong.{" "}
                            <button onClick={retryLast} className="underline decoration-dashed hover:text-red-500">Retry</button>
                          </span>
                        )}
                      </div>
                      {!msg.isStreaming && msg.content && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={msg.content} />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Scroll to bottom ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onClick={() => { userScrolledUpRef.current = false; scrollToBottom(true); }}
              className="fixed bottom-[138px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-[13px] text-[#555] hover:bg-gray-50 z-20 transition-all"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              Scroll to bottom
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Input ─────────────────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white z-10">
          {/* fade */}
          <div className="h-10 -mt-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />

          <div className="max-w-[680px] mx-auto px-5 pb-5">

            {/* Stop generating */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex justify-center mb-3"
                >
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 text-[13px] text-[#555] bg-white hover:bg-gray-50 shadow-sm transition-all"
                  >
                    <StopCircle className="w-3.5 h-3.5 text-[#aaa]" />
                    Stop generating
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Box */}
            <div className="flex items-end gap-3 bg-white rounded-2xl border border-gray-200 shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-4 py-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message…"
                disabled={isLoading}
                rows={1}
                aria-label="Chat input"
                className="chat-textarea"
              />

              <div className="flex items-center gap-2 shrink-0 pb-[2px]">
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isLoading || !recognitionRef.current}
                  aria-label={isListening ? "Stop" : "Voice"}
                  className={`p-1.5 rounded-lg transition-all ${isListening ? "text-blue-500 animate-pulse" : "text-[#ccc] hover:text-[#666]"}`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send"
                  className="w-8 h-8 rounded-lg bg-[#111] hover:bg-[#333] disabled:bg-[#ebebeb] disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-white disabled:text-[#bbb]" />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-2">
                {errorMsg}
                <button onClick={retryLast} className="underline decoration-dashed hover:text-red-500">Retry</button>
              </div>
            )}

            <p className="mt-2 text-center text-[11px] text-[#d0d0d0]">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}