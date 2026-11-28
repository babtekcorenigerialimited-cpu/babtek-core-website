-- Allow operations staff to review project submissions and project-library files.
-- This is read-only and restricted to objects referenced by project records.
create policy "Operations read private project files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'babtek-private'
  and public.has_role(array['operations']::public.app_role[])
  and (
    exists (
      select 1
      from public.project_file_submissions s
      where s.storage_path = objects.name
    )
    or exists (
      select 1
      from public.project_documents d
      where d.storage_path = objects.name
    )
  )
);
