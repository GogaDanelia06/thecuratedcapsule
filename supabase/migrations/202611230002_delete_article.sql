-- Lets editors delete an article (its draft and, if published, its public copy).
-- Run once in the Supabase SQL editor, after 202611230001_article_cms.sql.
create function public.delete_article(p_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare was_published boolean;
begin
  if not public.is_cms_editor() then
    raise exception 'Editor access required' using errcode = '42501';
  end if;
  select published_revision is not null into was_published
  from public.article_drafts where id = p_id for update;
  if not found then
    raise exception 'Article no longer exists' using errcode = 'P0002';
  end if;
  -- public.articles references the draft with "on delete cascade".
  delete from public.article_drafts where id = p_id;
  return was_published;
end; $$;
revoke all on function public.delete_article(uuid) from public;
grant execute on function public.delete_article(uuid) to authenticated;
