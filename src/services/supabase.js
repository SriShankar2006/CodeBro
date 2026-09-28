// src/services/supabase.js
// Supabase handles ALL data storage for CodeBro.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL  || "https://gkrxwjusbtmjmzxgxbxl.supabase.co";
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY || "sb_publishable_kK94EVjDKNguuNyI51Y8Nw_AynlleO1";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── USER PROFILES ──────────────────────────────────────────────────────────
export const getProfile = async (uid) => {
  const { data, error } = await supabase.from("users").select("*").eq("uid", uid).limit(1).maybeSingle();
  if (error) throw error;
  return data;
};
export const createProfile = async (profile) => {
  const { data, error } = await supabase.from("users").upsert(profile, { onConflict: "uid" }).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Profile could not be created. Check the users table and its insert policy.");
  return data;
};
export const updateProfile = async (uid, updates) => {
  const { data, error } = await supabase.from("users").update(updates).eq("uid", uid).select().limit(1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Profile was not updated. Check that the users table and its update policy are configured.");
  return data;
};
export const getLeaderboard = async (limit = 50) => {
  const { data } = await supabase.from("users").select("*").order("xp", { ascending: false }).limit(limit);
  return data || [];
};
export const getAllUsers = async (limit = 500) => {
  const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false }).limit(limit);
  return data || [];
};
export const updateUserRole = async (idToken, uid, role) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "adminUpdateRole", uid, role });
};
export const suspendUser = async (idToken, uid, suspended) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "adminSuspendUser", uid, suspended });
};
export const updateAdminUser = async (idToken, uid, updates) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "adminUpdateUser", uid, updates });
};
export const getAdminContent = async () => {
  const { data, error } = await supabase.from("admin_content").select("content_key, content");
  if (error) throw error;
  return data || [];
};
export const invokeVerifiedFunction = async (functionName, idToken, body) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (error) {
    let message = error.message || "Request failed.";
    try {
      const response = await error.context?.json();
      message = response?.error || response?.message || message;
    } catch {
      // Keep the Functions client message when no JSON error body was returned.
    }
    if (functionName === "user-data" && /unknown action/i.test(message)) {
      message = "The deployed user-data function is outdated. Deploy the current supabase/functions/user-data function, then retry.";
    } else if (functionName === "ai-generate" && /failed to send a request to the edge function|function not found|requested function was not found/i.test(message)) {
      message = "The AI generation function is unavailable. Deploy supabase/functions/ai-generate and configure GOOGLE_AI_API_KEY in Supabase Function Secrets.";
    } else if (functionName === "admin-content" && body?.action === "uploadCourseImage" && /not allowed/i.test(message)) {
      message = "Course image upload needs the updated admin-content function. Deploy supabase/functions/admin-content, then retry.";
    }
    throw new Error(message);
  }
  return data;
};

export const saveAdminContent = async (contentKey, content, idToken) => {
  await invokeVerifiedFunction("admin-content", idToken, { key: contentKey, content });
};
export const uploadCourseImage = async (file, idToken) => {
  if (!file) throw new Error("Choose an image first.");
  if (file.size > 4 * 1024 * 1024) throw new Error("Course images must be smaller than 4 MB.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const separator = result.indexOf(",");
      if (separator < 0) reject(new Error("The selected image could not be read."));
      else resolve(result.slice(separator + 1));
    };
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
  const result = await invokeVerifiedFunction("admin-content", idToken, {
    action: "uploadCourseImage", contentType: file.type, image,
  });
  if (!result?.url) throw new Error("Image uploaded, but no public image URL was returned.");
  return result.url;
};

// ── ADMIN DASHBOARD ────────────────────────────────────────────────────────
export const getAdminUserDashboard = async (idToken, limit = 500) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "getAdminDashboard", limit });
};

// ── SUBMISSIONS ───────────────────────────────────────────────────────────
export const createSubmission = async (sub, idToken) => {
  if (!sub?.uid) throw new Error("Cannot save a submission without a user ID.");
  return invokeVerifiedFunction("user-data", idToken, { action: "createSubmission", ...sub });
};
export const getUserSubmissions = async (idToken, problemId = null) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "getSubmissions", problemId });
};

// ── COURSE PROGRESS ────────────────────────────────────────────────────────
export const getCourseProgress = async (idToken, courseId) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "getCourseProgress", courseId: String(courseId) });
};
export const getAllCourseProgress = async (idToken) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "getAllCourseProgress" });
};
export const upsertCourseProgress = async (idToken, courseId, lessonKey) => {
  return invokeVerifiedFunction("user-data", idToken, {
    action: "completeLesson", courseId: String(courseId), lessonKey,
  });
};

// ── ACTIVITY HEATMAP ───────────────────────────────────────────────────────
export const getActivityData = async (idToken) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "getActivity" });
};

// ── QUIZ RESULTS ───────────────────────────────────────────────────────────
export const saveQuizResult = async (result) => {
  const { data, error } = await supabase.from("quiz_results").insert([result]).select().single();
  if (error) throw error;
  return data;
};
export const getQuizHistory = async (uid) => {
  const { data } = await supabase.from("quiz_results").select("*").eq("uid", uid).order("created_at", { ascending: false }).limit(20);
  return data || [];
};

