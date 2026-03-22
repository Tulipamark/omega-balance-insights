-- Fix recursive RLS evaluation on public.users.
--
-- The original users select policy calls public.is_admin(), and that function
-- also reads from public.users. Under RLS this can recurse infinitely when the
-- current session tries to resolve its own portal profile.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where auth_user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

drop policy if exists "Users can read themselves and admins can read all" on public.users;

create policy "Users can read themselves and admins can read all"
on public.users
for select
using (
  public.is_admin()
  or auth_user_id = auth.uid()
);
