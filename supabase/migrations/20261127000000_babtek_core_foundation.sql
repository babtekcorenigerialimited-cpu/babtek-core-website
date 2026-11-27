create extension if not exists pgcrypto;

create type public.app_role as enum ('owner','administrator','operations','finance','content_manager','client','partner');
create type public.content_state as enum ('draft','published','archived');
create type public.project_state as enum ('proposed','ongoing','on_hold','completed','cancelled');
create type public.enquiry_state as enum ('new','reviewing','qualified','quoted','converted','declined','closed');
create type public.document_state as enum ('draft','issued','signed','superseded','void');
create type public.invoice_state as enum ('draft','issued','partially_paid','paid','overdue','cancelled');
create type public.payment_state as enum ('planned','due','partially_paid','paid','cancelled');

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, avatar_path text, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null, granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), primary key(user_id,role)
);
create or replace function public.has_role(roles public.app_role[]) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=auth.uid() and role=any(roles));
$$;

create table public.divisions (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  pillar text not null, summary text, description text, lifecycle text not null default 'developing',
  display_order integer not null default 0, is_public boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(), division_id uuid references public.divisions(id) on delete set null,
  slug text not null unique, name text not null, summary text, description text,
  delivery_model text not null default 'partner_coordinated', lifecycle text not null default 'developing',
  visibility public.content_state not null default 'draft', display_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.site_pages (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  excerpt text, body jsonb not null default '{}'::jsonb, visibility public.content_state not null default 'draft',
  published_at timestamptz, created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.media_assets (
  id uuid primary key default gen_random_uuid(), storage_path text not null unique, alt_text text,
  caption text, media_type text, rights_holder text, permission_reference text,
  approved_for_publication boolean not null default false,
  uploaded_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);
create table public.projects_public (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  summary text, description text, project_type text, location_label text,
  status public.project_state not null default 'proposed', cover_media_path text,
  visibility public.content_state not null default 'draft', approved_for_publication boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (visibility <> 'published' or approved_for_publication)
);
create table public.insights (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  excerpt text, body jsonb not null default '{}'::jsonb, author_id uuid references auth.users(id) on delete set null,
  visibility public.content_state not null default 'draft', published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.careers (
  id uuid primary key default gen_random_uuid(), title text not null,
  division_id uuid references public.divisions(id) on delete set null, location_label text,
  employment_type text, description text, application_email text, closes_at timestamptz,
  visibility public.content_state not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.partnership_opportunities (
  id uuid primary key default gen_random_uuid(), title text not null, category text, description text,
  application_instructions text, closes_at timestamptz, visibility public.content_state not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_initiatives (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  division_id uuid references public.divisions(id) on delete set null, summary text, description text,
  status text not null default 'concept' check(status in ('concept','planned','in_development','pilot','released','retired')),
  visibility public.content_state not null default 'draft', public_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default ('ENQ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  full_name text not null, email text not null, phone text, organisation text, subject text not null,
  message text not null, service_interest text, division_id uuid references public.divisions(id) on delete set null,
  status public.enquiry_state not null default 'new', source text not null default 'website',
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(position('@' in email)>1), check(char_length(message) between 10 and 10000)
);
create table public.enquiry_activity (
  id uuid primary key default gen_random_uuid(), enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null, activity_type text not null, note text,
  from_status public.enquiry_state, to_status public.enquiry_state, created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(), legal_name text not null, display_name text,
  email text, phone text, billing_address text, notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.client_contacts (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, full_name text not null, email text not null,
  phone text, job_title text, is_primary boolean not null default false, created_at timestamptz not null default now(),
  unique(client_id,email)
);
create table public.professional_partners (
  id uuid primary key default gen_random_uuid(), legal_name text not null, trading_name text,
  email text, phone text, professional_category text, registration_details text, address text, notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.partner_user_links (
  partner_id uuid not null references public.professional_partners(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(partner_id,user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(), project_code text not null unique, name text not null,
  description text, client_id uuid references public.clients(id) on delete set null,
  enquiry_id uuid references public.enquiries(id) on delete set null,
  lead_division_id uuid references public.divisions(id) on delete set null,
  status public.project_state not null default 'proposed', location_label text,
  start_date date, target_end_date date, actual_end_date date,
  currency_code char(3) not null default 'NGN',
  client_fee numeric(14,2) not null default 0 check(client_fee>=0),
  budgeted_specialist_cost numeric(14,2) not null default 0 check(budgeted_specialist_cost>=0),
  notes text, created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_divisions (
  project_id uuid not null references public.projects(id) on delete cascade,
  division_id uuid not null references public.divisions(id) on delete restrict, scope_notes text,
  primary key(project_id,division_id)
);
create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, project_role text not null default 'collaborator',
  created_at timestamptz not null default now(), primary key(project_id,user_id)
);
create table public.project_partner_engagements (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  partner_id uuid not null references public.professional_partners(id) on delete restrict,
  scope_of_work text not null, agreed_fee numeric(14,2) not null check(agreed_fee>=0),
  currency_code char(3) not null default 'NGN', payment_terms text, status text not null default 'proposed',
  start_date date, due_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_milestones (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  title text not null, description text, due_date date, completed_at timestamptz,
  status text not null default 'pending', display_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_tasks (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.project_milestones(id) on delete set null, title text not null,
  description text, status text not null default 'todo', priority text not null default 'normal',
  assigned_user_id uuid references auth.users(id) on delete set null,
  assigned_partner_id uuid references public.professional_partners(id) on delete set null,
  due_date date, completed_at timestamptz, created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_documents (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  title text not null, document_type text, storage_path text not null, version_label text,
  uploaded_by uuid references auth.users(id) on delete set null, client_visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.quotations (
  id uuid primary key default gen_random_uuid(), quotation_number text not null unique,
  project_id uuid references public.projects(id) on delete set null, client_id uuid references public.clients(id) on delete set null,
  status public.document_state not null default 'draft', issue_date date, valid_until date,
  currency_code char(3) not null default 'NGN', subtotal numeric(14,2) not null default 0 check(subtotal>=0),
  discount_amount numeric(14,2) not null default 0 check(discount_amount>=0),
  tax_amount numeric(14,2) not null default 0 check(tax_amount>=0),
  total_amount numeric(14,2) not null default 0 check(total_amount>=0), terms text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quotation_items (
  id uuid primary key default gen_random_uuid(), quotation_id uuid not null references public.quotations(id) on delete cascade,
  description text not null, quantity numeric(12,3) not null default 1 check(quantity>0), unit text,
  unit_price numeric(14,2) not null default 0 check(unit_price>=0),
  line_total numeric(14,2) not null default 0 check(line_total>=0), display_order integer not null default 0
);
create table public.agreements (
  id uuid primary key default gen_random_uuid(), agreement_number text not null unique,
  project_id uuid references public.projects(id) on delete set null, client_id uuid references public.clients(id) on delete set null,
  agreement_type text not null default 'client_service', status public.document_state not null default 'draft',
  effective_date date, expiry_date date, storage_path text, terms_summary text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.invoices (
  id uuid primary key default gen_random_uuid(), invoice_number text not null unique,
  project_id uuid references public.projects(id) on delete set null, client_id uuid references public.clients(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  status public.invoice_state not null default 'draft', issue_date date, due_date date,
  currency_code char(3) not null default 'NGN', subtotal numeric(14,2) not null default 0 check(subtotal>=0),
  discount_amount numeric(14,2) not null default 0 check(discount_amount>=0),
  tax_amount numeric(14,2) not null default 0 check(tax_amount>=0),
  total_amount numeric(14,2) not null default 0 check(total_amount>=0), notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null, quantity numeric(12,3) not null default 1 check(quantity>0), unit text,
  unit_price numeric(14,2) not null default 0 check(unit_price>=0),
  line_total numeric(14,2) not null default 0 check(line_total>=0), display_order integer not null default 0
);
create table public.client_payments (
  id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices(id) on delete restrict,
  amount numeric(14,2) not null check(amount>0), currency_code char(3) not null default 'NGN',
  payment_date date, method text, transaction_reference text,
  status text not null default 'pending' check(status in ('pending','confirmed','failed','refunded')),
  recorded_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);
create table public.partner_payment_schedules (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.project_partner_engagements(id) on delete cascade,
  description text not null, amount numeric(14,2) not null check(amount>=0), due_date date,
  status public.payment_state not null default 'planned', paid_amount numeric(14,2) not null default 0 check(paid_amount>=0),
  paid_at timestamptz, payment_reference text, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), check(paid_amount<=amount)
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(), project_id uuid references public.projects(id) on delete set null,
  category text not null, description text not null, amount numeric(14,2) not null check(amount>=0),
  currency_code char(3) not null default 'NGN', expense_date date not null default current_date,
  paid_to text, receipt_path text, recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.project_financial_summary (
  project_id uuid primary key references public.projects(id) on delete cascade,
  client_fee numeric(14,2) not null default 0, specialist_cost numeric(14,2) not null default 0,
  other_direct_cost numeric(14,2) not null default 0,
  gross_project_margin numeric(14,2) generated always as (client_fee-specialist_cost-other_direct_cost) stored,
  updated_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id) on delete set null,
  action text not null, table_name text not null, record_id text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index enquiries_status_created_idx on public.enquiries(status,created_at desc);
create index projects_client_status_idx on public.projects(client_id,status);
create index tasks_project_due_idx on public.project_tasks(project_id,due_date);
create index invoices_client_status_idx on public.invoices(client_id,status);
create index expenses_project_date_idx on public.expenses(project_id,expense_date);

create or replace function public.can_access_project(target_id uuid) returns boolean
language sql stable security definer set search_path=public as $$
 select public.has_role(array['owner','administrator','operations','finance','content_manager']::public.app_role[])
 or exists(select 1 from public.project_members m where m.project_id=target_id and m.user_id=auth.uid())
 or exists(select 1 from public.projects p join public.client_contacts c on c.client_id=p.client_id
           where p.id=target_id and c.user_id=auth.uid())
 or exists(select 1 from public.project_partner_engagements e join public.partner_user_links l on l.partner_id=e.partner_id
           where e.project_id=target_id and l.user_id=auth.uid());
$$;

do $$ declare t text; begin
 foreach t in array array['profiles','divisions','services','site_pages','projects_public','insights','careers',
 'partnership_opportunities','product_initiatives','enquiries','clients','professional_partners','projects',
 'project_partner_engagements','project_milestones','project_tasks','quotations','agreements','invoices','partner_payment_schedules']
 loop execute format('create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()',t,t); end loop;
end $$;

do $$ declare t text; begin
 foreach t in array array['profiles','user_roles','divisions','services','site_pages','media_assets','projects_public',
 'insights','careers','partnership_opportunities','product_initiatives','enquiries','enquiry_activity','clients',
 'client_contacts','professional_partners','partner_user_links','projects','project_divisions','project_members',
 'project_partner_engagements','project_milestones','project_tasks','project_documents','quotations','quotation_items',
 'agreements','invoices','invoice_items','client_payments','partner_payment_schedules','expenses','project_financial_summary','audit_logs']
 loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

-- Public content reads; privileged editorial writes.
create policy "public divisions" on public.divisions for select to anon,authenticated using(is_public);
create policy "editor divisions" on public.divisions for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));
create policy "public services" on public.services for select to anon,authenticated using(visibility='published');
create policy "editor services" on public.services for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));
create policy "public pages" on public.site_pages for select to anon,authenticated using(visibility='published');
create policy "editor pages" on public.site_pages for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));
create policy "public portfolio" on public.projects_public for select to anon,authenticated using(visibility='published' and approved_for_publication);
create policy "editor portfolio" on public.projects_public for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));
create policy "public media" on public.media_assets for select to anon,authenticated using(approved_for_publication);
create policy "editor media" on public.media_assets for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));
create policy "public insights" on public.insights for select to anon,authenticated using(visibility='published');
create policy "editor insights" on public.insights for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));
create policy "public careers" on public.careers for select to anon,authenticated using(visibility='published');
create policy "editor careers" on public.careers for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));
create policy "public opportunities" on public.partnership_opportunities for select to anon,authenticated using(visibility='published');
create policy "editor opportunities" on public.partnership_opportunities for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));
create policy "public product initiatives" on public.product_initiatives for select to anon,authenticated using(visibility='published');
create policy "editor product initiatives" on public.product_initiatives for all to authenticated
 using(public.has_role(array['owner','administrator','content_manager']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','content_manager']::public.app_role[]));

-- Public form can create a new enquiry only; all access thereafter is internal.
create policy "public enquiry intake" on public.enquiries for insert to anon,authenticated
 with check(status='new' and assigned_to is null);
create policy "internal enquiry access" on public.enquiries for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));
create policy "internal enquiry activity" on public.enquiry_activity for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));

