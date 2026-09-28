begin;

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

create index if not exists course_progress_uid_idx on public.course_progress(uid);
create index if not exists certificates_uid_idx on public.certificates(uid, issued_at desc);

alter table public.course_progress enable row level security;
alter table public.certificates enable row level security;

drop policy if exists all_course_progress on public.course_progress;
drop policy if exists course_progress_client_access on public.course_progress;
drop policy if exists all_certificates on public.certificates;
drop policy if exists codebro_certificates_client_access on public.certificates;

revoke all on table public.course_progress from anon, authenticated;
grant all on table public.course_progress to service_role;
revoke insert, update, delete on table public.certificates from anon, authenticated;
grant select on table public.certificates to anon, authenticated;

drop policy if exists certificates_public_verification on public.certificates;
create policy certificates_public_verification on public.certificates
  for select to anon, authenticated using (true);

create or replace function public.codebro_guard_admin_fields()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
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
create trigger codebro_guard_admin_fields
  before update on public.users
  for each row execute function public.codebro_guard_admin_fields();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-thumbnails', 'course-thumbnails', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

commit;

notify pgrst, 'reload schema';