import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyFirebaseToken } from "../_shared/firebase-auth.ts";

const ADMIN_EMAIL = "admin1@codebro.dev";
const allowedKeys = new Set(["problems", "courses", "quizzes", "hiddenProblems", "hiddenCourses"]);
const serviceClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

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

  let claims;
  try {
    claims = await verifyFirebaseToken(request.headers.get("Authorization"));
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Sign in is required." }, 401);
  }

  if (typeof claims.email !== "string" || claims.email.toLowerCase() !== ADMIN_EMAIL) {
    return jsonResponse({ error: "Admin access is required." }, 403);
  }

  const { data: profile, error: profileError } = await serviceClient.from("users")
    .select("role").eq("uid", claims.sub).maybeSingle();
  if (profileError || profile?.role !== "admin") {
    return jsonResponse({ error: "Admin access is required." }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  if (payload.action === "uploadCourseImage") {
    const contentType = typeof payload.contentType === "string" ? payload.contentType : "";
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const encoded = typeof payload.image === "string" ? payload.image : "";
    if (!extensions[contentType] || !encoded || encoded.length > 5_600_000) {
      return jsonResponse({ error: "Choose a JPEG, PNG, or WebP image smaller than 4 MB." }, 400);
    }
    let bytes: Uint8Array;
    try {
      bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    } catch {
      return jsonResponse({ error: "The selected image could not be read." }, 400);
    }
    if (bytes.byteLength > 4 * 1024 * 1024) {
      return jsonResponse({ error: "Course images must be smaller than 4 MB." }, 413);
    }

    const path = `${claims.sub}/${crypto.randomUUID()}.${extensions[contentType]}`;
    const { error: uploadError } = await serviceClient.storage.from("course-thumbnails").upload(path, bytes, {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadError) {
      console.error("Course image upload failed:", uploadError);
      return jsonResponse({ error: "Course image could not be uploaded. Check the course-thumbnails storage bucket." }, 500);
    }
    const { data } = serviceClient.storage.from("course-thumbnails").getPublicUrl(path);
    return jsonResponse({ url: data.publicUrl });
  }

  if (typeof payload.key !== "string" || !allowedKeys.has(payload.key)) {
    return jsonResponse({ error: "This admin content key is not allowed." }, 400);
  }

  let serializedContent: string;
  try {
    serializedContent = JSON.stringify(payload.content);
  } catch {
    return jsonResponse({ error: "Content must be valid JSON data." }, 400);
  }
  if (!serializedContent || serializedContent.length > 1_000_000) {
    return jsonResponse({ error: "Admin content is empty or exceeds the 1 MB limit." }, 413);
  }

  const { error } = await serviceClient.from("admin_content").upsert({
    content_key: payload.key,
    content: payload.content,
    updated_at: new Date().toISOString(),
  }, { onConflict: "content_key" });
  if (error) {
    console.error("Admin content save failed:", error);
    return jsonResponse({ error: "Could not save shared admin content." }, 500);
  }

  return jsonResponse({ saved: true, key: payload.key });
});
