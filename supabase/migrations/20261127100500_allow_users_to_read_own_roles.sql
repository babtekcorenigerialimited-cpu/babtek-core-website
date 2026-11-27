create policy "users read own role assignments"
on public.user_roles for select to authenticated
using (user_id = auth.uid());