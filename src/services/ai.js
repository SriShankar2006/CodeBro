// Shared Google Gemini client for the browser-based AI features.
import { invokeVerifiedFunction } from "./supabase";

export const SYSTEM_PROMPT = `You are CodeBro AI — a world-class programming mentor and coding assistant.
You help with: C, C++, Java, Python, JavaScript, TypeScript, SQL, React, Next.js, Node.js, and more.
You can explain concepts, generate code, debug code, optimize code, explain errors, suggest improvements, and generate project ideas.
Format all code in markdown code blocks with language labels. Be concise but thorough. Always explain WHY, not just WHAT.`;

export async function generateText({ contents, systemInstruction = SYSTEM_PROMPT, maxOutputTokens = 2000, idToken }) {
  if (!idToken) throw new Error("Sign in before using AI features.");
  const data = await invokeVerifiedFunction("ai-generate", idToken, { contents, systemInstruction, maxOutputTokens });
  if (typeof data?.text !== "string" || !data.text.trim()) throw new Error("Gemini returned an empty response. Please try again.");
  return data.text.trim();
}

export function parseJsonResponse(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("Gemini returned an empty roadmap. Please try again.");
  const withoutFence = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Gemini returned an invalid roadmap. Please try again.");
    try {
      return JSON.parse(withoutFence.slice(start, end + 1));
    } catch {
      throw new Error("Gemini returned an invalid roadmap. Please try again.");
    }
  }
}