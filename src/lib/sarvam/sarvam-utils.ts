export const SARVAM_TTS_MAX_CHARS = 500;

export function stripThinkingBlocks(text: string): string {
  if (!text) return "";
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "") // Remove DeepSeek/R1 style thinking
    .replace(/```[\s\S]*?```/g, "")             // Remove code blocks
    .replace(/[*_~#]/g, "")                     // Remove markdown formatting
    .trim();
}

export function clampForTts(text: string, maxChars: number = SARVAM_TTS_MAX_CHARS): string {
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;
  
  const clipped = clean.slice(0, maxChars);
  const lastSentence = Math.max(
    clipped.lastIndexOf("."),
    clipped.lastIndexOf("!"),
    clipped.lastIndexOf("?")
  );

  return lastSentence > maxChars * 0.5 
    ? clipped.slice(0, lastSentence + 1) 
    : `${clipped.slice(0, maxChars - 3)}...`;
}