// ── AI CHATS ───────────────────────────────────────────────────────────────
export const getAIChats = async (idToken) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "getAIChats" });
};
export const createAIChat = async (idToken, title, messages) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "createAIChat", title, messages });
};
export const updateAIChat = async (idToken, chatId, messages) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "updateAIChat", chatId, messages });
};

// ── ROADMAPS ───────────────────────────────────────────────────────────────
export const saveRoadmap = async (idToken, goal, roadmap) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "saveRoadmap", goal, roadmap });
};
export const getUserRoadmaps = async (idToken) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "getRoadmaps" });
};

// ── CERTIFICATES ───────────────────────────────────────────────────────────
export const saveCertificate = async (idToken, courseId) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "issueCertificate", courseId: String(courseId) });
};
export const getUserCertificates = async (idToken) => {
  return invokeVerifiedFunction("user-data", idToken, { action: "getCertificates" });
};
export const verifyCertificate = async (certId) => {
  const { data } = await supabase.from("certificates").select("*").eq("cert_id", certId).single();
  return data;
};

// ── ACHIEVEMENTS ───────────────────────────────────────────────────────────
export const getUserAchievements = async (uid) => {
  const { data } = await supabase.from("achievements").select("*").eq("uid", uid).order("earned_at", { ascending: false });
  return data || [];
};
export const awardAchievement = async (uid, achievementKey, title, description, icon) => {
  const existing = await supabase.from("achievements").select("id").eq("uid", uid).eq("key", achievementKey).single();
  if (existing.data) return null; // already earned
  const { data, error } = await supabase.from("achievements").insert([{
    uid, key: achievementKey, title, description, icon, earned_at: new Date().toISOString(),
  }]).select().single();
  if (error) return null;
  return data;
};

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────
export const getNotifications = async (uid) => {
  const { data } = await supabase.from("notifications").select("*").eq("uid", uid).order("created_at", { ascending: false }).limit(30);
  return data || [];
};
export const createNotification = async (uid, type, message, link = "") => {
  await supabase.from("notifications").insert([{ uid, type, message, link, read: false, created_at: new Date().toISOString() }]);
};
export const markNotificationsRead = async (uid) => {
  await supabase.from("notifications").update({ read: true }).eq("uid", uid).eq("read", false);
};

// ── BOOKMARKS ──────────────────────────────────────────────────────────────
export const getBookmarks = async (uid) => {
  const { data } = await supabase.from("bookmarks").select("*").eq("uid", uid).order("created_at", { ascending: false });
  return data || [];
};
export const addBookmark = async (uid, itemType, itemId, itemTitle, meta = {}) => {
  const { data, error } = await supabase.from("bookmarks").insert([{
    uid, item_type: itemType, item_id: String(itemId), item_title: itemTitle,
    meta, created_at: new Date().toISOString(),
  }]).select().single();
  if (error) throw error;
  return data;
};
export const removeBookmark = async (uid, itemType, itemId) => {
  await supabase.from("bookmarks").delete().eq("uid", uid).eq("item_type", itemType).eq("item_id", String(itemId));
};

// ── NOTES ──────────────────────────────────────────────────────────────────
export const getNotes = async (uid) => {
  const { data } = await supabase.from("notes").select("*").eq("uid", uid).order("updated_at", { ascending: false });
  return data || [];
};
export const createNote = async (uid, title, content, tags = []) => {
  const { data, error } = await supabase.from("notes").insert([{
    uid, title, content, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }]).select().single();
  if (error) throw error;
  return data;
};
export const updateNote = async (noteId, updates) => {
  const { data, error } = await supabase.from("notes").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", noteId).select().single();
  if (error) throw error;
  return data;
};
export const deleteNote = async (noteId) => {
  await supabase.from("notes").delete().eq("id", noteId);
};

// ── CALENDAR EVENTS ────────────────────────────────────────────────────────
export const getCalendarEvents = async (uid) => {
  const { data } = await supabase.from("calendar_events").select("*").eq("uid", uid).order("event_date", { ascending: true });
  return data || [];
};
export const createCalendarEvent = async (uid, title, eventDate, type = "reminder", link = "") => {
  const { data, error } = await supabase.from("calendar_events").insert([{
    uid, title, event_date: eventDate, type, link, created_at: new Date().toISOString(),
  }]).select().single();
  if (error) throw error;
  return data;
};
export const deleteCalendarEvent = async (eventId) => {
  await supabase.from("calendar_events").delete().eq("id", eventId);
};

// ── STORAGE ────────────────────────────────────────────────────────────────
export const uploadAvatar = async (idToken, file) => {
  if (!file) throw new Error("No file selected.");
  if (file.size > 2 * 1024 * 1024) throw new Error("Avatars must be smaller than 2 MB.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP avatar.");
  }
  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const separator = result.indexOf(",");
      if (separator < 0) reject(new Error("The selected avatar could not be read."));
      else resolve(result.slice(separator + 1));
    };
    reader.onerror = () => reject(new Error("The selected avatar could not be read."));
    reader.readAsDataURL(file);
  });
  const result = await invokeVerifiedFunction("user-data", idToken, {
    action: "uploadAvatar", contentType: file.type, image,
  });
  if (!result?.url) throw new Error("Avatar uploaded, but no public image URL was returned.");
  return result.url;
};

