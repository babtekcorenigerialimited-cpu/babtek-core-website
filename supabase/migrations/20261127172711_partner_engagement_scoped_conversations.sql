-- Isolate partner discussions to a specific engagement, not merely a shared project.
alter table public.communication_messages
  add column if not exists partner_engagement_id uuid
  references public.project_partner_engagements(id) on delete cascade;

create index if not exists communication_messages_partner_engagement_created_idx
  on public.communication_messages(partner_engagement_id, created_at desc)
  where partner_engagement_id is not null;

alter table public.communication_messages
  drop constraint if exists communication_messages_partner_engagement_required;

-- NOT VALID preserves legacy messages while enforcing engagement linkage for new partner messages.
alter table public.communication_messages
  add constraint communication_messages_partner_engagement_required
  check (message_type <> 'partner_update' or partner_engagement_id is not null) not valid;

drop policy if exists "Partners read own project conversation messages" on public.communication_messages;
drop policy if exists "Partners send own project conversation messages" on public.communication_messages;

create policy "Partners read own engagement conversation messages"
on public.communication_messages for select to authenticated
using (
  message_type = 'partner_update'
  and partner_engagement_id is not null
  and exists (
    select 1
    from public.project_partner_engagements e
    join public.partner_user_links l on l.partner_id = e.partner_id
    where e.id = communication_messages.partner_engagement_id
      and e.project_id = communication_messages.project_id
      and l.user_id = auth.uid()
  )
);

create policy "Partners send own engagement conversation messages"
on public.communication_messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and message_type = 'partner_update'
  and partner_engagement_id is not null
  and exists (
    select 1
    from public.project_partner_engagements e
    join public.partner_user_links l on l.partner_id = e.partner_id
    where e.id = communication_messages.partner_engagement_id
      and e.project_id = communication_messages.project_id
      and l.user_id = auth.uid()
  )
);
