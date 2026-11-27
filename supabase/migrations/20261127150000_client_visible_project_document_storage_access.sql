drop policy if exists "Clients read linked visible project files" on storage.objects;
create policy "Clients read linked visible project files"
on storage.objects for select to authenticated
using (
  bucket_id='babtek-private'
  and exists (
    select 1 from public.project_documents d
    join public.projects p on p.id=d.project_id
    join public.client_contacts c on c.client_id=p.client_id
    where d.storage_path=storage.objects.name
      and d.client_visible=true
      and c.user_id=auth.uid()
  )
);