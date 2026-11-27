create or replace function public.update_partner_relationship_status(
  p_partner_id uuid,
  p_status text,
  p_notes text default null
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_partner public.professional_partners%rowtype;
  v_user_id uuid;
  v_revoked integer := 0;
begin
  if auth.uid() is null or not public.has_role(array['owner']::public.app_role[]) then
    raise exception 'Only the BABTEK owner can change partner relationship status';
  end if;
  if p_status not in ('prospect','active','paused','inactive','blacklisted') then
    raise exception 'Invalid partner relationship status';
  end if;

  update public.professional_partners
  set relationship_status=p_status,
      notes=nullif(left(coalesce(p_notes,''),2000),''),
      updated_at=now()
  where id=p_partner_id
  returning * into v_partner;
  if not found then raise exception 'Partner relationship not found'; end if;

  if p_status in ('prospect','inactive','blacklisted') then
    delete from public.partner_user_links where partner_id=p_partner_id;
    get diagnostics v_revoked = row_count;
  elsif p_status='active' then
    select id into v_user_id from auth.users
    where lower(trim(email))=lower(trim(v_partner.email))
      and email_confirmed_at is not null
    order by created_at desc limit 1;
    if v_user_id is not null then
      perform public.link_verified_partner_account(v_user_id);
    end if;
  end if;

  insert into public.audit_logs(actor_id,action,table_name,record_id,metadata)
  values(auth.uid(),'partner.relationship_status_changed','professional_partners',p_partner_id::text,
    jsonb_build_object('status',p_status,'portal_links_revoked',v_revoked));
  return v_revoked;
end;
$$;
revoke all on function public.update_partner_relationship_status(uuid,text,text) from public, anon;
grant execute on function public.update_partner_relationship_status(uuid,text,text) to authenticated;
