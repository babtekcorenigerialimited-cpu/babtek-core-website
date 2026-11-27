-- Brand management centre: founder-controlled public identity settings and assets.
create table public.brand_settings (
 id boolean primary key default true check(id=true),
 company_name text not null default 'BABTEK CORE NIGERIA LIMITED',
 corporate_tagline text not null default 'Building a Better Future.',
 marketing_headline text not null default 'Building Ideas. Engineering Possibilities. Creating Value.',
 positioning_statement text not null default 'Building Nigeria’s Future with Precision & Integrity.',
 primary_color text not null default '#123B68' check(primary_color ~ '^#[0-9A-Fa-f]{6}$'),
 accent_color text not null default '#65B4F3' check(accent_color ~ '^#[0-9A-Fa-f]{6}$'),
 background_color text not null default '#FFFFFF' check(background_color ~ '^#[0-9A-Fa-f]{6}$'),
 text_color text not null default '#263442' check(text_color ~ '^#[0-9A-Fa-f]{6}$'),
 logo_light_path text, logo_dark_path text, favicon_path text,
 is_published boolean not null default false,
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.brand_settings enable row level security;
create policy "Public can read published brand settings" on public.brand_settings for select to anon,authenticated using(is_published=true);
create policy "Owners manage brand settings" on public.brand_settings for all to authenticated using(public.has_role(array['owner']::public.app_role[])) with check(public.has_role(array['owner']::public.app_role[]));
insert into public.brand_settings(id) values(true) on conflict(id) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('babtek-brand-assets','babtek-brand-assets',true,5242880,array['image/png','image/jpeg','image/webp','image/svg+xml','image/x-icon','image/vnd.microsoft.icon'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create policy "Public can view BABTEK brand assets" on storage.objects for select to anon,authenticated using(bucket_id='babtek-brand-assets');
create policy "Owners upload BABTEK brand assets" on storage.objects for insert to authenticated with check(bucket_id='babtek-brand-assets' and public.has_role(array['owner']::public.app_role[]));
create policy "Owners update BABTEK brand assets" on storage.objects for update to authenticated using(bucket_id='babtek-brand-assets' and public.has_role(array['owner']::public.app_role[])) with check(bucket_id='babtek-brand-assets' and public.has_role(array['owner']::public.app_role[]));
create policy "Owners delete BABTEK brand assets" on storage.objects for delete to authenticated using(bucket_id='babtek-brand-assets' and public.has_role(array['owner']::public.app_role[]));
