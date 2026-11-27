-- Correct project and engagement binding for private client/partner uploads.
-- Prevent a partner engagement for one project being used to submit metadata
-- against a different project. Correct the client storage path check to inspect
-- the uploaded object path rather than the project name.
drop policy if exists "Partners submit files to own engagements" on public.project_file_submissions;
create policy "Partners submit files to own engagements"
on public.project_file_submissions
for insert to authenticated
with check (
 uploader_id = auth.uid()
 and uploader_kind = 'partner'
 and partner_engagement_id is not null
 and mime_type = any(array[
  'application/pdf','image/jpeg','image/png','image/webp','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain','application/zip'
 ])
 and (storage.foldername(storage_path))[1] = auth.uid()::text
 and (storage.foldername(storage_path))[2] = project_id::text
 and (storage.foldername(storage_path))[3] = partner_engagement_id::text
 and exists (
  select 1 from public.project_partner_engagements e
  join public.partner_user_links l on l.partner_id=e.partner_id
  where e.id=project_file_submissions.partner_engagement_id
    and e.project_id=project_file_submissions.project_id
    and l.user_id=auth.uid()
 )
);
drop policy if exists "Clients upload own project submissions to private storage" on storage.objects;
create policy "Clients upload own project submissions to private storage"
on storage.objects
for insert to authenticated
with check (
 bucket_id='babtek-private'
 and (storage.foldername(name))[1]=auth.uid()::text
 and exists (
  select 1 from public.projects p
  join public.client_contacts c on c.client_id=p.client_id
  where p.id::text=(storage.foldername(name))[2]
    and c.user_id=auth.uid()
 )
);
