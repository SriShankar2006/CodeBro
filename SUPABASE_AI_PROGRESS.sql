-- Run this once in the Supabase SQL Editor for the project in .env.
-- It creates the tables used by AI history and editor progress.

create extension if not exists pgcrypto;

create table if not exists public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  uid text not null,
  title text not null default 'New Chat',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_roadmaps (
  id uuid primary key default gen_random_uuid(),
  uid text not null,
  goal text not null,
  roadmap jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  uid text not null,
  problem_id integer,
  problem_title text,
  language text,
  code text,
  verdict text not null,
  runtime text,
  memory integer,
  created_at timestamptz not null default now()
);

create index if not exists ai_chats_uid_updated_idx on public.ai_chats(uid, updated_at desc);
create index if not exists ai_roadmaps_uid_created_idx on public.ai_roadmaps(uid, created_at desc);
create index if not exists submissions_uid_created_idx on public.submissions(uid, created_at desc);

alter table public.ai_chats enable row level security;
alter table public.ai_roadmaps enable row level security;
alter table public.submissions enable row level security;

-- Submissions are accessed through Firebase-verified Edge Functions only.
drop policy if exists submissions_user_access on public.submissions;
drop policy if exists all_submissions on public.submissions;
revoke all on table public.submissions from anon, authenticated;

-- AI history and roadmaps are accessed through Firebase-verified Edge Functions.
drop policy if exists ai_chats_user_access on public.ai_chats;
drop policy if exists ai_roadmaps_user_access on public.ai_roadmaps;
drop policy if exists all_ai_chats on public.ai_chats;
drop policy if exists all_ai_roadmaps on public.ai_roadmaps;
revoke all on table public.ai_chats, public.ai_roadmaps from anon, authenticated;
grant all on table public.ai_chats, public.ai_roadmaps to service_role;

-- Refresh PostgREST's schema cache after creating the tables.
notify pgrst, 'reload schema';
