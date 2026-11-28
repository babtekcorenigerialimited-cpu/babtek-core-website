-- Tighten cleanup for failed portal uploads.
-- Never allow a portal uploader to delete an object already referenced by
-- either an intake submission or the canonical project document register.
drop policy if exists "Users delete own unattached portal uploads" on storage.objects;
create policy "Users delete own unattached portal uploads"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'babtek-private'
  and (storage.foldername(name))[1] = auth.uid()::text
  and not exists (
    select 1 from public.project_file_submissions s
    where s.storage_path = objects.name
  )
  and not exists (
    select 1 from public.project_documents d
    where d.storage_path = objects.name
  )
);
