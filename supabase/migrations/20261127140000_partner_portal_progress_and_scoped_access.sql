create table if not exists public.partner_progress_updates (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.project_partner_engagements(id) on delete cascade,
  task_id uuid references public.project_tasks(id) on delete set null,
  submitted_by uuid not null references auth.users(id) on delete restrict,
  update_text text not null check (char_length(update_text) between 10 and 5000),
  progress_percent smallint check (progress_percent between 0 and 100),
  review_status text not null default 'submitted' check (review_status in ('submitted','reviewed','changes_requested')),
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists partner_progress_updates_engagement_created_idx
  on public.partner_progress_updates(engagement_id, created_at desc);
create index if not exists partner_progress_updates_task_idx
  on public.partner_progress_updates(task_id);

alter table public.partner_progress_updates enable row level security;

create policy "internal partner progress management"
on public.partner_progress_updates for all to authenticated
using (public.has_role(array['owner','administrator','operations']::public.app_role[]))
with check (public.has_role(array['owner','administrator','operations']::public.app_role[]));

create policy "partners read own progress updates"
on public.partner_progress_updates for select to authenticated
using (exists (
  select 1 from public.project_partner_engagements e
  join public.partner_user_links l on l.partner_id=e.partner_id
  where e.id=partner_progress_updates.engagement_id and l.user_id=auth.uid()
));

create policy "partners submit own progress updates"
on public.partner_progress_updates for insert to authenticated
with check (
  submitted_by=auth.uid() and review_status='submitted'
  and reviewed_by is null and reviewed_at is null
  and exists (
    select 1 from public.project_partner_engagements e
    join public.partner_user_links l on l.partner_id=e.partner_id
    where e.id=partner_progress_updates.engagement_id and l.user_id=auth.uid()
      and (partner_progress_updates.task_id is null or exists (
        select 1 from public.project_tasks t
        where t.id=partner_progress_updates.task_id
          and t.project_id=e.project_id and t.assigned_partner_id=e.partner_id
      ))
  )
);

-- Partners can see their own engagement terms only, not another specialist's fee or scope.
drop policy if exists "project engagements scoped read" on public.project_partner_engagements;
drop policy if exists "project engagements read" on public.project_partner_engagements;
create policy "project engagements scoped read"
on public.project_partner_engagements for select to authenticated
using (
  public.has_role(array['owner','administrator','operations','finance']::public.app_role[])
  or exists (
    select 1 from public.partner_user_links l
    where l.partner_id=project_partner_engagements.partner_id and l.user_id=auth.uid()
  )
);

-- Partners submit progress through the dedicated updates table; they cannot alter task assignments or scope.
drop policy if exists "partners update assigned task status" on public.project_tasks;

-- Keep task visibility limited to internal roles, project members, linked clients and the partner assigned to each task.
drop policy if exists "tasks scoped read" on public.project_tasks;
create policy "tasks scoped read"
on public.project_tasks for select to authenticated
using (
  public.has_role(array['owner','administrator','operations','finance','content_manager']::public.app_role[])
  or exists (select 1 from public.project_members m where m.project_id=project_tasks.project_id and m.user_id=auth.uid())
  or exists (
    select 1 from public.projects p join public.client_contacts c on c.client_id=p.client_id
    where p.id=project_tasks.project_id and c.user_id=auth.uid()
  )
  or (assigned_partner_id is not null and exists (
    select 1 from public.partner_user_links l
    where l.partner_id=project_tasks.assigned_partner_id and l.user_id=auth.uid()
  ))
);

-- Private project files are available to partners only when explicitly marked partner-visible
-- and associated with an engagement belonging to the signed-in partner.
drop policy if exists "Partners read assigned visible project files" on storage.objects;
create policy "Partners read assigned visible project files"
on storage.objects for select to authenticated
using (
  bucket_id='babtek-private'
  and exists (
    select 1 from public.project_documents d
    join public.project_partner_engagements e on e.project_id=d.project_id
    join public.partner_user_links l on l.partner_id=e.partner_id
    where d.storage_path=storage.objects.name and d.partner_visible=true and l.user_id=auth.uid()
  )
);
