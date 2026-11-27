
create table if not exists public.partner_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.partner_payment_schedules(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  currency_code char(3) not null default 'NGN',
  payment_date date not null,
  method text not null check (char_length(method) between 2 and 80),
  transaction_reference text not null check (char_length(transaction_reference) between 2 and 160),
  evidence_path text,
  notes text,
  recorded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index if not exists partner_payment_transactions_schedule_date_idx on public.partner_payment_transactions(schedule_id,payment_date desc);
alter table public.partner_payment_transactions enable row level security;
drop policy if exists "Finance staff read partner payment transactions" on public.partner_payment_transactions;
create policy "Finance staff read partner payment transactions" on public.partner_payment_transactions for select to authenticated using (public.has_role(array['owner','administrator','finance']::public.app_role[]));
drop policy if exists "Partners read own payment transactions" on public.partner_payment_transactions;
create policy "Partners read own payment transactions" on public.partner_payment_transactions for select to authenticated using (
 exists(select 1 from public.partner_payment_schedules s join public.project_partner_engagements e on e.id=s.engagement_id join public.partner_user_links l on l.partner_id=e.partner_id where s.id=partner_payment_transactions.schedule_id and l.user_id=auth.uid())
);
create or replace function public.record_partner_payment(p_schedule_id uuid,p_amount numeric,p_payment_date date,p_method text,p_reference text,p_evidence_path text default null,p_notes text default null)
returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_schedule public.partner_payment_schedules%rowtype; v_engagement public.project_partner_engagements%rowtype; v_transaction_id uuid; v_new_paid numeric(14,2);
begin
 if auth.uid() is null or not public.has_role(array['owner','administrator','finance']::public.app_role[]) then raise exception 'Not authorised to record partner payments'; end if;
 if p_schedule_id is null or p_amount is null or p_amount<=0 or p_payment_date is null or length(trim(coalesce(p_method,'')))<2 or length(p_method)>80 or length(trim(coalesce(p_reference,'')))<2 or length(p_reference)>160 or (p_notes is not null and length(p_notes)>2000) or (p_evidence_path is not null and length(p_evidence_path)>500) then raise exception 'Invalid partner payment details'; end if;
 select * into v_schedule from public.partner_payment_schedules where id=p_schedule_id for update;
 if not found or v_schedule.status='cancelled' then raise exception 'Payment schedule not found or cancelled'; end if;
 select * into v_engagement from public.project_partner_engagements where id=v_schedule.engagement_id;
 if not found then raise exception 'Partner engagement not found'; end if;
 if p_amount>v_schedule.amount-v_schedule.paid_amount then raise exception 'Payment exceeds the remaining schedule balance'; end if;
 v_new_paid:=round(v_schedule.paid_amount+p_amount,2);
 insert into public.partner_payment_transactions(schedule_id,amount,currency_code,payment_date,method,transaction_reference,evidence_path,notes,recorded_by)
 values(p_schedule_id,round(p_amount,2),v_engagement.currency_code,p_payment_date,trim(p_method),trim(p_reference),nullif(trim(coalesce(p_evidence_path,'')),''),nullif(trim(coalesce(p_notes,'')),''),auth.uid()) returning id into v_transaction_id;
 update public.partner_payment_schedules set paid_amount=v_new_paid,status=case when v_new_paid>=amount then 'paid'::public.payment_state when v_new_paid>0 then 'partially_paid'::public.payment_state else 'due'::public.payment_state end,paid_at=case when v_new_paid>=amount then now() else null end,payment_reference=trim(p_reference),updated_at=now() where id=p_schedule_id;
 insert into public.audit_logs(actor_id,action,table_name,record_id,metadata) values(auth.uid(),'partner_payment.recorded','partner_payment_transactions',v_transaction_id::text,jsonb_build_object('schedule_id',p_schedule_id,'amount',round(p_amount,2),'currency_code',v_engagement.currency_code,'reference',trim(p_reference)));
 return v_transaction_id;
end; $$;
revoke all on function public.record_partner_payment(uuid,numeric,date,text,text,text,text) from public,anon;
grant execute on function public.record_partner_payment(uuid,numeric,date,text,text,text,text) to authenticated;