create policy "own profile read" on public.profiles for select to authenticated
 using(id=auth.uid() or public.has_role(array['owner','administrator']::public.app_role[]));
create policy "own profile update" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "admin profile management" on public.profiles for all to authenticated
 using(public.has_role(array['owner','administrator']::public.app_role[]))
 with check(public.has_role(array['owner','administrator']::public.app_role[]));
create policy "admin role management" on public.user_roles for all to authenticated
 using(public.has_role(array['owner','administrator']::public.app_role[]))
 with check(public.has_role(array['owner','administrator']::public.app_role[]));

create policy "internal clients" on public.clients for all to authenticated
 using(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]));
create policy "client own organisation" on public.clients for select to authenticated
 using(exists(select 1 from public.client_contacts c where c.client_id=clients.id and c.user_id=auth.uid()));
create policy "internal contacts" on public.client_contacts for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));
create policy "client own contact" on public.client_contacts for select to authenticated using(user_id=auth.uid());
create policy "internal partners" on public.professional_partners for all to authenticated
 using(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]));
create policy "partner own record" on public.professional_partners for select to authenticated
 using(exists(select 1 from public.partner_user_links l where l.partner_id=id and l.user_id=auth.uid()));
create policy "internal partner links" on public.partner_user_links for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));
create policy "partner own link" on public.partner_user_links for select to authenticated using(user_id=auth.uid());

