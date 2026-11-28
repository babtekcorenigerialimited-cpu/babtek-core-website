-- Allow a client or partner to remove only their own uploaded object
-- when metadata registration failed. Once a submission row exists, the
-- uploader cannot delete the object; it remains subject to staff review.
create policy "Users delete own unattached portal uploads"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'babtek-private'
  and (storage.foldername(name))[1] = auth.uid()::text
  and not exists (
    select 1
    from public.project_file_submissions s
    where s.storage_path = objects.name
  )
);
