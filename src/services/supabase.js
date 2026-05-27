// src/services/supabase.js
// Supabase handles ALL data storage and file storage for CodeBro.
// Tables: users, submissions, course_progress, quiz_results, forum_posts, forum_answers

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://gkrxwjusbtmjmzxgxbxl.supabase.co";
const SUPABASE_ANON = "sb_publishable_kK94EVjDKNguuNyI51Y8Nw_AynlleO1";


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ════════════════════════════════════════════════
//  USER PROFILES
// ════════════════════════════════════════════════
export const getProfile = async (uid) => {
  const { data, error } = await supabase.from("users").select("*").eq("uid", uid).single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found (expected for new users)
  return data;
};

export const createProfile = async (profile) => {
  const { data, error } = await supabase.from("users").insert([profile]).select().single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (uid, updates) => {
  const { data, error } = await supabase.from("users").update(updates).eq("uid", uid).select().single();
  if (error) throw error;
  return data;
};

export const getLeaderboard = async (limit = 50) => {
  const { data } = await supabase.from("users").select("*").order("xp", { ascending: false }).limit(limit);
  return data || [];
};

export const getAdminUserDashboard = async (limit = 500) => {
  const [usersRes, submissionsRes, coursesRes, quizzesRes] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: false }).limit(limit),
    supabase.from("submissions").select("uid, problem_id, problem_title, verdict, language, created_at").order("created_at", { ascending: false }).limit(5000),
    supabase.from("course_progress").select("uid, course_id, completed_lessons, progress_pct, updated_at").limit(5000),
    supabase.from("quiz_results").select("uid, topic, score, total, accuracy, xp_earned, created_at").order("created_at", { ascending: false }).limit(5000),
  ]);

  const users = usersRes.data || [];
  const submissions = submissionsRes.data || [];
  const courseProgress = coursesRes.data || [];
  const quizResults = quizzesRes.data || [];

  return users.map(user => {
    const userSubmissions = submissions.filter(s => s.uid === user.uid);
    const userCourses = courseProgress.filter(c => c.uid === user.uid);
    const userQuizzes = quizResults.filter(q => q.uid === user.uid);
    const accepted = userSubmissions.filter(s => s.verdict === "Accepted").length;
    const activityDates = [
      userSubmissions[0]?.created_at,
      userCourses[0]?.updated_at,
      userQuizzes[0]?.created_at,
      user.last_login_date,
      user.created_at,
    ].filter(Boolean).sort();
    const latestActivity = activityDates[activityDates.length - 1];

    return {
      ...user,
      admin_progress: {
        submissions: userSubmissions,
        courseProgress: userCourses,
        quizResults: userQuizzes,
        totalSubmissions: userSubmissions.length,
        acceptedSubmissions: accepted,
        acceptanceRate: userSubmissions.length ? Math.round((accepted / userSubmissions.length) * 100) : 0,
        activeCourses: userCourses.length,
        avgCourseProgress: userCourses.length ? Math.round(userCourses.reduce((sum, c) => sum + (c.progress_pct || 0), 0) / userCourses.length) : 0,
        quizzesTaken: userQuizzes.length,
        avgQuizAccuracy: userQuizzes.length ? Math.round(userQuizzes.reduce((sum, q) => sum + (q.accuracy || 0), 0) / userQuizzes.length) : 0,
        latestActivity,
      },
    };
  });
};

// ════════════════════════════════════════════════
//  SUBMISSIONS
// ════════════════════════════════════════════════
export const createSubmission = async (sub) => {
  const { data, error } = await supabase.from("submissions").insert([sub]).select().single();
  if (error) throw error;
  return data;
};

export const getUserSubmissions = async (uid, problemId = null) => {
  let q = supabase.from("submissions").select("*").eq("uid", uid).order("created_at", { ascending: false }).limit(50);
  if (problemId) q = q.eq("problem_id", problemId);
  const { data } = await q;
  return data || [];
};

// ════════════════════════════════════════════════
//  COURSE PROGRESS (per user, fresh for new users)
// ════════════════════════════════════════════════
export const getCourseProgress = async (uid, courseId) => {
  const { data } = await supabase.from("course_progress").select("*").eq("uid", uid).eq("course_id", courseId).single();
  return data; // null if no progress yet (new user)
};

export const getAllCourseProgress = async (uid) => {
  const { data } = await supabase.from("course_progress").select("*").eq("uid", uid);
  return data || [];
};

export const upsertCourseProgress = async (uid, courseId, lessonKey, totalLessons = 10) => {
  const existing = await getCourseProgress(uid, courseId);
  const completed = existing?.completed_lessons || [];
  if (!completed.includes(lessonKey)) completed.push(lessonKey);
  const pct = Math.round((completed.length / Math.max(totalLessons, 1)) * 100);

  await supabase.from("course_progress").upsert({
    uid, course_id: courseId,
    completed_lessons: completed,
    progress_pct: Math.min(pct, 100),
    updated_at: new Date().toISOString(),
  }, { onConflict: "uid,course_id" });
};

