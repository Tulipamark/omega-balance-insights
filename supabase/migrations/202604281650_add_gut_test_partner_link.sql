alter table public.partners
  add column if not exists zinzino_gut_test_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'partners_gut_test_url_https'
  ) then
    alter table public.partners
      add constraint partners_gut_test_url_https
      check (zinzino_gut_test_url is null or zinzino_gut_test_url ~ '^https://');
  end if;
end $$;

update public.partners
set zinzino_gut_test_url = zinzino_test_url
where zinzino_gut_test_url is null
  and zinzino_test_url is not null;

alter table public.outbound_clicks
  drop constraint if exists outbound_clicks_destination_type_check;

alter table public.outbound_clicks
  add constraint outbound_clicks_destination_type_check
  check (destination_type in ('test', 'gut_test', 'shop', 'partner', 'consultation'));

update public.partners
set
  status = case
    when zinzino_test_url is not null
      and zinzino_gut_test_url is not null
      and zinzino_shop_url is not null
      and zinzino_partner_url is not null
    then 'verified'
    when status = 'verified' then 'pending'
    else status
  end,
  verified_at = case
    when zinzino_test_url is not null
      and zinzino_gut_test_url is not null
      and zinzino_shop_url is not null
      and zinzino_partner_url is not null
    then coalesce(verified_at, now())
    when status = 'verified' then null
    else verified_at
  end
where status is distinct from 'rejected';
