create unique index if not exists client_contacts_user_id_unique
on public.client_contacts(user_id)
where user_id is not null;
