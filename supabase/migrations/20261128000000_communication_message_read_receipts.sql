-- Per-user, scoped read receipts for BABTEK project conversations.
-- Access is granted only to authenticated, non-anonymous users. RLS on the
-- source message table determines which incoming messages each user may mark.
create table if not exists public.communication_message_reads (
  message_id uuid not null references public.communication_messages(id) on delete cascade,
  reader_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, reader_id)
);

create index if not exists communication_message_reads_reader_idx
  on public.communication_message_reads(reader_id, message_id);

alter table public.communication_message_reads enable row level security;

revoke all on public.communication_message_reads from anon, authenticated;
grant select, insert on public.communication_message_reads to authenticated;

create policy "Users read their own message receipts"
on public.communication_message_reads
for select to authenticated
using ((select auth.uid()) = reader_id);

create policy "Users mark accessible incoming messages as read"
on public.communication_message_reads
for insert to authenticated
with check (
  (select auth.uid()) = reader_id
  and exists (
    select 1
    from public.communication_messages m
    where m.id = communication_message_reads.message_id
      and m.sender_id <> (select auth.uid())
  )
);
