-- Allow partners to manage their own ZZ links and align verified-state rules
-- with the four-link flow now used throughout the app.

create or replace function public.is_current_user(target_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = target_user_id
      and u.auth_user_id = auth.uid()
  );
$$;

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'partners_verified_requires_urls'
  ) then
    alter table public.partners
      drop constraint partners_verified_requires_urls;
  end if;
end $$;

alter table public.partners
  add constraint partners_verified_requires_urls
  check (
    status <> 'verified'
    or (
      zinzino_test_url is not null
      and zinzino_shop_url is not null
      and zinzino_partner_url is not null
      and consultation_url is not null
      and verified_at is not null
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'partners' and policyname = 'Partners insert own partner row'
  ) then
    create policy "Partners insert own partner row"
    on public.partners
    for insert
    with check (public.is_current_user(user_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'partners' and policyname = 'Partners update own partner row'
  ) then
    create policy "Partners update own partner row"
    on public.partners
    for update
    using (public.is_partner_owner(id))
    with check (public.is_partner_owner(id));
  end if;
end $$;