create policy "project scoped read" on public.projects for select to authenticated using(public.can_access_project(id));
create policy "internal project writes" on public.projects for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));
create policy "project divisions read" on public.project_divisions for select to authenticated using(public.can_access_project(project_id));
create policy "project divisions write" on public.project_divisions for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));
create policy "project members read" on public.project_members for select to authenticated using(public.can_access_project(project_id));
create policy "project members write" on public.project_members for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));
create policy "project engagements read" on public.project_partner_engagements for select to authenticated using(public.can_access_project(project_id));
create policy "project engagements write" on public.project_partner_engagements for all to authenticated
 using(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]));
create policy "milestones scoped read" on public.project_milestones for select to authenticated using(public.can_access_project(project_id));
create policy "milestones internal write" on public.project_milestones for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));
create policy "tasks scoped read" on public.project_tasks for select to authenticated using(public.can_access_project(project_id));
create policy "tasks internal write" on public.project_tasks for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));
create policy "project document read" on public.project_documents for select to authenticated
 using((client_visible and public.can_access_project(project_id))
 or public.has_role(array['owner','administrator','operations','finance']::public.app_role[]));
create policy "project document write" on public.project_documents for all to authenticated
 using(public.has_role(array['owner','administrator','operations']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations']::public.app_role[]));

-- Client commercial records are visible only after issue; finance writes are internal.
create policy "internal quotations" on public.quotations for all to authenticated
 using(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]));
