create or replace function public.handle_new_client_account()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  assigned_role public.app_role;
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  assigned_role := case
    when new.raw_user_meta_data ->> 'account_type' = 'partner' then 'partner'::public.app_role
    else 'client'::public.app_role
  end;

  insert into public.user_roles (user_id, role)
  values (new.id, assigned_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_client_account() from public, anon, authenticated;