// ── SQL SETUP (run in Supabase SQL editor) ─────────────────────────────────
/*
-- Run this SQL in Supabase SQL Editor to set up all tables:

-- Users
create table if not exists users (
  uid text primary key,
  display_name text, username text unique, email text,
  avatar text default '', bio text default '', location text default '',
  role text default 'student', suspended boolean default false,
  xp integer default 0, level integer default 1, coins integer default 0, streak integer default 0,
  last_login_date text default '',
  solved_problems integer[] default '{}',
  badges text[] default '{}',
  social_links jsonb default '{}',
  created_at timestamptz default now()
);

-- Core tables
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  problem_id integer, problem_title text, language text, code text,
  verdict text, runtime text, memory text, created_at timestamptz default now()
);
create table if not exists course_progress (
  uid text references users(uid), course_id text,
  completed_lessons text[] default '{}', progress_pct integer default 0,
  updated_at timestamptz default now(), primary key (uid, course_id)
);
create table if not exists quiz_results (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  topic text, score integer, total integer, accuracy integer, xp_earned integer,
  created_at timestamptz default now()
);

-- AI & Roadmaps
create table if not exists ai_chats (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  title text, messages jsonb not null default '[]'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists ai_roadmaps (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  goal text, roadmap jsonb not null default '{}'::jsonb, created_at timestamptz default now()
);
alter table ai_chats alter column messages type jsonb
  using case when messages is null or btrim(messages::text) = '' then '[]'::jsonb else messages::text::jsonb end;
alter table ai_roadmaps alter column roadmap type jsonb
  using case when roadmap is null or btrim(roadmap::text) = '' then '{}'::jsonb else roadmap::text::jsonb end;

-- Certificates
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  cert_id text unique, course_id text, course_title text,
  user_name text, issued_at timestamptz default now()
);

-- Achievements
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  key text, title text, description text, icon text,
  earned_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  type text, message text, link text default '', read boolean default false,
  created_at timestamptz default now()
);

-- Forum
create table if not exists forum_posts (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  username text, title text, body text, tags text[] default '{}',
  votes integer default 0, answers integer default 0, solved boolean default false,
  created_at timestamptz default now()
);
create table if not exists forum_answers (
  id uuid primary key default gen_random_uuid(), post_id uuid references forum_posts(id),
  uid text references users(uid), username text, body text,
  votes integer default 0, accepted boolean default false, created_at timestamptz default now()
);

-- Bookmarks, Notes, Calendar (Student Dashboard)
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  item_type text, item_id text, item_title text, meta jsonb default '{}',
  created_at timestamptz default now(), unique(uid, item_type, item_id)
);
create table if not exists notes (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  title text, content text, tags text[] default '{}',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(), uid text references users(uid),
  title text, event_date date, type text default 'reminder', link text default '',
  created_at timestamptz default now()
);

-- Enable RLS (explicit statements per table, avoids dollar-quoting issues)
alter table users            enable row level security;
alter table submissions      enable row level security;
alter table course_progress  enable row level security;
alter table quiz_results     enable row level security;
alter table ai_chats         enable row level security;
alter table ai_roadmaps      enable row level security;
alter table certificates     enable row level security;
alter table achievements     enable row level security;
alter table notifications    enable row level security;
alter table forum_posts      enable row level security;
alter table forum_answers    enable row level security;
alter table bookmarks        enable row level security;
alter table notes            enable row level security;
alter table calendar_events  enable row level security;

-- Open policies (tighten as needed)
create policy if not exists "all_users" on users for all using (true) with check (true);
drop policy if exists "all_submissions" on submissions;
revoke all on table submissions from anon, authenticated;
create policy if not exists "all_course_progress" on course_progress for all using (true) with check (true);
create policy if not exists "all_quiz_results" on quiz_results for all using (true) with check (true);
drop policy if exists "all_ai_chats" on ai_chats;
drop policy if exists "all_ai_roadmaps" on ai_roadmaps;
revoke all on table ai_chats, ai_roadmaps from anon, authenticated;
grant all on table ai_chats, ai_roadmaps to service_role;
create policy if not exists "all_certificates" on certificates for all using (true) with check (true);
create policy if not exists "all_achievements" on achievements for all using (true) with check (true);
create policy if not exists "all_notifications" on notifications for all using (true) with check (true);
create policy if not exists "all_forum_posts" on forum_posts for all using (true) with check (true);
create policy if not exists "all_forum_answers" on forum_answers for all using (true) with check (true);
create policy if not exists "all_bookmarks" on bookmarks for all using (true) with check (true);
create policy if not exists "all_notes" on notes for all using (true) with check (true);
create policy if not exists "all_calendar_events" on calendar_events for all using (true) with check (true);

-- Storage
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
*/
