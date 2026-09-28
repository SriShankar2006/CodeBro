import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyFirebaseToken } from "../_shared/firebase-auth.ts";

const ADMIN_EMAIL = "admin1@codebro.dev";
const MAX_CODE_LENGTH = 32_000;
const MAX_ROADMAP_BYTES = 1_000_000;
const MAX_CHAT_BYTES = 500_000;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BUILTIN_COURSES: Record<string, { title: string; chapterLengths: number[] }> = {
  "python-dsa": { title: "Python DSA Masterclass", chapterLengths: Array(12).fill(3) },
  "cpp-dsa": { title: "C++ DSA for Competitive Programming", chapterLengths: [3, 3, 3, 2] },
  "system-design": { title: "System Design for FAANG", chapterLengths: [3, 3, 4] },
  "web-dev-react": { title: "Full Stack Web Development", chapterLengths: [4, 4, 3, 3] },
  "ml-python": { title: "Machine Learning with Python", chapterLengths: [3, 4, 3] },
  "java-interview": { title: "Java Interview Prep", chapterLengths: [3, 3, 3] },
  "cloud-devops": { title: "Cloud & DevOps Foundations", chapterLengths: [3, 3, 3] },
  "sql-data-engineering": { title: "SQL & Data Engineering", chapterLengths: [3, 3, 3] },
};
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

async function requireAdmin(uid: string, email: string) {
  if (email.toLowerCase() !== ADMIN_EMAIL) return false;
  const { data, error } = await serviceClient.from("users").select("role").eq("uid", uid).maybeSingle();
  return !error && data?.role === "admin";
}

async function getCourseDefinition(courseId: string) {
  const { data, error } = await serviceClient.from("admin_content")
    .select("content").eq("content_key", "courses").maybeSingle();
  if (error) throw error;
  const overrides = Array.isArray(data?.content) ? data.content : [];
  const course = overrides.find((item: Record<string, unknown>) => String(item?.id) === courseId);
  if (course) {
    const chapters = Array.isArray(course.chapters) ? course.chapters : [];
    const lessonIds = chapters.flatMap((chapter: Record<string, unknown>) =>
      Array.isArray(chapter?.lessons) ? chapter.lessons
        .map((lesson: Record<string, unknown>) => lesson?.id)
        .filter((id: unknown): id is string => typeof id === "string" && id.length > 0) : [],
    );
    return { title: typeof course.title === "string" ? course.title : courseId, lessonIds };
  }
  const builtin = BUILTIN_COURSES[courseId];
  if (!builtin) return null;
  const lessonIds = builtin.chapterLengths.flatMap((count, chapterIndex) =>
    Array.from({ length: count }, (_, lessonIndex) => `${chapterIndex + 1}-${lessonIndex + 1}`),
  );
  return { title: builtin.title, lessonIds };
}

