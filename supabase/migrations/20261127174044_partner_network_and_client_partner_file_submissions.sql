alter table public.professional_partners
  add column if not exists partner_type text,
  add column if not exists specialties text[] not null default '{}',
  add column if not exists division_affiliations text[] not null default '{}',
  add column if not exists relationship_status text not null default 'active',
  add column if not exists website text,
  add column if not exists preferred_contact_method text;
alter table public.professional_partners
  drop constraint if exists professional_partners_relationship_status_check;
alter table public.professional_partners
  add constraint professional_partners_relationship_status_check
  check (relationship_status in ('prospect','active','paused','inactive','blacklisted'));
create index if not exists professional_partners_relationship_status_idx on public.professional_partners(relationship_status);
create index if not exists professional_partners_specialties_gin_idx on public.professional_partners using gin(specialties);
create index if not exists professional_partners_division_affiliations_gin_idx on public.professional_partners using gin(division_affiliations);

create table if not exists public.project_file_submissions (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 partner_engagement_id uuid references public.project_partner_engagements(id) on delete set null,
 uploader_id uuid not null references auth.users(id) on delete cascade,
 uploader_kind text not null check (uploader_kind in ('client','partner')),
 title text not null check (char_length(title) between 2 and 180),
 original_filename text not null check (char_length(original_filename) between 1 and 255),
 mime_type text not null,
 file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 52428800),
 storage_path text not null unique,
 notes text,
 review_status text not null default 'pending' check (review_status in ('pending','accepted','changes_requested','rejected')),
 review_note text,
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 constraint project_file_submission_partner_scope check (
   (uploader_kind = 'client' and partner_engagement_id is null) or
   (uploader_kind = 'partner' and partner_engagement_id is not null)
 )
);
create index if not exists project_file_submissions_project_created_idx on public.project_file_submissions(project_id,created_at desc);
create index if not exists project_file_submissions_uploader_created_idx on public.project_file_submissions(uploader_id,created_at desc);
create index if not exists project_file_submissions_review_idx on public.project_file_submissions(review_status,created_at desc);
alter table public.project_file_submissions enable row level security;

drop policy if exists "BABTEK staff manage file submissions" on public.project_file_submissions;
create policy "BABTEK staff manage file submissions" on public.project_file_submissions
for all to authenticated
using (public.has_role(array['owner','administrator','operations']::public.app_role[]))
with check (public.has_role(array['owner','administrator','operations']::public.app_role[]));

drop policy if exists "Clients submit files to own projects" on public.project_file_submissions;
create policy "Clients submit files to own projects" on public.project_file_submissions
for insert to authenticated
with check (
 uploader_id = auth.uid()
 and uploader_kind = 'client'
 and partner_engagement_id is null
 and exists (
   select 1 from public.projects p
   join public.client_contacts c on c.client_id = p.client_id
   where p.id = project_id and c.user_id = auth.uid()
 )
);

drop policy if exists "Partners submit files to own engagements" on public.project_file_submissions;
create policy "Partners submit files to own engagements" on public.project_file_submissions
for insert to authenticated
with check (
 uploader_id = auth.uid()
 and uploader_kind = 'partner'
 and partner_engagement_id is not null
 and exists (
   select 1 from public.project_partner_engagements e
   join public.partner_user_links l on l.partner_id = e.partner_id
   where e.id = partner_engagement_id
     and e.project_id = project_id
     and l.user_id = auth.uid()
 )
);

drop policy if exists "Users read own submitted files" on public.project_file_submissions;
create policy "Users read own submitted files" on public.project_file_submissions
for select to authenticated
using (uploader_id = auth.uid());

drop policy if exists "Clients upload own project submissions to private storage" on storage.objects;
create policy "Clients upload own project submissions to private storage" on storage.objects
for insert to authenticated
with check (
 bucket_id = 'babtek-private'
 and (storage.foldername(name))[1] = auth.uid()::text
 and exists (
   select 1 from public.projects p
   join public.client_contacts c on c.client_id = p.client_id
   where p.id::text = (storage.foldername(name))[2]
     and c.user_id = auth.uid()
 )
);

drop policy if exists "Partners upload own engagement submissions to private storage" on storage.objects;
create policy "Partners upload own engagement submissions to private storage" on storage.objects
for insert to authenticated
with check (
 bucket_id = 'babtek-private'
 and (storage.foldername(name))[1] = auth.uid()::text
 and exists (
   select 1 from public.project_partner_engagements e
   join public.partner_user_links l on l.partner_id = e.partner_id
   where e.project_id::text = (storage.foldername(name))[2]
     and e.id::text = (storage.foldername(name))[3]
     and l.user_id = auth.uid()
 )
);