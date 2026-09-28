-- Private submissions; shared admin content is publicly readable but only the
-- authenticated admin Edge Function may write it.
begin;

alter table public.submissions enable row level security;
drop policy if exists submissions_user_access on public.submissions;
drop policy if exists all_submissions on public.submissions;
revoke all on table public.submissions from anon, authenticated;

alter table public.admin_content enable row level security;
drop policy if exists codebro_admin_content_client_access on public.admin_content;
drop policy if exists all_admin_content on public.admin_content;
drop policy if exists admin_content_client_read on public.admin_content;
create policy admin_content_client_read on public.admin_content
  for select to anon, authenticated using (true);
revoke insert, update, delete on table public.admin_content from anon, authenticated;
grant select on table public.admin_content to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'admin_content'
  ) then
    alter publication supabase_realtime add table public.admin_content;
  end if;
end
$$;

commit;

notify pgrst, 'reload schema';
