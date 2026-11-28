create or replace function public.handle_new_client_account()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  -- Signup metadata is user-editable and must never grant an authorization role.
  -- Client signups receive the client role; partner signups receive no role here.
  -- An approved, active partner is granted the partner role only by the
  -- verified-email linking function after the account email is confirmed.
  if coalesce(new.raw_user_meta_data ->> 'account_type', 'client') <> 'partner' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'client'::public.app_role)
    on conflict (user_id, role) do nothing;
  end if;

  -- Handles a previously approved partner only when the email is already verified.
  perform public.link_verified_partner_account(new.id);
  return new;
end;
$$;

revoke all on function public.handle_new_client_account() from public, anon, authenticated;
