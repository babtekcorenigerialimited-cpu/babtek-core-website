-- Unified, per-account notification inbox. Database triggers emit notifications
-- from existing operational events; recipients can only read/update their own rows.
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null unique,
  event_type text not null,
  title text not null,
  body text not null,
  href text not null default '/notifications',
  entity_id uuid,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists user_notifications_recipient_created_idx on public.user_notifications(recipient_id,created_at desc);
create index if not exists user_notifications_unread_idx on public.user_notifications(recipient_id,created_at desc) where read_at is null;
alter table public.user_notifications enable row level security;
revoke all on public.user_notifications from anon,authenticated;
grant select on public.user_notifications to authenticated;
grant update(read_at) on public.user_notifications to authenticated;
create policy "Users read their own notifications" on public.user_notifications for select to authenticated
using ((select auth.uid())=recipient_id and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)=false);
create policy "Users update their own notification read state" on public.user_notifications for update to authenticated
using ((select auth.uid())=recipient_id and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)=false)
with check ((select auth.uid())=recipient_id and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)=false);

create or replace function public.create_babtek_notification(p_recipient uuid,p_key text,p_type text,p_title text,p_body text,p_href text,p_entity uuid)
returns void language sql security definer set search_path=pg_catalog,public as $$
 insert into public.user_notifications(recipient_id,event_key,event_type,title,body,href,entity_id)
 values(p_recipient,p_key,p_type,p_title,left(p_body,500),p_href,p_entity) on conflict(event_key) do nothing;
$$;
revoke all on function public.create_babtek_notification(uuid,text,text,text,text,text,uuid) from public,anon,authenticated;

