-- Partner portal access boundaries.
alter table public.project_documents
  add column if not exists partner_visible boolean not null default false;

drop policy if exists "project engagements read" on public.project_partner_engagements;
create policy "project engagements scoped read"
on public.project_partner_engagements for select to authenticated
using (
  public.has_role(array['owner','administrator','operations','finance']::public.app_role[])
  or exists (
    select 1 from public.partner_user_links l
    where l.partner_id = project_partner_engagements.partner_id
      and l.user_id = auth.uid()
  )
);

drop policy if exists "tasks scoped read" on public.project_tasks;
create policy "tasks scoped read"
on public.project_tasks for select to authenticated
using (
  public.has_role(array['owner','administrator','operations','finance','content_manager']::public.app_role[])
  or exists (
    select 1 from public.project_members m
    where m.project_id = project_tasks.project_id and m.user_id = auth.uid()
  )
  or exists (
    select 1 from public.projects p
    join public.client_contacts c on c.client_id = p.client_id
    where p.id = project_tasks.project_id and c.user_id = auth.uid()
  )
  or (
    project_tasks.assigned_partner_id is not null
    and exists (
      select 1 from public.partner_user_links l
      where l.partner_id = project_tasks.assigned_partner_id and l.user_id = auth.uid()
    )
  )
);

create policy "partners read assigned visible documents"
on public.project_documents for select to authenticated
using (
  partner_visible
  and exists (
    select 1 from public.project_partner_engagements e
    join public.partner_user_links l on l.partner_id = e.partner_id
    where e.project_id = project_documents.project_id and l.user_id = auth.uid()
  )
);

create policy "partners read own payment schedules"
on public.partner_payment_schedules for select to authenticated
using (
  exists (
    select 1 from public.project_partner_engagements e
    join public.partner_user_links l on l.partner_id = e.partner_id
    where e.id = partner_payment_schedules.engagement_id and l.user_id = auth.uid()
  )
);

create policy "partners update assigned task status"
on public.project_tasks for update to authenticated
using (
  assigned_partner_id is not null
  and exists (
    select 1 from public.partner_user_links l
    where l.partner_id = project_tasks.assigned_partner_id and l.user_id = auth.uid()
  )
)
with check (
  assigned_partner_id is not null
  and exists (
    select 1 from public.partner_user_links l
    where l.partner_id = project_tasks.assigned_partner_id and l.user_id = auth.uid()
  )
);
