-- Anonymous Supabase Auth sessions use the authenticated Postgres role.
-- Restrictive policies ensure every permissive policy on these sensitive
-- file tables/storage also requires a non-anonymous session.
drop policy if exists "Require registered sessions for project file submissions" on public.project_file_submissions;
create policy "Require registered sessions for project file submissions"
on public.project_file_submissions
as restrictive
for all
to authenticated
using (coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
with check (coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

drop policy if exists "Require registered sessions for project documents" on public.project_documents;
create policy "Require registered sessions for project documents"
on public.project_documents
as restrictive
for all
to authenticated
using (coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
with check (coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

drop policy if exists "Require registered sessions for private storage" on storage.objects;
create policy "Require registered sessions for private storage"
on storage.objects
as restrictive
for all
to authenticated
using (
  bucket_id <> 'babtek-private'
  or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
)
with check (
  bucket_id <> 'babtek-private'
  or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);
