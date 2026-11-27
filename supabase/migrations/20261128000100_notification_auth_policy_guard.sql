-- Explicitly exclude anonymous Auth sessions from the private notification inbox.
drop policy if exists "Users read their own notifications" on public.user_notifications;
drop policy if exists "Users update their own notification read state" on public.user_notifications;
create policy "Users read their own notifications" on public.user_notifications for select to authenticated
using ((select auth.uid())=recipient_id and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)=false);
create policy "Users update their own notification read state" on public.user_notifications for update to authenticated
using ((select auth.uid())=recipient_id and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)=false)
with check ((select auth.uid())=recipient_id and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)=false);
