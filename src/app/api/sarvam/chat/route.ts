import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  clampForTts,
  SARVAM_TTS_MAX_CHARS,
  stripThinkingBlocks,
} from "@/lib/sarvam/sarvam-utils";

const VOICE_REPLY_TARGET_CHARS = 350;

const ALLOWED_SPEAKERS = new Set([
  "anushka",
  "abhilash",
  "manisha",
  "vidya",
  "arya",
  "karun",
  "hitesh",
]);

const LANGUAGE_MAP: Record<string, string> = {
  "hi-IN": "Hindi",
  "en-IN": "English",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "bn-IN": "Bengali",
  "kn-IN": "Kannada",
  "ml-IN": "Malayalam",
  "mr-IN": "Marathi",
  "gu-IN": "Gujarati",
  "pa-IN": "Punjabi",
  "od-IN": "Odia",
  unknown: "the same language as the user",
};

type ChatRole = "system" | "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

function normalizeMimeType(type: string | null | undefined): string {
  if (!type) return "audio/webm";
  return type.split(";")[0]?.trim().toLowerCase() || "audio/webm";
}

function parseChatHistory(raw: FormDataEntryValue | null): ChatMessage[] {
  if (!raw || typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is { role?: unknown; content?: unknown } => !!item)
      .filter(
        (item): item is ChatMessage =>
          (item.role === "user" || item.role === "assistant" || item.role === "system") &&
          typeof item.content === "string"
      )
      .map((item) => ({
        role: item.role,
        content: item.content.trim(),
      }))
      .filter((item) => item.content.length > 0)
      .slice(-20);
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    let languageCode = (formData.get("language_code") as string) || "unknown";
    if (languageCode === "auto") {
      languageCode = "unknown";
    }

    const requestedSpeaker = (formData.get("speaker") as string) || "anushka";
    const speaker = ALLOWED_SPEAKERS.has(requestedSpeaker) ? requestedSpeaker : "anushka";

    const chatHistoryRaw = formData.get("chat_history") ?? formData.get("chatHistory");
    const chatHistory = parseChatHistory(chatHistoryRaw);

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SARVAM_API_KEY not configured" }, { status: 500 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sttFormData = new FormData();
    const normalizedAudioMime = normalizeMimeType(audioFile.type);
    const blob = new Blob([buffer], { type: normalizedAudioMime });
    sttFormData.append("file", blob, audioFile.name || "audio.webm");
    sttFormData.append("model", "saarika:v2.5");
    sttFormData.append("language_code", languageCode);

    const sttResponse = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: sttFormData,
    });

    if (!sttResponse.ok) {
      const errorText = await sttResponse.text();
      console.error("Sarvam STT error:", errorText);
      let message = `Speech-to-text error: ${sttResponse.statusText}`;
      try {
        const parsed = JSON.parse(errorText) as { error?: { message?: string } };
        if (parsed?.error?.message) {
          message = parsed.error.message;
        }
      } catch {
        // keep fallback message when provider payload is non-JSON
      }
      return NextResponse.json(
        { error: message },
        { status: sttResponse.status }
      );
    }

    const sttData = await sttResponse.json();
    const userMessage = String(sttData.transcript || "").trim();
    const detectedLanguage = sttData.language_code || languageCode;

    if (!userMessage) {
      return NextResponse.json(
        { error: "Could not transcribe audio. Please try speaking again." },
        { status: 400 }
      );
    }

    const targetLanguage = LANGUAGE_MAP[detectedLanguage] || "the same language as the user";

    const systemPrompt = `You are Swastha Sathi, a supportive AI health assistant for a medical app. Respond in ${targetLanguage}, matching the user's language exactly.

Safety requirements:
- Give general, non-diagnostic guidance only.
- Do not prescribe medication dosage or claim certainty.
- If symptoms seem severe (e.g., chest pain, breathing trouble, stroke signs, heavy bleeding, suicidal thoughts), tell the user to seek emergency care immediately.

Voice output requirements:
- Return ONLY the final answer. No reasoning, tags, markdown, or code blocks.
- Keep it concise and natural for speech: 1-3 short sentences, ideally under ${VOICE_REPLY_TARGET_CHARS} characters.`;

    const filteredHistory = chatHistory.filter((msg) => msg.role !== "system");
    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...filteredHistory,
      { role: "user", content: userMessage },
    ];

    const chatResponse = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: chatMessages,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error("Sarvam Chat error:", errorText);
      return NextResponse.json(
        { error: `Chat error: ${chatResponse.statusText}` },
        { status: chatResponse.status }
      );
    }

    const chatData = await chatResponse.json();
    const rawAssistantMessage = String(chatData.choices?.[0]?.message?.content || "");
    const assistantMessage = stripThinkingBlocks(rawAssistantMessage);
    const finalAssistantMessage =
      assistantMessage || "Sorry, I could not generate a response.";
    const safeTtsInput = clampForTts(
      finalAssistantMessage,
      SARVAM_TTS_MAX_CHARS
    );

    const ttsResponse = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [safeTtsInput],
        target_language_code: detectedLanguage,
        model: "bulbul:v2",
        speaker,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("Sarvam TTS error:", errorText);
      return NextResponse.json(
        { error: `Text-to-speech error: ${ttsResponse.statusText}` },
        { status: ttsResponse.status }
      );
    }

    const ttsData = await ttsResponse.json();
    return NextResponse.json({
      transcript: userMessage,
      response: finalAssistantMessage,
      audio: ttsData.audios?.[0],
      language_code: detectedLanguage,
      chat_history: [...chatMessages, { role: "assistant", content: finalAssistantMessage }],
    });
  } catch (error) {
    console.error("Voice chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process voice chat" },
      { status: 500 }
    );
  }
}
