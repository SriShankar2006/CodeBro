-- CodeBro full Supabase setup. Safe to rerun in Supabase SQL Editor.
-- Firebase authenticates users; Firebase ID tokens are verified in Edge Functions.
-- Course progress, certificates, submissions, AI history, and admin writes use those functions.

begin;
create extension if not exists pgcrypto;

create table if not exists public.users (
  uid text primary key,
  display_name text,
  username text unique,
  email text,
  avatar text default '',
  bio text default '',
  location text default '',
  role text not null default 'student' check (role in ('student', 'admin')),
  suspended boolean not null default false,
  xp integer not null default 0,
  level integer not null default 1,
  coins integer not null default 0,
  streak integer not null default 0,
  last_login_date text default '',
  solved_problems integer[] not null default '{}',
  badges text[] not null default '{}',
  social_links jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists display_name text;
alter table public.users add column if not exists username text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists avatar text default '';
alter table public.users add column if not exists bio text default '';
alter table public.users add column if not exists location text default '';
alter table public.users add column if not exists role text not null default 'student';
alter table public.users add column if not exists suspended boolean not null default false;
alter table public.users add column if not exists xp integer not null default 0;
alter table public.users add column if not exists level integer not null default 1;
alter table public.users add column if not exists coins integer not null default 0;
alter table public.users add column if not exists streak integer not null default 0;
alter table public.users add column if not exists last_login_date text default '';
alter table public.users add column if not exists solved_problems integer[] not null default '{}';
alter table public.users add column if not exists badges text[] not null default '{}';
alter table public.users add column if not exists social_links jsonb not null default '{}';
alter table public.users add column if not exists created_at timestamptz not null default now();

create table if not exists public.admin_content (
  content_key text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  constraint admin_content_content_key_check check (content_key in ('problems', 'courses', 'quizzes', 'hiddenProblems', 'hiddenCourses'))
);
alter table public.admin_content drop constraint if exists admin_content_content_key_check;
alter table public.admin_content add constraint admin_content_content_key_check
  check (content_key in ('problems', 'courses', 'quizzes', 'hiddenProblems', 'hiddenCourses'));

create table if not exists public.course_progress (
  uid text not null references public.users(uid) on delete cascade,
  course_id text not null,
  completed_lessons text[] not null default '{}',
  progress_pct integer not null default 0 check (progress_pct between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (uid, course_id)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  cert_id text not null unique,
  course_id text not null,
  course_title text not null,
  user_name text not null,
  issued_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  problem_id integer,
  problem_title text not null default '',
  language text not null default '',
  code text not null default '',
  verdict text not null,
  runtime text,
  memory integer,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  topic text not null,
  score integer not null default 0,
  total integer not null default 0,
  accuracy integer not null default 0,
  xp_earned integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  title text not null default 'New Chat',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_roadmaps (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  goal text not null,
  roadmap jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.ai_chats alter column messages type jsonb
  using case when messages is null or btrim(messages::text) = '' then '[]'::jsonb else messages::text::jsonb end;
alter table public.ai_roadmaps alter column roadmap type jsonb
  using case when roadmap is null or btrim(roadmap::text) = '' then '{}'::jsonb else roadmap::text::jsonb end;

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  key text not null,
  title text not null,
  description text not null default '',
  icon text not null default '',
  earned_at timestamptz not null default now(),
  unique (uid, key)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  type text not null,
  message text not null,
  link text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  item_type text not null,
  item_id text not null,
  item_title text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (uid, item_type, item_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  title text not null,
  event_date date not null,
  type text not null default 'reminder',
  link text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  username text not null default '',
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  votes integer not null default 0,
  answers integer not null default 0,
  solved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_answers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  uid text not null references public.users(uid) on delete cascade,
  username text not null default '',
  body text not null,
  votes integer not null default 0,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists course_progress_uid_idx on public.course_progress(uid);
create index if not exists certificates_uid_idx on public.certificates(uid, issued_at desc);
create index if not exists certificates_cert_id_idx on public.certificates(cert_id);
create index if not exists submissions_uid_created_idx on public.submissions(uid, created_at desc);
create index if not exists quiz_results_uid_created_idx on public.quiz_results(uid, created_at desc);
create index if not exists ai_chats_uid_updated_idx on public.ai_chats(uid, updated_at desc);
create index if not exists ai_roadmaps_uid_created_idx on public.ai_roadmaps(uid, created_at desc);

alter table public.users enable row level security;
alter table public.admin_content enable row level security;
alter table public.course_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.submissions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.ai_chats enable row level security;
alter table public.ai_roadmaps enable row level security;
alter table public.achievements enable row level security;
alter table public.notifications enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notes enable row level security;
alter table public.calendar_events enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_answers enable row level security;

drop policy if exists all_users on public.users;
drop policy if exists codebro_users_client_access on public.users;
drop policy if exists all_admin_content on public.admin_content;
drop policy if exists codebro_admin_content_client_access on public.admin_content;
drop policy if exists admin_content_client_read on public.admin_content;
create policy admin_content_client_read on public.admin_content for select to anon, authenticated using (true);
revoke insert, update, delete on table public.admin_content from anon, authenticated;
grant select on table public.admin_content to anon, authenticated;

drop policy if exists all_course_progress on public.course_progress;
drop policy if exists course_progress_client_access on public.course_progress;
revoke all on table public.course_progress from anon, authenticated;
grant all on table public.course_progress to service_role;

drop policy if exists all_submissions on public.submissions;
drop policy if exists submissions_user_access on public.submissions;
revoke all on table public.submissions from anon, authenticated;
grant all on table public.submissions to service_role;

drop policy if exists all_ai_chats on public.ai_chats;
drop policy if exists ai_chats_user_access on public.ai_chats;
drop policy if exists all_ai_roadmaps on public.ai_roadmaps;
drop policy if exists ai_roadmaps_user_access on public.ai_roadmaps;
revoke all on table public.ai_chats, public.ai_roadmaps from anon, authenticated;
grant all on table public.ai_chats, public.ai_roadmaps to service_role;

drop policy if exists all_certificates on public.certificates;
drop policy if exists codebro_certificates_client_access on public.certificates;
drop policy if exists certificates_public_verification on public.certificates;
create policy certificates_public_verification on public.certificates for select to anon, authenticated using (true);
revoke insert, update, delete on table public.certificates from anon, authenticated;
grant select on table public.certificates to anon, authenticated;
grant all on table public.certificates to service_role;

grant select, insert, update, delete on table
  public.users, public.quiz_results, public.achievements, public.notifications,
  public.bookmarks, public.notes, public.calendar_events, public.forum_posts, public.forum_answers
to anon, authenticated;
grant all on table
  public.users, public.admin_content, public.quiz_results, public.achievements,
  public.notifications, public.bookmarks, public.notes, public.calendar_events,
  public.forum_posts, public.forum_answers
to service_role;

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array['users', 'quiz_results', 'achievements', 'notifications', 'bookmarks', 'notes', 'calendar_events', 'forum_posts', 'forum_answers'] loop
    policy_name := 'all_' || table_name;
    execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    execute format('drop policy if exists codebro_client_access on public.%I', table_name);
    execute format('create policy codebro_client_access on public.%I for all to anon, authenticated using (true) with check (true)', table_name);
  end loop;
end $$;

create or replace function public.codebro_guard_admin_fields()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
      and current_user not in ('postgres', 'supabase_admin')
     and (new.role is distinct from old.role or new.suspended is distinct from old.suspended) then
    raise exception 'Admin-only account fields cannot be changed by a client.';
  end if;
  return new;
end;
$$;
drop trigger if exists codebro_guard_admin_fields on public.users;
create trigger codebro_guard_admin_fields before update on public.users
  for each row execute function public.codebro_guard_admin_fields();

-- Promote the configured Firebase admin if their profile row already exists.
update public.users set role = 'admin' where lower(email) = 'admin1@codebro.dev';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-thumbnails', 'course-thumbnails', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'admin_content') then
    alter publication supabase_realtime add table public.admin_content;
  end if;
end $$;

commit;
notify pgrst, 'reload schema';

-- Verify the configured admin profile after the setup script completes.
select uid, email, role from public.users where lower(email) = 'admin1@codebro.dev';
