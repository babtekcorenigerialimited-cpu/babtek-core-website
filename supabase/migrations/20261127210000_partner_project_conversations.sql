
drop policy if exists "Partners read own project conversation messages" on public.communication_messages;
create policy "Partners read own project conversation messages"
on public.communication_messages for select to authenticated
using (
  message_type='partner_update'
  and project_id is not null
  and exists (
    select 1 from public.project_partner_engagements e
    join public.partner_user_links l on l.partner_id=e.partner_id
    where e.project_id=communication_messages.project_id
      and l.user_id=auth.uid()
  )
);
drop policy if exists "Partners send own project conversation messages" on public.communication_messages;
create policy "Partners send own project conversation messages"
on public.communication_messages for insert to authenticated
with check (
  sender_id=auth.uid()
  and message_type='partner_update'
  and project_id is not null
  and exists (
    select 1 from public.project_partner_engagements e
    join public.partner_user_links l on l.partner_id=e.partner_id
    where e.project_id=communication_messages.project_id
      and l.user_id=auth.uid()
  )
);