create or replace function public.route_babtek_notifications() returns trigger
language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare v_project uuid; v_client uuid; v_partner uuid; v_label text; v_key text; v_title text; v_body text; v_href text;
begin
 if tg_table_name='communication_messages' then
  if new.message_type='client_reply' and new.project_id is not null then
   select p.client_id,coalesce(p.project_code,p.name,'Project') into v_client,v_label from public.projects p where p.id=new.project_id;
   if exists(select 1 from public.client_contacts c where c.client_id=v_client and c.user_id=new.sender_id) then
    insert into public.user_notifications(recipient_id,event_key,event_type,title,body,href,entity_id)
    select distinct r.user_id,'message:'||new.id||':staff:'||r.user_id,'message','New client project message',
      coalesce(v_label,'Project')||' has a new message from a client.','/admin/communications',new.id
    from public.user_roles r where r.role::text in('owner','administrator','operations');
   else
    insert into public.user_notifications(recipient_id,event_key,event_type,title,body,href,entity_id)
    select distinct c.user_id,'message:'||new.id||':client:'||c.user_id,'message','New BABTEK project reply',
      coalesce(v_label,'Your project')||' has a new message from the BABTEK team.','/client',new.id
    from public.client_contacts c where c.client_id=v_client and c.user_id is not null and c.user_id<>new.sender_id;
   end if;
  elsif new.message_type='partner_update' and new.partner_engagement_id is not null then
   select e.project_id,e.partner_id,coalesce(p.project_code,p.name,'Project') into v_project,v_partner,v_label
   from public.project_partner_engagements e join public.projects p on p.id=e.project_id where e.id=new.partner_engagement_id;
   if exists(select 1 from public.partner_user_links l where l.partner_id=v_partner and l.user_id=new.sender_id) then
    insert into public.user_notifications(recipient_id,event_key,event_type,title,body,href,entity_id)
    select distinct r.user_id,'message:'||new.id||':staff:'||r.user_id,'message','New partner project update',
      coalesce(v_label,'Project')||' has a new message from an assigned professional.','/admin/communications',new.id
    from public.user_roles r where r.role::text in('owner','administrator','operations');
   else
    insert into public.user_notifications(recipient_id,event_key,event_type,title,body,href,entity_id)
    select distinct l.user_id,'message:'||new.id||':partner:'||l.user_id,'message','New BABTEK engagement reply',
      coalesce(v_label,'Your engagement')||' has a new message from the BABTEK team.','/partner',new.id
    from public.partner_user_links l where l.partner_id=v_partner and l.user_id<>new.sender_id;
   end if;
  end if;
  return new;
 end if;
 if tg_table_name='project_file_submissions' then
  if tg_op='INSERT' then
   insert into public.user_notifications(recipient_id,event_key,event_type,title,body,href,entity_id)
   select distinct r.user_id,'file:'||new.id||':received:'||r.user_id,'file','New project file submission',
     new.title||' was submitted for review.','/admin/file-submissions',new.id
   from public.user_roles r where r.role::text in('owner','administrator','operations');
  elsif new.review_status is distinct from old.review_status then
   perform public.create_babtek_notification(new.uploader_id,'file:'||new.id||':review:'||new.review_status,'file',
    'Your file submission was reviewed',new.title||' is now marked '||replace(new.review_status,'_',' ')||
    coalesce(': '||nullif(new.review_note,''),'')||'.',case when new.uploader_kind='partner' then '/partner' else '/client' end,new.id);
  end if;
  return new;
 end if;
 if tg_table_name='project_milestones' then
  if tg_op='UPDATE' and new.client_visible and (new.status is distinct from old.status or new.progress_percent is distinct from old.progress_percent or new.acceptance_status is distinct from old.acceptance_status) then
   select coalesce(p.project_code,p.name,'Project') into v_label from public.projects p where p.id=new.project_id;
   v_key:='milestone:'||new.id||':'||new.updated_at;
   v_body:='Milestone "'||new.title||'" is now '||replace(new.status,'_',' ')||' ('||new.progress_percent||'% complete).';
   insert into public.user_notifications(recipient_id,event_key,event_type,title,body,href,entity_id)
   select distinct c.user_id,v_key||':'||c.user_id,'milestone','Project milestone updated',
    coalesce(v_label,'Your project')||': '||v_body,'/client',new.id
   from public.projects p join public.client_contacts c on c.client_id=p.client_id
   where p.id=new.project_id and c.user_id is not null and c.user_id is distinct from new.updated_by;
  end if;
  return new;
 end if;
 if tg_table_name in('quotations','invoices') then
  if tg_op='INSERT' or new.status is distinct from old.status then
   if tg_table_name='quotations' then v_label:=new.quotation_number; v_title:=case when tg_op='INSERT' then 'New quotation available' else 'Quotation status updated' end;
   else v_label:=new.invoice_number; v_title:=case when tg_op='INSERT' then 'New invoice available' else 'Invoice status updated' end; end if;
   v_key:=tg_table_name||':'||new.id||':'||new.status::text;
   v_body:=coalesce(v_label,'Commercial record')||' is now '||replace(new.status::text,'_',' ')||'.';
   insert into public.user_notifications(recipient_id,event_key,event_type,title,body,href,entity_id)
   select distinct c.user_id,v_key||':'||c.user_id,'commercial',v_title,v_body,'/client',new.id
   from public.client_contacts c where c.client_id=new.client_id and c.user_id is not null;
  end if;
  return new;
 end if;
 if tg_table_name='project_tasks' then
  if tg_op='INSERT' or new.assigned_user_id is distinct from old.assigned_user_id or new.assigned_partner_id is distinct from old.assigned_partner_id or new.status is distinct from old.status then
   v_key:='task:'||new.id||':'||new.updated_at;
   if new.assigned_user_id is not null and new.assigned_user_id is distinct from new.created_by then
    perform public.create_babtek_notification(new.assigned_user_id,v_key||':user','task','Task assignment or update','Task "'||new.title||'" has been assigned or updated.','/admin/projects',new.id);
   end if;
   if new.assigned_partner_id is not null then
    perform public.create_babtek_notification(l.user_id,v_key||':partner:'||l.user_id,'task','Partner task assignment or update','Task "'||new.title||'" has been assigned or updated.','/partner',new.id)
    from public.partner_user_links l where l.partner_id=new.assigned_partner_id;
   end if;
  end if;
  return new;
 end if;
 if tg_table_name='partner_payment_schedules' then
  if tg_op='INSERT' or new.status is distinct from old.status or new.paid_amount is distinct from old.paid_amount then
   select e.partner_id into v_partner from public.project_partner_engagements e where e.id=new.engagement_id;
   v_key:='partner-payment:'||new.id||':'||new.updated_at;
   perform public.create_babtek_notification(l.user_id,v_key||':'||l.user_id,'payment','Partner payment schedule updated',
    new.description||' has a payment status update.','/partner',new.id) from public.partner_user_links l where l.partner_id=v_partner;
  end if;
  return new;
 end if;
 return new;
end;
$$;
revoke all on function public.route_babtek_notifications() from public,anon,authenticated;

drop trigger if exists babtek_notify_communication_messages on public.communication_messages;
create trigger babtek_notify_communication_messages after insert on public.communication_messages for each row execute function public.route_babtek_notifications();
drop trigger if exists babtek_notify_file_submissions on public.project_file_submissions;
create trigger babtek_notify_file_submissions after insert or update of review_status on public.project_file_submissions for each row execute function public.route_babtek_notifications();
drop trigger if exists babtek_notify_milestones on public.project_milestones;
create trigger babtek_notify_milestones after update on public.project_milestones for each row execute function public.route_babtek_notifications();
drop trigger if exists babtek_notify_quotations on public.quotations;
create trigger babtek_notify_quotations after insert or update of status on public.quotations for each row execute function public.route_babtek_notifications();
drop trigger if exists babtek_notify_invoices on public.invoices;
create trigger babtek_notify_invoices after insert or update of status on public.invoices for each row execute function public.route_babtek_notifications();
drop trigger if exists babtek_notify_project_tasks on public.project_tasks;
create trigger babtek_notify_project_tasks after insert or update on public.project_tasks for each row execute function public.route_babtek_notifications();
drop trigger if exists babtek_notify_partner_payment_schedules on public.partner_payment_schedules;
create trigger babtek_notify_partner_payment_schedules after insert or update on public.partner_payment_schedules for each row execute function public.route_babtek_notifications();