async function getAdminDashboard(limit: number) {
  const [usersRes, submissionsRes, coursesRes, quizzesRes, aiRes] = await Promise.all([
    serviceClient.from("users").select("*").order("created_at", { ascending: false }).limit(limit),
    serviceClient.from("submissions").select("uid, problem_id, problem_title, verdict, language, created_at").order("created_at", { ascending: false }).limit(5000),
    serviceClient.from("course_progress").select("uid, course_id, completed_lessons, progress_pct, updated_at").limit(5000),
    serviceClient.from("quiz_results").select("uid, topic, score, total, accuracy, xp_earned, created_at").order("created_at", { ascending: false }).limit(5000),
    serviceClient.from("ai_chats").select("uid, created_at").order("created_at", { ascending: false }).limit(5000),
  ]);

  const firstError = [usersRes, submissionsRes, coursesRes, quizzesRes, aiRes].find(result => result.error)?.error;
  if (firstError) throw firstError;

  const users = usersRes.data || [];
  const submissions = submissionsRes.data || [];
  const courseProgress = coursesRes.data || [];
  const quizResults = quizzesRes.data || [];
  const aiChats = aiRes.data || [];

  return users.map(user => {
    const userSubmissions = submissions.filter(row => row.uid === user.uid);
    const userCourses = courseProgress.filter(row => row.uid === user.uid);
    const userQuizzes = quizResults.filter(row => row.uid === user.uid);
    const userChats = aiChats.filter(row => row.uid === user.uid);
    const accepted = userSubmissions.filter(row => row.verdict === "Accepted").length;
    const activityDates = [
      userSubmissions[0]?.created_at,
      userCourses[0]?.updated_at,
      userQuizzes[0]?.created_at,
      user.last_login_date,
      user.created_at,
    ].filter(Boolean).sort();

    return {
      ...user,
      admin_progress: {
        submissions: userSubmissions,
        courseProgress: userCourses,
        quizResults: userQuizzes,
        totalSubmissions: userSubmissions.length,
        acceptedSubmissions: accepted,
        acceptanceRate: userSubmissions.length ? Math.round(accepted / userSubmissions.length * 100) : 0,
        activeCourses: userCourses.length,
        avgCourseProgress: userCourses.length
          ? Math.round(userCourses.reduce((total, row) => total + (row.progress_pct || 0), 0) / userCourses.length)
          : 0,
        quizzesTaken: userQuizzes.length,
        avgQuizAccuracy: userQuizzes.length
          ? Math.round(userQuizzes.reduce((total, row) => total + (row.accuracy || 0), 0) / userQuizzes.length)
          : 0,
        aiChatCount: userChats.length,
        latestActivity: activityDates[activityDates.length - 1],
      },
    };
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

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  try {
    if (payload.action === "createSubmission") {
      const sourceCode = typeof payload.code === "string" ? payload.code : "";
      if (sourceCode.length > MAX_CODE_LENGTH) return jsonResponse({ error: "Submitted code is too large." }, 413);
      if (!sourceCode.trim()) return jsonResponse({ error: "Submitted code is empty." }, 400);

      const { error: profileError } = await serviceClient.from("users").upsert(
        { uid: claims.sub, email: typeof claims.email === "string" ? claims.email : "" },
        { onConflict: "uid", ignoreDuplicates: true },
      );
      if (profileError) throw profileError;

      const memoryValue = Number(payload.memory);
      const submission = {
        uid: claims.sub,
        problem_id: Number.isInteger(Number(payload.problem_id)) ? Number(payload.problem_id) : null,
        problem_title: typeof payload.problem_title === "string" ? payload.problem_title.slice(0, 200) : "",
        language: typeof payload.language === "string" ? payload.language.slice(0, 50) : "",
        code: sourceCode,
        verdict: typeof payload.verdict === "string" ? payload.verdict.slice(0, 80) : "Error",
        runtime: payload.runtime == null ? null : String(payload.runtime).slice(0, 50),
        memory: Number.isFinite(memoryValue) ? Math.max(0, Math.round(memoryValue)) : null,
      };
      const { data, error } = await serviceClient.from("submissions").insert(submission).select("*").single();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (payload.action === "getSubmissions") {
      let query = serviceClient.from("submissions").select("*").eq("uid", claims.sub)
        .order("created_at", { ascending: false }).limit(50);
      const problemId = Number(payload.problemId);
      if (Number.isInteger(problemId) && problemId > 0) query = query.eq("problem_id", problemId);
      const { data, error } = await query;
      if (error) throw error;
      return jsonResponse(data || []);
    }

    if (payload.action === "getActivity") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const { data, error } = await serviceClient.from("submissions").select("created_at")
        .eq("uid", claims.sub).gte("created_at", oneYearAgo.toISOString());
      if (error) throw error;
      const activity: Record<string, number> = {};
      (data || []).forEach(row => {
        const day = String(row.created_at).slice(0, 10);
        activity[day] = (activity[day] || 0) + 1;
      });
      return jsonResponse(activity);
    }

    if (payload.action === "uploadAvatar") {
      const contentType = typeof payload.contentType === "string" ? payload.contentType : "";
      const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[contentType];
      const encoded = typeof payload.image === "string" ? payload.image : "";
      if (!extension || !encoded || encoded.length > 2_800_000) {
        return jsonResponse({ error: "Choose a JPEG, PNG, or WebP avatar smaller than 2 MB." }, 400);
      }
      let bytes: Uint8Array;
      try {
        bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
      } catch {
        return jsonResponse({ error: "The selected avatar could not be read." }, 400);
      }
      if (bytes.byteLength > MAX_AVATAR_BYTES) return jsonResponse({ error: "Avatars must be smaller than 2 MB." }, 413);
      const path = `${claims.sub}/avatar.${extension}`;
      const { error } = await serviceClient.storage.from("avatars").upload(path, bytes, {
        contentType, cacheControl: "3600", upsert: true,
      });
      if (error) throw error;
      const { data } = serviceClient.storage.from("avatars").getPublicUrl(path);
      return jsonResponse({ url: data.publicUrl });
    }

    if (payload.action === "getCourseProgress" || payload.action === "getAllCourseProgress") {
      let query = serviceClient.from("course_progress").select("*").eq("uid", claims.sub);
      if (payload.action === "getCourseProgress") {
        const courseId = typeof payload.courseId === "string" ? payload.courseId : "";
        if (!courseId) return jsonResponse({ error: "A course ID is required." }, 400);
        query = query.eq("course_id", courseId);
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return jsonResponse(data);
      }
      const { data, error } = await query;
      if (error) throw error;
      return jsonResponse(data || []);
    }

    if (payload.action === "completeLesson") {
      const courseId = typeof payload.courseId === "string" ? payload.courseId.trim() : "";
      const lessonKey = typeof payload.lessonKey === "string" ? payload.lessonKey.trim() : "";
      if (!courseId || courseId.length > 120 || !lessonKey || lessonKey.length > 120) {
        return jsonResponse({ error: "Course progress details are invalid." }, 400);
      }
      const course = await getCourseDefinition(courseId);
      if (!course || !course.lessonIds.length) return jsonResponse({ error: "Course was not found or has no lessons." }, 404);
      if (!course.lessonIds.includes(lessonKey)) return jsonResponse({ error: "That lesson does not belong to this course." }, 400);
      const { data: existing, error: existingError } = await serviceClient.from("course_progress")
        .select("completed_lessons").eq("uid", claims.sub).eq("course_id", courseId).maybeSingle();
      if (existingError) throw existingError;
      const completed = new Set((Array.isArray(existing?.completed_lessons) ? existing.completed_lessons : [])
        .filter((key: unknown): key is string => typeof key === "string" && course.lessonIds.includes(key)));
      completed.add(lessonKey);
      const completedLessons = [...completed];
      const { data, error } = await serviceClient.from("course_progress").upsert({
        uid: claims.sub,
        course_id: courseId,
        completed_lessons: completedLessons,
        progress_pct: Math.min(100, Math.round(completedLessons.length / course.lessonIds.length * 100)),
        updated_at: new Date().toISOString(),
      }, { onConflict: "uid,course_id" }).select("*").single();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (payload.action === "getCertificates") {
      const { data, error } = await serviceClient.from("certificates").select("*")
        .eq("uid", claims.sub).order("issued_at", { ascending: false });
      if (error) throw error;
      return jsonResponse(data || []);
    }

    if (payload.action === "issueCertificate") {
      const courseId = typeof payload.courseId === "string" ? payload.courseId : "";
      if (!courseId) return jsonResponse({ error: "A course ID is required." }, 400);
      const course = await getCourseDefinition(courseId);
      if (!course || !course.lessonIds.length) return jsonResponse({ error: "Course was not found or has no lessons." }, 404);
      const { data: progress, error: progressError } = await serviceClient.from("course_progress")
        .select("completed_lessons").eq("uid", claims.sub).eq("course_id", courseId).maybeSingle();
      if (progressError) throw progressError;
      const completed = new Set(Array.isArray(progress?.completed_lessons) ? progress.completed_lessons : []);
      if (!course.lessonIds.every((lessonId: string) => completed.has(lessonId))) {
        return jsonResponse({ error: "Complete every course lesson before issuing a certificate." }, 403);
      }
      const { data: existing, error: existingError } = await serviceClient.from("certificates")
        .select("*").eq("uid", claims.sub).eq("course_id", courseId).maybeSingle();
      if (existingError) throw existingError;
      if (existing) return jsonResponse(existing);

      const { data: profile } = await serviceClient.from("users").select("display_name")
        .eq("uid", claims.sub).maybeSingle();
      const certificateId = crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase().match(/.{1,4}/g)?.join("-") || crypto.randomUUID();
      const { data, error } = await serviceClient.from("certificates").insert({
        uid: claims.sub,
        cert_id: certificateId,
        course_id: courseId,
        course_title: course.title.slice(0, 200),
        user_name: profile?.display_name || (typeof claims.name === "string" ? claims.name : "Student"),
      }).select("*").single();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (payload.action === "saveRoadmap") {
      const goal = typeof payload.goal === "string" ? payload.goal.trim() : "";
      const roadmap = payload.roadmap;
      if (!goal || goal.length > 200) return jsonResponse({ error: "A roadmap goal of 1-200 characters is required." }, 400);
      if (!roadmap || typeof roadmap !== "object" || Array.isArray(roadmap)) {
        return jsonResponse({ error: "Roadmap data must be a JSON object." }, 400);
      }
      if (new TextEncoder().encode(JSON.stringify(roadmap)).length > MAX_ROADMAP_BYTES) {
        return jsonResponse({ error: "Roadmap data is too large to save." }, 413);
      }
      const { data, error } = await serviceClient.from("ai_roadmaps")
        .insert({ uid: claims.sub, goal, roadmap })
        .select("id, uid, goal, roadmap, created_at").single();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (payload.action === "getRoadmaps") {
      const { data, error } = await serviceClient.from("ai_roadmaps")
        .select("id, uid, goal, roadmap, created_at")
        .eq("uid", claims.sub).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return jsonResponse(data || []);
    }

    if (payload.action === "getAIChats") {
      const { data, error } = await serviceClient.from("ai_chats")
        .select("id, uid, title, messages, created_at, updated_at")
        .eq("uid", claims.sub).order("updated_at", { ascending: false }).limit(30);
      if (error) throw error;
      return jsonResponse(data || []);
    }

    if (payload.action === "createAIChat") {
      const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 120) : "New Chat";
      const messages = payload.messages;
      if (!Array.isArray(messages)) return jsonResponse({ error: "Chat messages must be an array." }, 400);
      if (new TextEncoder().encode(JSON.stringify(messages)).length > MAX_CHAT_BYTES) {
        return jsonResponse({ error: "Chat history is too large to save." }, 413);
      }
      const { data, error } = await serviceClient.from("ai_chats").insert({
        uid: claims.sub, title: title || "New Chat", messages,
      }).select("id, uid, title, messages, created_at, updated_at").single();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (payload.action === "updateAIChat") {
      const chatId = typeof payload.chatId === "string" ? payload.chatId : "";
      const messages = payload.messages;
      if (!chatId || !Array.isArray(messages)) return jsonResponse({ error: "A chat ID and message array are required." }, 400);
      if (new TextEncoder().encode(JSON.stringify(messages)).length > MAX_CHAT_BYTES) {
        return jsonResponse({ error: "Chat history is too large to save." }, 413);
      }
      const { data, error } = await serviceClient.from("ai_chats")
        .update({ messages, updated_at: new Date().toISOString() })
        .eq("id", chatId).eq("uid", claims.sub)
        .select("id, uid, title, messages, created_at, updated_at").maybeSingle();
      if (error) throw error;
      if (!data) return jsonResponse({ error: "Chat was not found." }, 404);
      return jsonResponse(data);
    }

    if (payload.action === "getAdminDashboard") {
      if (!await requireAdmin(claims.sub, typeof claims.email === "string" ? claims.email : "")) {
        return jsonResponse({ error: "Admin access is required." }, 403);
      }
      const limit = Number.isInteger(Number(payload.limit)) ? Math.min(Math.max(Number(payload.limit), 1), 500) : 500;
      return jsonResponse(await getAdminDashboard(limit));
    }

    if (["adminUpdateRole", "adminSuspendUser", "adminUpdateUser"].includes(String(payload.action))) {
      if (!await requireAdmin(claims.sub, typeof claims.email === "string" ? claims.email : "")) {
        return jsonResponse({ error: "Admin access is required." }, 403);
      }
      const uid = typeof payload.uid === "string" ? payload.uid : "";
      if (!uid) return jsonResponse({ error: "A user ID is required." }, 400);

      if (payload.action === "adminUpdateRole") {
        if (payload.role !== "student" && payload.role !== "admin") return jsonResponse({ error: "Role is invalid." }, 400);
        const { data, error } = await serviceClient.from("users").update({ role: payload.role }).eq("uid", uid).select("*").maybeSingle();
        if (error) throw error;
        if (!data) return jsonResponse({ error: "User was not found." }, 404);
        return jsonResponse(data);
      }

      if (payload.action === "adminSuspendUser") {
        if (typeof payload.suspended !== "boolean") return jsonResponse({ error: "Suspension status is invalid." }, 400);
        const { data, error } = await serviceClient.from("users").update({ suspended: payload.suspended }).eq("uid", uid).select("*").maybeSingle();
        if (error) throw error;
        if (!data) return jsonResponse({ error: "User was not found." }, 404);
        return jsonResponse(data);
      }

      const updates = payload.updates && typeof payload.updates === "object" && !Array.isArray(payload.updates)
        ? payload.updates as Record<string, unknown>
        : {};
      const allowedFields = ["display_name", "username", "bio", "location", "xp", "level", "coins", "streak"];
      const safeUpdates = Object.fromEntries(allowedFields.filter(key => key in updates).map(key => [key, updates[key]]));
      if (!Object.keys(safeUpdates).length) return jsonResponse({ error: "No editable user fields were provided." }, 400);
      const { data, error } = await serviceClient.from("users").update(safeUpdates).eq("uid", uid).select("*").maybeSingle();
      if (error) throw error;
      if (!data) return jsonResponse({ error: "User was not found." }, 404);
      return jsonResponse(data);
    }

    return jsonResponse({ error: "Unknown action." }, 400);
  } catch (error) {
    console.error("User data function failed:", error);
    return jsonResponse({ error: "Could not load or save your data. Please try again." }, 500);
  }
});
