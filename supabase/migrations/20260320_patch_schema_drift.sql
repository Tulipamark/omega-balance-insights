-- Patch schema drift for projects where the base MVP schema and the referral
-- tracking schema were applied partially or in the wrong order.
--
-- This migration is intentionally additive and idempotent. It should be safe
-- to run after any partial rollout where `users`, `leads` or
-- `referral_visits` already exist but `partners` / `outbound_clicks` or the
-- newer attribution fields do not.

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  referral_code text not null unique,
  zinzino_partner_id text,
  zinzino_test_url text,
  zinzino_shop_url text,
  zinzino_partner_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create table if not exists public.outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  referral_code text not null,
  session_id text not null,
  destination_type text not null,
  destination_url text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'partners_status_check'
  ) then
    alter table public.partners
      add constraint partners_status_check
      check (status in ('pending', 'verified', 'rejected'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'partners_referral_code_format'
  ) then
    alter table public.partners
      add constraint partners_referral_code_format
      check (referral_code = upper(referral_code) and referral_code ~ '^[A-Z0-9_-]{4,32}$');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'partners_test_url_https'
  ) then
    alter table public.partners
      add constraint partners_test_url_https
      check (zinzino_test_url is null or zinzino_test_url ~ '^https://');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'partners_shop_url_https'
  ) then
    alter table public.partners
      add constraint partners_shop_url_https
      check (zinzino_shop_url is null or zinzino_shop_url ~ '^https://');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'partners_partner_url_https'
  ) then
    alter table public.partners
      add constraint partners_partner_url_https
      check (zinzino_partner_url is null or zinzino_partner_url ~ '^https://');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'partners_verified_requires_urls'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'outbound_clicks_destination_type_check'
  ) then
    alter table public.outbound_clicks
      add constraint outbound_clicks_destination_type_check
      check (destination_type in ('test', 'shop', 'partner'));
  end if;
end $$;

create index if not exists idx_partners_user_id on public.partners(user_id);
create index if not exists idx_partners_referral_code on public.partners(referral_code);
create index if not exists idx_partners_status on public.partners(status);

create index if not exists idx_outbound_clicks_partner_id on public.outbound_clicks(partner_id);
create index if not exists idx_outbound_clicks_referral_code on public.outbound_clicks(referral_code);
create index if not exists idx_outbound_clicks_session_id on public.outbound_clicks(session_id);
create index if not exists idx_outbound_clicks_created_at on public.outbound_clicks(created_at desc);

-- Bring referral_visits up to the shape expected by the referral tracking MVP.
alter table public.referral_visits
  add column if not exists partner_id uuid references public.partners(id) on delete cascade,
  add column if not exists session_id text,
  add column if not exists referrer text,
  add column if not exists utm_medium text,
  add column if not exists user_agent text,
  add column if not exists ip_hash text;

create index if not exists idx_referral_visits_partner_id on public.referral_visits(partner_id);
create index if not exists idx_referral_visits_session_id on public.referral_visits(session_id);
create index if not exists idx_referral_visits_created_at on public.referral_visits(created_at desc);

-- Bring leads closer to the new attribution model while preserving legacy fields.
alter table public.leads
  add column if not exists partner_id uuid references public.partners(id) on delete cascade,
  add column if not exists session_id text,
  add column if not exists full_name text,
  add column if not exists lead_type text,
  add column if not exists lead_source text,
  add column if not exists updated_at timestamptz not null default now();

update public.leads
set full_name = coalesce(full_name, name)
where full_name is null;

update public.leads
set lead_type = case
  when type = 'customer_lead' then 'customer'
  when type = 'partner_lead' then 'partner'
  else lead_type
end
where lead_type is null;

update public.leads
set lead_source = case
  when type = 'customer_lead' then 'customer_form'
  when type = 'partner_lead' then 'partner_form'
  else lead_source
end
where lead_source is null;

alter table public.leads
  alter column full_name set not null,
  alter column lead_type set not null,
  alter column lead_source set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_lead_type_check'
  ) then
    alter table public.leads
      add constraint leads_lead_type_check
      check (lead_type in ('customer', 'partner'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_lead_source_check'
  ) then
    alter table public.leads
      add constraint leads_lead_source_check
      check (lead_source in ('email_gate', 'customer_form', 'partner_form'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_status_check'
  ) then
    alter table public.leads
      add constraint leads_status_check
      check (status in ('new', 'contacted', 'qualified', 'closed'));
  end if;
end $$;

create index if not exists idx_leads_partner_id on public.leads(partner_id);
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_referral_code on public.leads(referral_code);
create index if not exists idx_leads_created_at on public.leads(created_at desc);

create or replace function public.touch_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
before update on public.leads
for each row
execute function public.touch_leads_updated_at();

create or replace function public.lock_partner_referral_code()
returns trigger
language plpgsql
as $$
begin
  if old.referral_code is distinct from new.referral_code then
    raise exception 'partner referral_code cannot be changed once created';
  end if;
  return new;
end;
$$;

drop trigger if exists partners_lock_referral_code on public.partners;
create trigger partners_lock_referral_code
before update on public.partners
for each row
when (old.referral_code is distinct from new.referral_code)
execute function public.lock_partner_referral_code();

create or replace function public.is_partner_owner(target_partner_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.partners p
    join public.users u on u.id = p.user_id
    where p.id = target_partner_id
      and u.auth_user_id = auth.uid()
  );
$$;

alter table public.partners enable row level security;
alter table public.referral_visits enable row level security;
alter table public.outbound_clicks enable row level security;
alter table public.leads enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'partners' and policyname = 'Admins read all partners'
  ) then
    create policy "Admins read all partners"
    on public.partners
    for select
    using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'partners' and policyname = 'Partners read own partner row'
  ) then
    create policy "Partners read own partner row"
    on public.partners
    for select
    using (public.is_partner_owner(id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'partners' and policyname = 'Admins insert partners'
  ) then
    create policy "Admins insert partners"
    on public.partners
    for insert
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'partners' and policyname = 'Admins update partners'
  ) then
    create policy "Admins update partners"
    on public.partners
    for update
    using (public.is_admin())
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'referral_visits' and policyname = 'Admins read all referral visits'
  ) then
    create policy "Admins read all referral visits"
    on public.referral_visits
    for select
    using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'referral_visits' and policyname = 'Partners read own referral visits'
  ) then
    create policy "Partners read own referral visits"
    on public.referral_visits
    for select
    using (public.is_partner_owner(partner_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'outbound_clicks' and policyname = 'Admins read all outbound clicks'
  ) then
    create policy "Admins read all outbound clicks"
    on public.outbound_clicks
    for select
    using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'leads' and policyname = 'Admins read all leads'
  ) then
    create policy "Admins read all leads"
    on public.leads
    for select
    using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'leads' and policyname = 'Partners read own leads'
  ) then
    create policy "Partners read own leads"
    on public.leads
    for select
    using (public.is_partner_owner(partner_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'outbound_clicks' and policyname = 'Partners read own outbound clicks'
  ) then
    create policy "Partners read own outbound clicks"
    on public.outbound_clicks
    for select
    using (public.is_partner_owner(partner_id));
  end if;
end $$;
