import { verifyFirebaseToken } from "../_shared/firebase-auth.ts";

const JDOODLE_EXECUTE_URL = "https://api.jdoodle.com/v1/execute";
const MAX_SOURCE_LENGTH = 32_000;
const MAX_STDIN_LENGTH = 8_000;

const languageVersions: Record<string, { language: string; versionIndex: string }> = {
  "Python 3": { language: "python3", versionIndex: "5" },
  "C++": { language: "cpp", versionIndex: "6" },
  C: { language: "c", versionIndex: "6" },
  Java: { language: "java", versionIndex: "4" },
  JavaScript: { language: "nodejs", versionIndex: "5" },
  Go: { language: "go", versionIndex: "5" },
  Rust: { language: "rust", versionIndex: "5" },
};

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

  let payload: { sourceCode?: unknown; language?: unknown; stdin?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  const sourceCode = typeof payload.sourceCode === "string" ? payload.sourceCode : "";
  const stdin = typeof payload.stdin === "string" ? payload.stdin : "";
  const language = typeof payload.language === "string" ? languageVersions[payload.language] : undefined;

  if (!sourceCode.trim()) return jsonResponse({ error: "Code is empty." }, 400);
  if (sourceCode.length > MAX_SOURCE_LENGTH || stdin.length > MAX_STDIN_LENGTH) {
    return jsonResponse({ error: "Code or input exceeds the allowed size." }, 413);
  }
  if (!language) return jsonResponse({ error: "This programming language is not supported." }, 400);

  const clientId = Deno.env.get("JDOODLE_CLIENT_ID");
  const clientSecret = Deno.env.get("JDOODLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) return jsonResponse({ error: "Compiler credentials are not configured." }, 500);

  try {
    const response = await fetch(JDOODLE_EXECUTE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify({
        clientId,
        clientSecret,
        script: sourceCode,
        stdin,
        language: language.language,
        versionIndex: language.versionIndex,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.statusCode !== 200 || result.error) {
      const providerStatus = Number(result.statusCode || response.status);
      const message = providerStatus === 401
        ? "JDoodle rejected the credentials. Check that the saved Client ID and Client Secret are copied from your Compiler API account."
        : providerStatus === 429
          ? "JDoodle's daily free execution credits are used up. Try again after they reset."
          : result.error || "JDoodle could not run this code. Please try again.";
      return jsonResponse({ error: message }, 502);
    }

    return jsonResponse({
      verdict: "Executed",
      stdout: typeof result.output === "string" ? result.output : "",
      stderr: "",
      time: result.cpuTime ?? null,
      memory: result.memory ?? null,
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "JDoodle took too long to respond. Please try again."
      : "Could not reach JDoodle. Check the connection and try again.";
    return jsonResponse({ error: message }, 502);
  }
});