// ════════════════════════════════════════════════
//  ACTIVITY (for heatmap — real submissions only)
// ════════════════════════════════════════════════
export const getActivityData = async (uid) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data } = await supabase
    .from("submissions")
    .select("created_at")
    .eq("uid", uid)
    .gte("created_at", oneYearAgo.toISOString());

  // Build heatmap object { "2024-12-01": 3, ... }
  const map = {};
  (data || []).forEach(({ created_at }) => {
    const day = created_at.slice(0, 10);
    map[day] = (map[day] || 0) + 1;
  });
  return map;
};

// ════════════════════════════════════════════════
//  QUIZ RESULTS
// ════════════════════════════════════════════════
export const saveQuizResult = async (result) => {
  const { data, error } = await supabase.from("quiz_results").insert([result]).select().single();
  if (error) throw error;
  return data;
};

export const getQuizHistory = async (uid) => {
  const { data } = await supabase.from("quiz_results").select("*").eq("uid", uid).order("created_at", { ascending: false }).limit(20);
  return data || [];
};

// ════════════════════════════════════════════════
//  FORUM
// ════════════════════════════════════════════════
export const getForumPosts = async (sortBy = "votes") => {
  const col = sortBy === "latest" ? "created_at" : "votes";
  const { data } = await supabase.from("forum_posts").select("*").order(col, { ascending: false }).limit(30);
  return data || [];
};

export const createForumPost = async (post) => {
  const { data, error } = await supabase.from("forum_posts").insert([post]).select().single();
  if (error) throw error;
  return data;
};

export const votePost = async (postId, delta) => {
  const { data: post } = await supabase.from("forum_posts").select("votes").eq("id", postId).single();
  await supabase.from("forum_posts").update({ votes: (post?.votes || 0) + delta }).eq("id", postId);
};

export const getForumAnswers = async (postId) => {
  const { data } = await supabase.from("forum_answers").select("*").eq("post_id", postId).order("votes", { ascending: false });
  return data || [];
};

export const createForumAnswer = async (answer) => {
  const { data, error } = await supabase.from("forum_answers").insert([answer]).select().single();
  if (error) throw error;
  await supabase.from("forum_posts").update({ answers: supabase.rpc("increment", { x: 1 }) }).eq("id", answer.post_id);
  return data;
};

// ════════════════════════════════════════════════
//  STORAGE (Supabase Storage buckets)
// ════════════════════════════════════════════════
export const uploadAvatar = async (uid, file) => {
  const ext  = file.name.split(".").pop();
  const path = `avatars/${uid}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// ════════════════════════════════════════════════
//  SUPABASE SQL SETUP (run once in Supabase SQL editor)
// ════════════════════════════════════════════════
/*
-- Users table
create table if not exists users (
  uid text primary key,
  display_name text,
  username text unique,
  email text,
  avatar text default '',
  bio text default '',
  location text default '',
  role text default 'student',
  xp integer default 0,
  level integer default 1,
  coins integer default 0,
  streak integer default 0,
  last_login_date text default '',
  solved_problems integer[] default '{}',
  badges text[] default '{}',
  social_links jsonb default '{}',
  created_at timestamptz default now()
);

-- Submissions table
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  uid text references users(uid),
  problem_id integer,
  problem_title text,
  language text,
  code text,
  verdict text,
  runtime text,
  memory text,
  created_at timestamptz default now()
);

-- Course progress table
create table if not exists course_progress (
  uid text references users(uid),
  course_id text,
  completed_lessons text[] default '{}',
  progress_pct integer default 0,
  updated_at timestamptz default now(),
  primary key (uid, course_id)
);

-- Quiz results table
create table if not exists quiz_results (
  id uuid primary key default gen_random_uuid(),
  uid text references users(uid),
  topic text,
  score integer,
  total integer,
  accuracy integer,
  xp_earned integer,
  created_at timestamptz default now()
);

-- Forum posts
create table if not exists forum_posts (
  id uuid primary key default gen_random_uuid(),
  uid text references users(uid),
  username text,
  title text,
  body text,
  tags text[] default '{}',
  votes integer default 0,
  answers integer default 0,
  solved boolean default false,
  created_at timestamptz default now()
);

-- Forum answers
create table if not exists forum_answers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references forum_posts(id),
  uid text references users(uid),
  username text,
  body text,
  votes integer default 0,
  accepted boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table submissions enable row level security;
alter table course_progress enable row level security;
alter table quiz_results enable row level security;
alter table forum_posts enable row level security;
alter table forum_answers enable row level security;

-- Policies
create policy "Public profiles" on users for select using (true);
create policy "Own profile update" on users for update using (auth.uid()::text = uid);
create policy "Insert own profile" on users for insert with check (true);
create policy "View submissions" on submissions for select using (true);
create policy "Insert own submissions" on submissions for insert with check (true);
create policy "Course progress" on course_progress for all using (true);
create policy "Quiz results" on quiz_results for all using (true);
create policy "Forum posts" on forum_posts for all using (true);
create policy "Forum answers" on forum_answers for all using (true);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
*/
