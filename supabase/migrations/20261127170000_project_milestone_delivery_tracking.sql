-- Extend project milestones into a practical delivery and acceptance tracker.
alter table public.project_milestones
  add column if not exists start_date date,
  add column if not exists deliverable text,
  add column if not exists progress_percent integer not null default 0,
  add column if not exists delay_reason text,
  add column if not exists acceptance_status text not null default 'not_submitted',
  add column if not exists accepted_at timestamptz,
  add column if not exists client_visible boolean not null default false,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.project_milestones
  add constraint project_milestones_progress_range check (progress_percent between 0 and 100),
  add constraint project_milestones_acceptance_status check (acceptance_status in ('not_submitted','submitted','accepted','changes_requested')),
  add constraint project_milestones_status_check check (status in ('pending','in_progress','completed','delayed','cancelled'));

create index if not exists project_milestones_project_order_idx
  on public.project_milestones(project_id, display_order, due_date);
create index if not exists project_milestones_project_status_idx
  on public.project_milestones(project_id, status);
