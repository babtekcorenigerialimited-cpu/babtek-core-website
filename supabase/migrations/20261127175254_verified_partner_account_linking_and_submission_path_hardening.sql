
create or replace function public.handle_new_client_account()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare assigned_role public.app_role;
begin
  insert into public.profiles (id, full_name) values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', '')) on conflict (id) do nothing;
  assigned_role := case when new.raw_user_meta_data ->> 'account_type' = 'partner' then 'partner'::public.app_role else 'client'::public.app_role end;
  insert into public.user_roles (user_id, role) values (new.id, assigned_role) on conflict (user_id, role) do nothing;
  perform public.link_verified_partner_account(new.id);
  return new;
end;
$$;

drop policy if exists "Clients submit files to own projects" on public.project_file_submissions;
create policy "Clients submit files to own projects" on public.project_file_submissions for insert to authenticated
with check (
 uploader_id = auth.uid() and uploader_kind = 'client' and partner_engagement_id is null
 and mime_type in ('application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','application/zip')
 and (storage.foldername(storage_path))[1] = auth.uid()::text
 and (storage.foldername(storage_path))[2] = project_id::text
 and exists (select 1 from public.projects p join public.client_contacts c on c.client_id=p.client_id where p.id=project_id and c.user_id=auth.uid())
);
drop policy if exists "Partners submit files to own engagements" on public.project_file_submissions;
create policy "Partners submit files to own engagements" on public.project_file_submissions for insert to authenticated
with check (
 uploader_id = auth.uid() and uploader_kind = 'partner' and partner_engagement_id is not null
 and mime_type in ('application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','application/zip')
 and (storage.foldername(storage_path))[1] = auth.uid()::text
 and (storage.foldername(storage_path))[2] = project_id::text
 and (storage.foldername(storage_path))[3] = partner_engagement_id::text
 and exists (select 1 from public.project_partner_engagements e join public.partner_user_links l on l.partner_id=e.partner_id where e.id=partner_engagement_id and e.project_id=project_id and l.user_id=auth.uid())
);
