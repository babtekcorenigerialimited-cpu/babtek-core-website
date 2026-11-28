create or replace function public.link_client_account_owner_verified(
 p_contact_id uuid,
 p_user_id uuid
) returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
 v_email text;
 v_confirmed_at timestamptz;
 v_contact_email text;
 v_existing_user uuid;
begin
 if auth.uid() is null or not public.has_role(array['owner']::public.app_role) then
   raise exception 'Only the BABTEK owner can link a client account';
 end if;

 select lower(btrim(u.email)), u.email_confirmed_at
 into v_email, v_confirmed_at
 from auth.users u
 where u.id = p_user_id;

 if v_email is null or v_confirmed_at is null then
   raise exception 'Client account email must be verified before linking';
 end if;

 if not exists (
   select 1 from public.user_roles r
   where r.user_id = p_user_id and r.role = 'client'::public.app_role
 ) then
   raise exception 'Selected account is not registered as a client';
 end if;

 select lower(btrim(c.email)), c.user_id
 into v_contact_email, v_existing_user
 from public.client_contacts c
 where c.id = p_contact_id
 for update;

 if v_contact_email is null then
   raise exception 'Client contact was not found';
 end if;

 if v_email <> v_contact_email then
   raise exception 'Verified account email does not match the client contact email';
 end if;

 if v_existing_user is not null and v_existing_user <> p_user_id then
   raise exception 'This client contact is already linked to another account';
 end if;

 if exists (
   select 1 from public.client_contacts c
   where c.user_id = p_user_id and c.id <> p_contact_id
 ) then
   raise exception 'This account is already linked to another client contact';
 end if;

 update public.client_contacts
 set user_id = p_user_id
 where id = p_contact_id;
end;
$$;

revoke all on function public.link_client_account_owner_verified(uuid,uuid) from public, anon;
grant execute on function public.link_client_account_owner_verified(uuid,uuid) to authenticated;
