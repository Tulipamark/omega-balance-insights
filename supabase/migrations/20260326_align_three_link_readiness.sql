-- Align partner verified-state with the current three-link setup used in the UI.

update public.partners
set
  status = 'verified',
  verified_at = coalesce(verified_at, created_at, now())
where status <> 'rejected'
  and zinzino_test_url is not null
  and zinzino_shop_url is not null
  and zinzino_partner_url is not null;

update public.partners
set
  status = 'pending',
  verified_at = null
where status = 'verified'
  and (
    zinzino_test_url is null
    or zinzino_shop_url is null
    or zinzino_partner_url is null
  );

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'partners_verified_requires_urls'
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
      and verified_at is not null
    )
  );
