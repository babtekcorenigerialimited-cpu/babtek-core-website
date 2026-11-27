-- Prevent anonymous Auth sessions from using message read receipts.
drop policy if exists "Users read their own message receipts" on public.communication_message_reads;
create policy "Users read their own message receipts"
on public.communication_message_reads
for select to authenticated
using (
  (select auth.uid()) = reader_id
  and not coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false)
);

drop policy if exists "Users mark accessible incoming messages as read" on public.communication_message_reads;
create policy "Users mark accessible incoming messages as read"
on public.communication_message_reads
for insert to authenticated
with check (
  (select auth.uid()) = reader_id
  and not coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false)
  and exists (
    select 1
    from public.communication_messages m
    where m.id = communication_message_reads.message_id
      and m.sender_id <> (select auth.uid())
  )
);
