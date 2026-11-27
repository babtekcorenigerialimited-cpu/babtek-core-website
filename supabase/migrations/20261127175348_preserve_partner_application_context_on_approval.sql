
create or replace function public.approve_partner_network_application(p_application_id uuid,p_review_note text default null)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_application public.partner_network_applications%rowtype; v_partner_id uuid;
begin
  if auth.uid() is null or not public.has_role(array['owner']::public.app_role[]) then raise exception 'Only the BABTEK owner can approve partner applications'; end if;
  select * into v_application from public.partner_network_applications where id=p_application_id for update;
  if not found then raise exception 'Application not found'; end if;
  if v_application.status not in ('pending','under_review','more_information_required') then raise exception 'Application is no longer awaiting approval'; end if;
  insert into public.professional_partners(legal_name,trading_name,email,phone,professional_category,partner_type,specialties,division_affiliations,website,notes,relationship_status,created_by)
  values(
    coalesce(nullif(v_application.organisation,''),v_application.applicant_name),nullif(v_application.organisation,''),lower(trim(v_application.email)),nullif(v_application.phone,''),
    v_application.primary_category,v_application.partner_type,v_application.specialties,v_application.division_affiliations,nullif(v_application.website,''),
    left('Application contact: '||v_application.applicant_name||E'\nExperience: '||v_application.experience_summary||E'\nCollaboration interest: '||v_application.collaboration_interest||E'\nApplication reference: '||v_application.reference_code,4000),
    'active',auth.uid()
  ) returning id into v_partner_id;
  update public.partner_network_applications set status='approved',partner_id=v_partner_id,review_note=nullif(left(coalesce(p_review_note,''),2000),''),reviewed_by=auth.uid(),reviewed_at=now() where id=p_application_id;
  perform public.link_verified_partner_account((select id from auth.users where lower(trim(email))=lower(trim(v_application.email)) and email_confirmed_at is not null order by created_at desc limit 1));
  insert into public.audit_logs(actor_id,action,table_name,record_id,metadata) values(auth.uid(),'partner_application.approved','partner_network_applications',p_application_id::text,jsonb_build_object('reference_code',v_application.reference_code,'partner_id',v_partner_id));
  return v_partner_id;
end;
$$;
revoke all on function public.approve_partner_network_application(uuid,text) from public, anon;
grant execute on function public.approve_partner_network_application(uuid,text) to authenticated;
