-- Gives an existing Supabase user access to /admin.
-- 1. Create the user first: Authentication → Users → Add user → Create new user
--    (tick "Auto Confirm User").
-- 2. Replace the email below with theirs, then run this in the SQL editor.
insert into public.cms_editors (user_id)
select id from auth.users where email = 'editor@example.com'
on conflict do nothing;

-- To remove someone's access later:
-- delete from public.cms_editors
-- where user_id = (select id from auth.users where email = 'editor@example.com');
