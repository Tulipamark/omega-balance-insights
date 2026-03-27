-- Fix recursive RLS evaluation on partner-owned tables.
--
-- The existing public.is_partner_owner(target_partner_id) function reads from
-- public.partners while that same table uses the function inside its SELECT
-- policy. Under RLS this can recurse until PostgreSQL hits stack depth limits.
--
-- Making the helper SECURITY DEFINER lets it resolve ownership without being
-- re-evaluated under the caller's row policies, which also fixes dependent
-- policies on referral_visits, outbound_clicks and leads.

create or replace function public.is_partner_owner(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.partners p
    join public.users u on u.id = p.user_id
    where p.id = target_partner_id
      and u.auth_user_id = auth.uid()
  );
$$;

revoke all on function public.is_partner_owner(uuid) from public;
grant execute on function public.is_partner_owner(uuid) to authenticated;
grant execute on function public.is_partner_owner(uuid) to anon;
