"use client";

import { useMemo, useRef, useState } from "react";
import { Mic, Square, Volume2, Loader2, Languages, UserRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Role = "user" | "assistant";

type HistoryMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type UiMessage = {
  id: string;
  role: Role;
  text: string;
  languageCode?: string;
};

const SPEAKERS = ["anushka", "abhilash", "manisha", "vidya", "arya", "karun", "hitesh"] as const;

const LANGUAGE_OPTIONS = [
  { label: "Auto Detect", value: "auto" },
  { label: "English (India)", value: "en-IN" },
  { label: "Hindi", value: "hi-IN" },
  { label: "Tamil", value: "ta-IN" },
  { label: "Telugu", value: "te-IN" },
  { label: "Bengali", value: "bn-IN" },
  { label: "Kannada", value: "kn-IN" },
  { label: "Malayalam", value: "ml-IN" },
  { label: "Marathi", value: "mr-IN" },
  { label: "Gujarati", value: "gu-IN" },
  { label: "Punjabi", value: "pa-IN" },
  { label: "Odia", value: "od-IN" },
] as const;

function toAudioSrc(audio: string): string {
  if (!audio) return "";
  if (audio.startsWith("data:audio")) return audio;
  return `data:audio/wav;base64,${audio}`;
}

function normalizeMimeType(type: string | null | undefined): string {
  if (!type) return "audio/webm";
  return type.split(";")[0]?.trim().toLowerCase() || "audio/webm";
}

function pickSupportedMimeType(): string | undefined {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm",
    "audio/mp4",
    "audio/webm;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export default function VoiceMedicalChatPage() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [languageCode, setLanguageCode] = useState<string>("auto");
  const [speaker, setSpeaker] = useState<(typeof SPEAKERS)[number]>("anushka");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [lastAudioSrc, setLastAudioSrc] = useState<string>("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const canRecord = useMemo(
    () => typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    []
  );

  const appendMessage = (role: Role, text: string, detectedLanguage?: string) => {
    const next: UiMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      text,
      languageCode: detectedLanguage,
    };
    setMessages((prev) => [...prev, next]);
  };

  const startRecording = async () => {
    setError(null);

    if (!canRecord) {
      setError("This browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blobType = mimeType || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: blobType });
        chunksRef.current = [];
        await sendAudio(audioBlob);
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access was denied or unavailable.");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setRecording(false);
      return;
    }
    recorder.stop();
    setRecording(false);
  };

  const sendAudio = async (audioBlob: Blob) => {
    try {
      setLoading(true);
      setError(null);

      const normalizedMime = normalizeMimeType(audioBlob.type || "audio/webm");
      const fileExt = normalizedMime.includes("mp4") ? "m4a" : "webm";
      const file = new File([audioBlob], `voice.${fileExt}`, { type: normalizedMime });

      const formData = new FormData();
      formData.append("audio", file);
      formData.append("language_code", languageCode);
      formData.append("speaker", speaker);
      formData.append("chat_history", JSON.stringify(history));

      const response = await fetch("/api/sarvam/chat", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to process voice chat.");
      }

      const transcript = String(data.transcript || "").trim();
      const reply = String(data.response || "").trim();
      const detectedLanguage = String(data.language_code || "unknown");
      const audio = String(data.audio || "");

      if (transcript) {
        appendMessage("user", transcript, detectedLanguage);
        setLastTranscript(transcript);
      }

      if (reply) {
        appendMessage("assistant", reply, detectedLanguage);
      }

      setHistory(Array.isArray(data.chat_history) ? data.chat_history : history);

      const src = toAudioSrc(audio);
      setLastAudioSrc(src);
      if (src) {
        const player = new Audio(src);
        void player.play().catch(() => {
          setError("Response ready. Tap play to hear it.");
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error while processing audio.");
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setHistory([]);
    setLastTranscript("");
    setLastAudioSrc("");
    setError(null);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50 via-cyan-50 to-white p-4 md:p-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[320px_1fr]">
        <Card className="border-emerald-100 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Voice Health Assistant</CardTitle>
            <CardDescription>
              Speak naturally. You will get transcript, medical guidance text, and spoken reply.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium text-slate-700" htmlFor="language">
              <span className="mb-1 flex items-center gap-2">
                <Languages className="h-4 w-4" /> Language
              </span>
              <select
                id="language"
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                disabled={loading || recording}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring-2"
              >
                {LANGUAGE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700" htmlFor="speaker">
              <span className="mb-1 flex items-center gap-2">
                <UserRound className="h-4 w-4" /> Voice
              </span>
              <select
                id="speaker"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value as (typeof SPEAKERS)[number])}
                disabled={loading || recording}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring-2"
              >
                {SPEAKERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              {!recording ? (
                <Button
                  type="button"
                  onClick={startRecording}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                  Start Recording
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={stopRecording}
                  className="w-full bg-rose-600 text-white hover:bg-rose-700"
                >
                  <Square className="h-4 w-4" /> Stop Recording
                </Button>
              )}
            </div>

            {lastAudioSrc ? (
              <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-900">
                  <Volume2 className="h-4 w-4" /> Last Voice Reply
                </div>
                <audio controls src={lastAudioSrc} className="w-full" />
              </div>
            ) : null}

            {lastTranscript ? (
              <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Transcript
                </p>
                {lastTranscript}
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              onClick={clearConversation}
              disabled={loading || recording || messages.length === 0}
              className="w-full"
            >
              <Trash2 className="h-4 w-4" /> Clear Conversation
            </Button>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </CardContent>
        </Card>

        <Card className="border-cyan-100 shadow-sm">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>
              Your spoken input appears as transcript. Assistant replies are shown and spoken.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  Start by pressing <strong>Start Recording</strong> and speak your health question.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={
                      msg.role === "user"
                        ? "ml-10 rounded-2xl rounded-br-sm bg-cyan-600 p-3 text-sm text-white"
                        : "mr-10 rounded-2xl rounded-bl-sm bg-emerald-100 p-3 text-sm text-emerald-950"
                    }
                  >
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-75">
                      {msg.role === "user" ? "You" : "Assistant"}
                      {msg.languageCode ? ` • ${msg.languageCode}` : ""}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
              {loading ? (
                <div className="mr-10 rounded-2xl rounded-bl-sm bg-amber-100 p-3 text-sm text-amber-900">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing audio and generating response...
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
