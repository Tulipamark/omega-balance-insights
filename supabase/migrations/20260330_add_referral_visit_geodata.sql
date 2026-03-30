alter table public.referral_visits
  add column if not exists geo_country text,
  add column if not exists geo_country_code text,
  add column if not exists geo_region text,
  add column if not exists geo_city text,
  add column if not exists geo_timezone text,
  add column if not exists geo_source text;

create index if not exists idx_referral_visits_geo_country_created_at
  on public.referral_visits(geo_country, created_at desc);

create index if not exists idx_referral_visits_geo_country_code_created_at
  on public.referral_visits(geo_country_code, created_at desc);

