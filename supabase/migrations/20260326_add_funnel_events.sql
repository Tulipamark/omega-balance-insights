create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete set null,
  referral_code text,
  session_id text not null,
  event_name text not null,
  page_path text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'funnel_events_event_name_format'
  ) then
    alter table public.funnel_events
      add constraint funnel_events_event_name_format
      check (event_name ~ '^[a-z0-9_]+$');
  end if;
end $$;

create index if not exists idx_funnel_events_created_at on public.funnel_events(created_at desc);
create index if not exists idx_funnel_events_event_name_created_at on public.funnel_events(event_name, created_at desc);
create index if not exists idx_funnel_events_partner_id_created_at on public.funnel_events(partner_id, created_at desc);
create index if not exists idx_funnel_events_referral_code_created_at on public.funnel_events(referral_code, created_at desc);
create index if not exists idx_funnel_events_session_id_created_at on public.funnel_events(session_id, created_at desc);

alter table public.funnel_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'funnel_events' and policyname = 'Admins read all funnel events'
  ) then
    create policy "Admins read all funnel events"
    on public.funnel_events
    for select
    using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'funnel_events' and policyname = 'Partners read own funnel events'
  ) then
    create policy "Partners read own funnel events"
    on public.funnel_events
    for select
    using (public.is_partner_owner(partner_id));
  end if;
end $$;

create or replace view public.kpi_funnel_events_daily as
select
  created_at::date as day,
  event_name,
  count(*)::bigint as events
from public.funnel_events
group by 1, 2;
