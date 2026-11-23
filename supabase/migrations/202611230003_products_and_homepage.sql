-- Products and homepage settings, editable from /admin.
-- Run once in the Supabase SQL editor, after 202611230002_delete_article.sql.

create table public.products (
  id text primary key
    check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(id) <= 80),
  name text not null check (length(trim(name)) between 1 and 200),
  brand text not null default '' check (length(brand) <= 120),
  price integer not null check (price between 0 and 1000000),
  photo text not null default '' check (length(photo) <= 1000),
  photo_alt text not null default '' check (length(photo_alt) <= 500),
  url text not null check (url ~* '^https?://' and length(url) <= 2000),
  updated_at timestamptz not null default now()
);

-- One row per page section; only the homepage for now.
create table public.site_settings (
  id text primary key check (id in ('homepage')),
  document jsonb not null check (jsonb_typeof(document) = 'object' and octet_length(document::text) < 50000),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.site_settings enable row level security;

create policy "Everyone reads products" on public.products
  for select to anon, authenticated using (true);
create policy "Editors change products" on public.products
  for all to authenticated
  using ((select public.is_cms_editor())) with check ((select public.is_cms_editor()));

create policy "Everyone reads site settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "Editors change site settings" on public.site_settings
  for all to authenticated
  using ((select public.is_cms_editor())) with check ((select public.is_cms_editor()));

revoke all on public.products, public.site_settings from anon, authenticated;
grant select on public.products, public.site_settings to anon, authenticated;
grant insert, update, delete on public.products, public.site_settings to authenticated;

-- Uploaded photos become public once a published article, a product or the
-- homepage uses them. Unused uploads stay private to editors.
drop policy "Read article photos" on storage.objects;
-- "objects.name" is the uploaded file's name; products also has a "name"
-- column, so the storage column must be qualified.
create policy "Read site photos" on storage.objects for select to anon, authenticated
using (bucket_id = 'article-images' and (
  (select public.is_cms_editor())
  or exists (
    select 1 from public.articles a
    where a.document->>'cover' = '/media/articles/' || objects.name
      or strpos(coalesce(a.document->>'body', ''), '/media/articles/' || objects.name) > 0
  )
  or exists (
    select 1 from public.products p where p.photo = '/media/articles/' || objects.name
  )
  or exists (
    select 1 from public.site_settings s
    where strpos(s.document::text, '/media/articles/' || objects.name) > 0
  )
));
