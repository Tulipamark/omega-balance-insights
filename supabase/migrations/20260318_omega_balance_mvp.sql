create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'partner');
create type public.lead_type as enum ('customer_lead', 'partner_lead');
create type public.entity_status as enum ('new', 'qualified', 'active', 'inactive', 'won', 'lost');
create type public.order_status as enum ('pending', 'paid', 'cancelled', 'refunded');

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where auth_user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.generate_referral_code(full_name text)
returns text
language plpgsql
as $$
declare
  base_code text;
  candidate text;
  suffix text;
begin
  base_code := upper(regexp_replace(coalesce(full_name, 'partner'), '[^a-zA-Z0-9]+', '', 'g'));
  base_code := left(base_code, 8);

  if base_code = '' then
    base_code := 'OMEGA';
  end if;

  loop
    suffix := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 4));
    candidate := base_code || suffix;
    exit when not exists (
      select 1 from public.users where referral_code = candidate
    );
  end loop;

  return candidate;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text not null unique,
  role public.app_role not null default 'partner',
  referral_code text not null unique,
  parent_partner_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  type public.lead_type not null,
  source_page text,
  referral_code text,
  referred_by_user_id uuid references public.users(id) on delete set null,
  status public.entity_status not null default 'new',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  referred_by_user_id uuid references public.users(id) on delete set null,
  referral_code text,
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  referred_by_user_id uuid references public.users(id) on delete set null,
  amount numeric(12,2) not null default 0,
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.partner_relationships (
  id uuid primary key default gen_random_uuid(),
  sponsor_user_id uuid not null references public.users(id) on delete cascade,
  partner_user_id uuid not null unique references public.users(id) on delete cascade,
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  referral_code text,
  landing_page text,
  visitor_id text,
  utm_source text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_parent_partner_id on public.users(parent_partner_id);
create index if not exists idx_users_referral_code on public.users(referral_code);
create index if not exists idx_leads_referred_by on public.leads(referred_by_user_id, type);
create index if not exists idx_customers_referred_by on public.customers(referred_by_user_id);
create index if not exists idx_orders_referred_by on public.orders(referred_by_user_id);
create index if not exists idx_partner_relationships_sponsor on public.partner_relationships(sponsor_user_id);
create index if not exists idx_referral_visits_referral_code on public.referral_visits(referral_code, created_at desc);

create or replace function public.set_default_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or btrim(new.referral_code) = '' then
    new.referral_code := public.generate_referral_code(new.name);
  else
    new.referral_code := upper(new.referral_code);
  end if;
  return new;
end;
$$;

drop trigger if exists users_default_referral_code on public.users;
create trigger users_default_referral_code
before insert on public.users
for each row
execute function public.set_default_referral_code();

create or replace function public.sync_partner_relationship()
returns trigger
language plpgsql
as $$
begin
  if new.parent_partner_id is not null then
    insert into public.partner_relationships (sponsor_user_id, partner_user_id, level)
    values (new.parent_partner_id, new.id, 1)
    on conflict (partner_user_id) do update
      set sponsor_user_id = excluded.sponsor_user_id,
          level = excluded.level;
  end if;
  return new;
end;
$$;

drop trigger if exists users_sync_partner_relationship on public.users;
create trigger users_sync_partner_relationship
after insert or update of parent_partner_id on public.users
for each row
execute function public.sync_partner_relationship();

alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.partner_relationships enable row level security;
alter table public.referral_visits enable row level security;

create policy "Users can read themselves and admins can read all"
on public.users
for select
using (
  public.is_admin()
  or auth_user_id = auth.uid()
  or parent_partner_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Users can insert own profile"
on public.users
for insert
with check (public.is_admin() or auth_user_id = auth.uid());

create policy "Admins manage users"
on public.users
for update
using (public.is_admin())
with check (public.is_admin());

create policy "Admins and attributed partners read leads"
on public.leads
for select
using (
  public.is_admin()
  or referred_by_user_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Anyone can create leads"
on public.leads
for insert
with check (true);

create policy "Admins and attributed partners read customers"
on public.customers
for select
using (
  public.is_admin()
  or referred_by_user_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Admins and attributed partners read orders"
on public.orders
for select
using (
  public.is_admin()
  or referred_by_user_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Admins and team members read partner relationships"
on public.partner_relationships
for select
using (
  public.is_admin()
  or sponsor_user_id in (select id from public.users where auth_user_id = auth.uid())
  or partner_user_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Anyone can create referral visits"
on public.referral_visits
for insert
with check (true);

create policy "Admins and code owners read referral visits"
on public.referral_visits
for select
using (
  public.is_admin()
  or referral_code in (select referral_code from public.users where auth_user_id = auth.uid())
);
