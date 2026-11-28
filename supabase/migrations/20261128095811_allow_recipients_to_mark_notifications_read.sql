-- Recipients may update only the read timestamp on their own notifications.
-- RLS policies continue to enforce recipient ownership; no other notification fields are writable.
grant update (read_at) on table public.user_notifications to authenticated;
