-- Run once in the Supabase SQL editor, or apply with the Supabase CLI.
create table public.cms_editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.cms_editors enable row level security;
create policy "Editors can check their membership" on public.cms_editors for select to authenticated using (user_id = (select auth.uid()));
create function public.is_cms_editor() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.cms_editors where user_id = (select auth.uid()));
$$;
revoke all on function public.is_cms_editor() from public;
grant execute on function public.is_cms_editor() to anon, authenticated;

create table public.article_drafts (
  id uuid primary key default gen_random_uuid(),
  document jsonb not null,
  slug text generated always as (document->>'slug') stored unique not null,
  revision integer not null default 1,
  published_revision integer,
  updated_at timestamptz not null default now(),
  constraint valid_slug check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
create table public.articles (
  id uuid primary key references public.article_drafts(id) on delete cascade,
  slug text not null unique,
  document jsonb not null,
  published_at timestamptz not null default now()
);
alter table public.article_drafts enable row level security;
alter table public.articles enable row level security;
create policy "Only editors read drafts" on public.article_drafts for select to authenticated using ((select public.is_cms_editor()));
create policy "Everyone can read published snapshots" on public.articles for select to anon, authenticated using (true);
-- All writes go through the atomic RPC. No direct writes from the browser.
revoke all on public.cms_editors, public.article_drafts, public.articles from anon, authenticated;
grant select on public.cms_editors, public.article_drafts to authenticated;
grant select on public.articles to anon, authenticated;

create function public.save_article(p_id uuid, p_document jsonb, p_revision integer, p_action text)
returns public.article_drafts language plpgsql security definer set search_path = '' as $$
declare current_row public.article_drafts; next_row public.article_drafts;
begin
  if not public.is_cms_editor() then raise exception 'Editor access required' using errcode = '42501'; end if;
  if p_action not in ('save','publish','unpublish') or p_revision < 0 then raise exception 'Invalid operation' using errcode = '22023'; end if;
  if jsonb_typeof(p_document) <> 'object' or coalesce(length(trim(p_document->>'title')),0) not between 1 and 200
    or coalesce(p_document->>'slug','') !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or length(p_document->>'slug') > 180 or octet_length(p_document::text) > 300000
    or jsonb_typeof(p_document->'body') is distinct from 'string'
    or jsonb_typeof(p_document->'products') is distinct from 'array'
    then raise exception 'Invalid article' using errcode = '22023'; end if;
  select * into current_row from public.article_drafts where id=p_id for update;
  if found then
    if current_row.revision <> p_revision then raise exception 'This article was changed in another tab. Reload before saving.' using errcode='40001'; end if;
    update public.article_drafts set document=p_document, revision=revision+1, updated_at=now() where id=p_id returning * into next_row;
  else
    if p_revision <> 0 then raise exception 'Article no longer exists' using errcode='40001'; end if;
    insert into public.article_drafts(id,document) values(p_id,p_document) returning * into next_row;
  end if;
  if p_action='publish' then
    if length(trim(p_document->>'body'))=0 then raise exception 'Write the article before publishing' using errcode='22023'; end if;
    insert into public.articles(id,slug,document) values(p_id,p_document->>'slug',p_document)
      on conflict(id) do update set slug=excluded.slug, document=excluded.document, published_at=now();
    update public.article_drafts set published_revision=revision where id=p_id returning * into next_row;
  elsif p_action='unpublish' then
    delete from public.articles where id=p_id;
    update public.article_drafts set published_revision=null where id=p_id returning * into next_row;
  end if;
  return next_row;
end; $$;
revoke all on function public.save_article(uuid,jsonb,integer,text) from public;
grant execute on function public.save_article(uuid,jsonb,integer,text) to authenticated;

-- Private photo storage. Public visitors can fetch only photos referenced by a
-- published snapshot; unpublished photos require an editor session.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('article-images','article-images',false,4194304,array['image/webp'])
on conflict(id) do nothing;
create policy "Editors upload article photos" on storage.objects for insert to authenticated
with check(bucket_id='article-images' and (select public.is_cms_editor()));
create policy "Read article photos" on storage.objects for select to anon, authenticated
using(bucket_id='article-images' and (
  (select public.is_cms_editor()) or exists(
    select 1 from public.articles where document->>'cover' = '/media/articles/' || name
      or strpos(coalesce(document->>'body',''), '/media/articles/' || name) > 0
  )
));
