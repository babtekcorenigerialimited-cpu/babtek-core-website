
create or replace function public.create_partner_payment_schedule(
 p_engagement_id uuid,
 p_description text,
 p_amount numeric,
 p_due_date date default null
) returns uuid
language plpgsql
security definer
set search_path=pg_catalog,public
as $$
declare
 v_engagement public.project_partner_engagements%rowtype;
 v_scheduled numeric(14,2);
 v_schedule_id uuid;
begin
 if auth.uid() is null or not public.has_role(array['owner','administrator','finance']::public.app_role[]) then
  raise exception 'Not authorised to create partner payment schedules';
 end if;
 if p_engagement_id is null or length(trim(coalesce(p_description,'')))<3 or length(p_description)>300 or p_amount is null or p_amount<=0 then
  raise exception 'Invalid payment schedule details';
 end if;
 select * into v_engagement from public.project_partner_engagements where id=p_engagement_id for update;
 if not found or v_engagement.status='cancelled' then raise exception 'Partner engagement not found or cancelled'; end if;
 select coalesce(sum(amount),0) into v_scheduled from public.partner_payment_schedules where engagement_id=p_engagement_id and status<>'cancelled';
 if v_scheduled+round(p_amount,2)>v_engagement.agreed_fee then
  raise exception 'Payment stages exceed the agreed engagement fee';
 end if;
 insert into public.partner_payment_schedules(engagement_id,description,amount,due_date,status,paid_amount)
 values(p_engagement_id,trim(p_description),round(p_amount,2),p_due_date,'planned',0)
 returning id into v_schedule_id;
 insert into public.audit_logs(actor_id,action,table_name,record_id,metadata)
 values(auth.uid(),'partner_payment_schedule.created','partner_payment_schedules',v_schedule_id::text,
 jsonb_build_object('engagement_id',p_engagement_id,'amount',round(p_amount,2),'currency_code',v_engagement.currency_code));
 return v_schedule_id;
end;
$$;
revoke all on function public.create_partner_payment_schedule(uuid,text,numeric,date) from public,anon;
grant execute on function public.create_partner_payment_schedule(uuid,text,numeric,date) to authenticated;
