-- AI data is accessed only through Firebase-verified Edge Functions.
-- Store GOOGLE_AI_API_KEY in Supabase Function Secrets, never in the browser app.
begin;

create extension if not exists pgcrypto;

create table if not exists public.ai_roadmaps (
  id uuid primary key default gen_random_uuid(),
  uid text not null,
  goal text not null,
  roadmap jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  uid text not null,
  title text not null default 'New Chat',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_roadmaps
  alter column roadmap type jsonb
  using case when roadmap is null or btrim(roadmap::text) = '' then '{}'::jsonb else roadmap::text::jsonb end;
alter table public.ai_chats
  alter column messages type jsonb
  using case when messages is null or btrim(messages::text) = '' then '[]'::jsonb else messages::text::jsonb end;

create index if not exists ai_roadmaps_uid_created_idx
  on public.ai_roadmaps(uid, created_at desc);
create index if not exists ai_chats_uid_updated_idx
  on public.ai_chats(uid, updated_at desc);

alter table public.ai_roadmaps enable row level security;
alter table public.ai_chats enable row level security;

drop policy if exists ai_roadmaps_user_access on public.ai_roadmaps;
drop policy if exists all_ai_roadmaps on public.ai_roadmaps;
drop policy if exists ai_chats_user_access on public.ai_chats;
drop policy if exists all_ai_chats on public.ai_chats;

revoke all on table public.ai_roadmaps from anon, authenticated;
revoke all on table public.ai_chats from anon, authenticated;
grant all on table public.ai_roadmaps to service_role;
grant all on table public.ai_chats to service_role;

commit;

notify pgrst, 'reload schema';