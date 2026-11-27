drop policy if exists "Users read own submitted files from private storage" on storage.objects;
create policy "Users read own submitted files from private storage" on storage.objects
for select to authenticated
using (
 bucket_id='babtek-private'
 and (storage.foldername(name))[1]=auth.uid()::text
 and exists (
  select 1 from public.project_file_submissions s
  where s.storage_path=objects.name and s.uploader_id=auth.uid()
 )
);