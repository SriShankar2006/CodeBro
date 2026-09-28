import { verifyFirebaseToken } from "../_shared/firebase-auth.ts";

const MODEL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_INPUT_CHARACTERS = 48_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    await verifyFirebaseToken(request.headers.get("Authorization"));
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Sign in is required." }, 401);
  }

  const apiKey = Deno.env.get("GOOGLE_AI_API_KEY")?.trim();
  if (!apiKey) return jsonResponse({ error: "Gemini is not configured. Add GOOGLE_AI_API_KEY to Supabase Edge Function secrets." }, 503);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  const contents = payload.contents;
  const systemInstruction = typeof payload.systemInstruction === "string" ? payload.systemInstruction : "";
  if (!Array.isArray(contents) || contents.length === 0 || contents.length > 30) {
    return jsonResponse({ error: "AI requests must include between 1 and 30 messages." }, 400);
  }
  const validContents = contents.every(message =>
    message && typeof message === "object" &&
    ["user", "model"].includes((message as Record<string, unknown>).role as string) &&
    Array.isArray((message as Record<string, unknown>).parts) &&
    ((message as Record<string, unknown>).parts as unknown[]).every(part =>
      part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string",
    ),
  );
  const inputSize = systemInstruction.length + contents.reduce((total, message) => {
    if (!message || typeof message !== "object") return total;
    const parts = (message as Record<string, unknown>).parts;
    if (!Array.isArray(parts)) return total;
    return total + parts.reduce((partTotal, part) =>
      part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string"
        ? partTotal + ((part as Record<string, unknown>).text as string).length
        : partTotal,
    0);
  }, 0);
  if (!validContents || inputSize > MAX_INPUT_CHARACTERS) {
    return jsonResponse({ error: "AI request content is invalid or too large." }, 400);
  }

  const requestedTokens = Number(payload.maxOutputTokens);
  const maxOutputTokens = Number.isFinite(requestedTokens)
    ? Math.min(8192, Math.max(1, Math.floor(requestedTokens)))
    : 2000;
  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: { maxOutputTokens },
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(MODEL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(body),
      });
    } catch {
      if (attempt === 2) return jsonResponse({ error: "Could not reach Gemini. Check the Edge Function's network access and try again." }, 502);
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      continue;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const status = response.status;
      if ([429, 500, 502, 503, 504].includes(status) && attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      const message = status === 401
        ? "Gemini rejected the server API key. Check the GOOGLE_AI_API_KEY secret."
        : status === 403
          ? "Gemini denied the configured Google project or API key."
          : status === 429
            ? "Gemini rate limit reached. Please wait a moment and try again."
            : status >= 500
              ? "Gemini is temporarily unavailable. Please try again shortly."
              : String(data?.error?.message || "Gemini rejected the request.").slice(0, 300);
      return jsonResponse({ error: message }, status >= 500 ? 502 : status);
    }

    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === "SAFETY" || data.promptFeedback?.blockReason) {
      return jsonResponse({ error: "Gemini blocked this request. Please rephrase it and try again." }, 400);
    }
    if (candidate?.finishReason === "MAX_TOKENS") {
      return jsonResponse({ error: "Gemini's response was cut off. Try again or shorten the request." }, 422);
    }
    const text = candidate?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
    if (text) return jsonResponse({ text });
    return jsonResponse({ error: "Gemini returned an empty response. Please try again." }, 502);
  }

  return jsonResponse({ error: "Gemini request failed. Please try again." }, 502);
});