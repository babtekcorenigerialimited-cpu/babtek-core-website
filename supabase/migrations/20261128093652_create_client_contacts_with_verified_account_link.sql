create or replace function public.create_client_contact_owner_verified(
 p_client_id uuid,
 p_full_name text,
 p_email text,
 p_phone text default null,
 p_user_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
 v_email text := lower(btrim(coalesce(p_email,'')));
 v_account_email text;
 v_confirmed_at timestamptz;
 v_contact_id uuid;
begin
 if auth.uid() is null or not public.has_role(array['owner']::public.app_role) then
   raise exception 'Only the BABTEK owner can create client contacts';
 end if;
 if p_full_name is null or char_length(btrim(p_full_name)) < 2 or char_length(btrim(p_full_name)) > 160
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
   raise exception 'A valid contact name and email are required';
 end if;
 if not exists(select 1 from public.clients c where c.id=p_client_id) then
   raise exception 'Client organisation was not found';
 end if;
 if p_user_id is not null then
   select lower(btrim(u.email)),u.email_confirmed_at
   into v_account_email,v_confirmed_at
   from auth.users u where u.id=p_user_id;
   if v_account_email is null or v_confirmed_at is null then
     raise exception 'Client account email must be verified before linking';
   end if;
   if v_account_email <> v_email then
     raise exception 'Verified account email does not match the contact email';
   end if;
   if not exists(select 1 from public.user_roles r where r.user_id=p_user_id and r.role='client'::public.app_role) then
     raise exception 'Selected account is not registered as a client';
   end if;
   if exists(select 1 from public.client_contacts c where c.user_id=p_user_id) then
     raise exception 'This account is already linked to a client contact';
   end if;
 end if;
 insert into public.client_contacts(client_id,full_name,email,phone,user_id,is_primary)
 values(p_client_id,btrim(p_full_name),v_email,nullif(btrim(coalesce(p_phone,'')),''),p_user_id,false)
 returning id into v_contact_id;
 return v_contact_id;
end;
$$;
revoke all on function public.create_client_contact_owner_verified(uuid,text,text,text,uuid) from public,anon;
grant execute on function public.create_client_contact_owner_verified(uuid,text,text,text,uuid) to authenticated;
