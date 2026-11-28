-- Prevent a verified account already linked to one partner record from
-- blocking partner approval or relationship activation for another record.
-- The unique user_id index remains the database-level one-account/one-partner guard.

create or replace function public.link_verified_partner_account(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_email text;
  v_match_count integer;
  v_partner_id uuid;
  v_existing_partner_id uuid;
  v_inserted integer := 0;
begin
  select lower(trim(email)) into v_email
  from auth.users
  where id=p_user_id and email_confirmed_at is not null;
  if v_email is null then return 0; end if;

  select count(*) into v_match_count
  from public.professional_partners
  where lower(trim(email))=v_email and relationship_status='active';
  if v_match_count <> 1 then return 0; end if;

  select id into v_partner_id
  from public.professional_partners
  where lower(trim(email))=v_email and relationship_status='active'
  limit 1;

  insert into public.partner_user_links(partner_id,user_id)
  values(v_partner_id,p_user_id)
  on conflict (user_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted=0 then
    select partner_id into v_existing_partner_id
    from public.partner_user_links
    where user_id=p_user_id;
    if v_existing_partner_id is distinct from v_partner_id then
      return 0;
    end if;
  end if;

  insert into public.user_roles(user_id,role)
  values(p_user_id,'partner'::public.app_role)
  on conflict(user_id,role) do nothing;
  return 1;
end;
$$;
revoke all on function public.link_verified_partner_account(uuid) from public, anon, authenticated;

create or replace function public.link_verified_partner_account(p_user_id uuid,p_partner_id uuid)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_email text;
  v_existing_partner_id uuid;
  v_inserted integer := 0;
begin
  select lower(trim(email)) into v_email
  from auth.users
  where id=p_user_id and email_confirmed_at is not null;
  if v_email is null or p_partner_id is null then return 0; end if;

  if not exists (
    select 1 from public.professional_partners
    where id=p_partner_id
      and lower(trim(email))=v_email
      and relationship_status='active'
  ) then return 0; end if;

  insert into public.partner_user_links(partner_id,user_id)
  values(p_partner_id,p_user_id)
  on conflict (user_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted=0 then
    select partner_id into v_existing_partner_id
    from public.partner_user_links
    where user_id=p_user_id;
    if v_existing_partner_id is distinct from p_partner_id then
      return 0;
    end if;
  end if;

  insert into public.user_roles(user_id,role)
  values(p_user_id,'partner'::public.app_role)
  on conflict(user_id,role) do nothing;
  return 1;
end;
$$;
revoke all on function public.link_verified_partner_account(uuid,uuid) from public, anon, authenticated;

create or replace function public.link_partner_account_owner_verified(p_partner_id uuid,p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_partner public.professional_partners%rowtype;
  v_user_email text;
  v_existing_partner_id uuid;
  v_inserted integer := 0;
begin
  if auth.uid() is null or not public.has_role(array['owner']::public.app_role[]) then
    raise exception 'Only the BABTEK owner can link a partner account';
  end if;

  select * into v_partner
  from public.professional_partners
  where id=p_partner_id;
  if not found or v_partner.relationship_status<>'active' then
    raise exception 'Only an active partner relationship can be linked';
  end if;

  select lower(trim(email)) into v_user_email
  from auth.users
  where id=p_user_id and email_confirmed_at is not null;
  if v_user_email is null then
    raise exception 'Partner account email must be verified';
  end if;
  if v_partner.email is null or lower(trim(v_partner.email))<>v_user_email then
    raise exception 'Verified account email must match the partner relationship email';
  end if;

  insert into public.partner_user_links(partner_id,user_id)
  values(p_partner_id,p_user_id)
  on conflict (user_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted=0 then
    select partner_id into v_existing_partner_id
    from public.partner_user_links
    where user_id=p_user_id;
    if v_existing_partner_id is distinct from p_partner_id then
      raise exception 'This account is already linked to a different BABTEK partner record';
    end if;
  end if;

  insert into public.user_roles(user_id,role,granted_by)
  values(p_user_id,'partner'::public.app_role,auth.uid())
  on conflict(user_id,role) do nothing;

  insert into public.audit_logs(actor_id,action,table_name,record_id,metadata)
  values(auth.uid(),'partner.account_linked','partner_user_links',p_partner_id::text,
    jsonb_build_object('partner_id',p_partner_id,'user_id',p_user_id));
end;
$$;
revoke all on function public.link_partner_account_owner_verified(uuid,uuid) from public, anon;
grant execute on function public.link_partner_account_owner_verified(uuid,uuid) to authenticated;
