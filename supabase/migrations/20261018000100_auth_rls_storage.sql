-- Category 02A: enable authenticated owner access without weakening the locked schema.
-- Owner IDs are always derived from auth.uid() by policy; clients cannot choose them.

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.user_settings (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_auth_user();

grant usage on schema public to authenticated;

-- Profiles are initialized by the trusted trigger; only display_name is mutable.
grant select, update (display_name) on public.profiles to authenticated;
create policy profiles_select_owner on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_owner on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Generate the same explicit owner predicate for each mutable owner-scoped table.
do $$
declare
  item record;
begin
  for item in select * from (values
    ('user_settings', 'user_id'), ('sessions', 'owner_id'),
    ('recordings', 'owner_id'), ('dataset_metadata', 'owner_id'),
    ('annotations', 'owner_id'), ('model_versions', 'owner_id'),
    ('analysis_runs', 'owner_id'), ('analysis_segments', 'owner_id'),
    ('experiment_runs', 'owner_id')
  ) as owner_tables(table_name, owner_column)
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', item.table_name);
    execute format('create policy %I on public.%I for select to authenticated using (%I = (select auth.uid()))', item.table_name || '_select_owner', item.table_name, item.owner_column);
    execute format('create policy %I on public.%I for insert to authenticated with check (%I = (select auth.uid()))', item.table_name || '_insert_owner', item.table_name, item.owner_column);
    execute format('create policy %I on public.%I for update to authenticated using (%I = (select auth.uid())) with check (%I = (select auth.uid()))', item.table_name || '_update_owner', item.table_name, item.owner_column, item.owner_column);
    execute format('create policy %I on public.%I for delete to authenticated using (%I = (select auth.uid()))', item.table_name || '_delete_owner', item.table_name, item.owner_column);
  end loop;
end;
$$;

-- Scramble snapshots are immutable. Solves only allow penalty/notes updates;
-- evidence fields remain protected by the Category 02 update trigger.
grant select, insert, delete on public.scrambles to authenticated;
create policy scrambles_select_owner on public.scrambles for select to authenticated
  using (owner_id = (select auth.uid()));
create policy scrambles_insert_owner on public.scrambles for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy scrambles_delete_owner on public.scrambles for delete to authenticated
  using (owner_id = (select auth.uid()));

grant select, insert, delete on public.solves to authenticated;
grant update (penalty, notes) on public.solves to authenticated;
create policy solves_select_owner on public.solves for select to authenticated
  using (owner_id = (select auth.uid()));
create policy solves_insert_owner on public.solves for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy solves_update_owner on public.solves for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy solves_delete_owner on public.solves for delete to authenticated
  using (owner_id = (select auth.uid()));

-- The only binary data is uploaded to this private bucket after explicit consent.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recordings', 'recordings', false, 104857600, array['video/webm', 'video/mp4', 'video/quicktime'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy recordings_objects_select_owner on storage.objects
  for select to authenticated using (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy recordings_objects_insert_owner on storage.objects
  for insert to authenticated with check (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy recordings_objects_update_owner on storage.objects
  for update to authenticated using (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text
  ) with check (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy recordings_objects_delete_owner on storage.objects
  for delete to authenticated using (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
