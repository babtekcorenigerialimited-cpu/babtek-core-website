
create table if not exists public.partner_network_applications (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default ('PNA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  applicant_name text not null check (char_length(applicant_name) between 2 and 160),
  organisation text,
  email text not null,
  phone text,
  partner_type text not null check (partner_type in ('professional','technology','supplier','venture','strategic','research','education','other')),
  primary_category text not null check (char_length(primary_category) between 2 and 120),
  specialties text[] not null default '{}',
  division_affiliations text[] not null default '{}',
  website text,
  experience_summary text not null check (char_length(experience_summary) between 20 and 5000),
  collaboration_interest text not null check (char_length(collaboration_interest) between 20 and 3000),
  status text not null default 'pending' check (status in ('pending','under_review','approved','more_information_required','declined')),
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  partner_id uuid references public.professional_partners(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint partner_application_email_valid check (position('@' in email) > 1)
);
create index if not exists partner_network_applications_status_created_idx
  on public.partner_network_applications(status, created_at desc);
create index if not exists partner_network_applications_email_idx
  on public.partner_network_applications(lower(email));
alter table public.partner_network_applications enable row level security;

drop policy if exists "Public can submit partner network applications" on public.partner_network_applications;
create policy "Public can submit partner network applications"
on public.partner_network_applications for insert to anon, authenticated
with check (
  status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and partner_id is null
  and char_length(applicant_name) between 2 and 160
  and char_length(experience_summary) between 20 and 5000
  and char_length(collaboration_interest) between 20 and 3000
);
drop policy if exists "Owner manages partner network applications" on public.partner_network_applications;
create policy "Owner manages partner network applications" on public.partner_network_applications for all to authenticated
using (public.has_role(array['owner']::public.app_role[]))
with check (public.has_role(array['owner']::public.app_role[]));

create or replace function public.link_verified_partner_account(p_user_id uuid)
returns integer language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_email text; v_count integer := 0; v_partner record;
begin
  select lower(trim(email)) into v_email from auth.users where id = p_user_id and email_confirmed_at is not null;
  if v_email is null then return 0; end if;
  for v_partner in select id from public.professional_partners where lower(trim(email)) = v_email and relationship_status = 'active'
  loop
    insert into public.partner_user_links(partner_id,user_id) values(v_partner.id,p_user_id) on conflict(partner_id,user_id) do nothing;
    insert into public.user_roles(user_id,role) values(p_user_id,'partner'::public.app_role) on conflict(user_id,role) do nothing;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.link_verified_partner_account(uuid) from public, anon, authenticated;

create or replace function public.handle_verified_partner_email()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if new.email_confirmed_at is not null and (old.email_confirmed_at is null or old.email_confirmed_at is distinct from new.email_confirmed_at) then
    perform public.link_verified_partner_account(new.id);
  end if;
  return new;
end;
$$;
revoke all on function public.handle_verified_partner_email() from public, anon, authenticated;
drop trigger if exists on_verified_partner_email_babtek on auth.users;
create trigger on_verified_partner_email_babtek after update of email_confirmed_at on auth.users
for each row execute function public.handle_verified_partner_email();

create or replace function public.approve_partner_network_application(p_application_id uuid,p_review_note text default null)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_application public.partner_network_applications%rowtype; v_partner_id uuid;
begin
  if auth.uid() is null or not public.has_role(array['owner']::public.app_role[]) then raise exception 'Only the BABTEK owner can approve partner applications'; end if;
  select * into v_application from public.partner_network_applications where id = p_application_id for update;
  if not found then raise exception 'Application not found'; end if;
  if v_application.status not in ('pending','under_review','more_information_required') then raise exception 'Application is no longer awaiting approval'; end if;
  insert into public.professional_partners(legal_name,trading_name,email,phone,professional_category,partner_type,specialties,division_affiliations,website,notes,relationship_status,created_by)
  values(coalesce(nullif(v_application.organisation,''),v_application.applicant_name),nullif(v_application.organisation,''),lower(trim(v_application.email)),nullif(v_application.phone,''),v_application.primary_category,v_application.partner_type,v_application.specialties,v_application.division_affiliations,nullif(v_application.website,''),'Approved through open BABTEK partner network application ' || v_application.reference_code,'active',auth.uid())
  returning id into v_partner_id;
  update public.partner_network_applications set status='approved',partner_id=v_partner_id,review_note=nullif(left(coalesce(p_review_note,''),2000),''),reviewed_by=auth.uid(),reviewed_at=now() where id=p_application_id;
  perform public.link_verified_partner_account((select id from auth.users where lower(trim(email))=lower(trim(v_application.email)) and email_confirmed_at is not null order by created_at desc limit 1));
  insert into public.audit_logs(actor_id,action,table_name,record_id,metadata) values(auth.uid(),'partner_application.approved','partner_network_applications',p_application_id::text,jsonb_build_object('reference_code',v_application.reference_code,'partner_id',v_partner_id));
  return v_partner_id;
end;
$$;
revoke all on function public.approve_partner_network_application(uuid,text) from public, anon;
grant execute on function public.approve_partner_network_application(uuid,text) to authenticated;