create policy "client issued quotations" on public.quotations for select to authenticated
 using(status in ('issued','signed') and exists(select 1 from public.client_contacts c where c.client_id=quotations.client_id and c.user_id=auth.uid()));
create policy "internal quotation items" on public.quotation_items for all to authenticated
 using(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]));
create policy "client quotation items" on public.quotation_items for select to authenticated
 using(exists(select 1 from public.quotations q join public.client_contacts c on c.client_id=q.client_id
 where q.id=quotation_id and q.status in ('issued','signed') and c.user_id=auth.uid()));
create policy "internal agreements" on public.agreements for all to authenticated
 using(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','operations','finance']::public.app_role[]));
create policy "client issued agreements" on public.agreements for select to authenticated
 using(status in ('issued','signed') and exists(select 1 from public.client_contacts c where c.client_id=agreements.client_id and c.user_id=auth.uid()));
create policy "internal invoices" on public.invoices for all to authenticated
 using(public.has_role(array['owner','administrator','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','finance']::public.app_role[]));
create policy "client issued invoices" on public.invoices for select to authenticated
 using(status in ('issued','partially_paid','paid','overdue') and exists(select 1 from public.client_contacts c where c.client_id=invoices.client_id and c.user_id=auth.uid()));
create policy "internal invoice items" on public.invoice_items for all to authenticated
 using(public.has_role(array['owner','administrator','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','finance']::public.app_role[]));
create policy "client invoice items" on public.invoice_items for select to authenticated
 using(exists(select 1 from public.invoices i join public.client_contacts c on c.client_id=i.client_id
 where i.id=invoice_id and i.status in ('issued','partially_paid','paid','overdue') and c.user_id=auth.uid()));
create policy "internal client payments" on public.client_payments for all to authenticated
 using(public.has_role(array['owner','administrator','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','finance']::public.app_role[]));
create policy "client confirmed payments" on public.client_payments for select to authenticated
 using(status='confirmed' and exists(select 1 from public.invoices i join public.client_contacts c on c.client_id=i.client_id
 where i.id=invoice_id and c.user_id=auth.uid()));
create policy "internal partner payment schedules" on public.partner_payment_schedules for all to authenticated
 using(public.has_role(array['owner','administrator','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','finance']::public.app_role[]));
create policy "internal expenses" on public.expenses for all to authenticated
 using(public.has_role(array['owner','administrator','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','finance']::public.app_role[]));
create policy "internal financial summary" on public.project_financial_summary for all to authenticated
 using(public.has_role(array['owner','administrator','finance']::public.app_role[]))
 with check(public.has_role(array['owner','administrator','finance']::public.app_role[]));
create policy "admin audit read" on public.audit_logs for select to authenticated
 using(public.has_role(array['owner','administrator']::public.app_role[]));
create policy "internal audit insert" on public.audit_logs for insert to authenticated
 with check(actor_id=auth.uid() and public.has_role(array['owner','administrator','operations','finance']::public.app_role[]));

-- BABTEK's eight approved business divisions. These are structural company records,
-- not claims that each division currently has a staffed or standalone operation.
insert into public.divisions (slug,name,pillar,summary,lifecycle,display_order,is_public) values
 ('design-construction','Babtek Design & Construction','Built Environment','Architectural design, technical documentation and coordinated construction services.','developing',1,true),
 ('interiors','Babtek Interiors','Built Environment','Interior architecture, space planning, finishes and fit-out services.','developing',2,true),
 ('real-estate','Babtek Real Estate','Built Environment','Property, land and real-estate advisory and transaction coordination.','developing',3,true),
 ('smart-solutions','Babtek Smart Solutions','Technology & Innovation','Software, automation and digital systems for business and the built environment.','developing',4,true),
 ('academy','Babtek Academy','Technology & Innovation','Technical learning and professional development initiatives.','developing',5,true),
 ('ventures','Babtek Ventures','Business & Enterprise Development','Strategic ventures, partnerships, incubation and business development.','developing',6,true),
 ('products-supply','Babtek Products & Supply','Built Environment','Sourcing and supply coordination for building products, materials and equipment.','developing',7,true),
 ('research-innovation','Babtek Research & Innovation','Technology & Innovation','Research into sustainable systems, smart buildings and applied innovation.','developing',8,true)
on conflict (slug) do nothing;

-- Grant the first owner role only after verifying the founder's Auth UUID in a trusted SQL session.
