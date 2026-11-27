create or replace function public.link_partner_account_owner_verified(p_partner_id uuid,p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_partner public.professional_partners%rowtype;
  v_user_email text;
begin
  if auth.uid() is null or not public.has_role(array['owner']::public.app_role[]) then
    raise exception 'Only the BABTEK owner can link a partner account';
  end if;
  select * into v_partner from public.professional_partners where id=p_partner_id;
  if not found or v_partner.relationship_status<>'active' then
    raise exception 'Only an active partner relationship can be linked';
  end if;
  select lower(trim(email)) into v_user_email
  from auth.users where id=p_user_id and email_confirmed_at is not null;
  if v_user_email is null then raise exception 'Partner account email must be verified'; end if;
  if v_partner.email is not null and lower(trim(v_partner.email))<>v_user_email then
    raise exception 'Verified account email must match the partner relationship email';
  end if;
  insert into public.user_roles(user_id,role,granted_by)
  values(p_user_id,'partner'::public.app_role,auth.uid())
  on conflict(user_id,role) do nothing;
  insert into public.partner_user_links(partner_id,user_id)
  values(p_partner_id,p_user_id)
  on conflict(partner_id,user_id) do nothing;
  insert into public.audit_logs(actor_id,action,table_name,record_id,metadata)
  values(auth.uid(),'partner.account_linked','partner_user_links',p_partner_id::text,
    jsonb_build_object('partner_id',p_partner_id,'user_id',p_user_id));
end;
$$;
revoke all on function public.link_partner_account_owner_verified(uuid,uuid) from public, anon;
grant execute on function public.link_partner_account_owner_verified(uuid,uuid) to authenticated;
