create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  referral_code text not null unique,
  zinzino_partner_id text,
  zinzino_test_url text,
  zinzino_shop_url text,
  zinzino_partner_url text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

alter table public.partners
  add constraint partners_referral_code_format
  check (referral_code = upper(referral_code) and referral_code ~ '^[A-Z0-9_-]{4,32}$');

alter table public.partners
  add constraint partners_test_url_https
  check (zinzino_test_url is null or zinzino_test_url ~ '^https://');

alter table public.partners
  add constraint partners_shop_url_https
  check (zinzino_shop_url is null or zinzino_shop_url ~ '^https://');

alter table public.partners
  add constraint partners_partner_url_https
  check (zinzino_partner_url is null or zinzino_partner_url ~ '^https://');

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

create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  referral_code text not null,
  session_id text not null,
  landing_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  referral_code text not null,
  session_id text not null,
  destination_type text not null check (destination_type in ('test', 'shop', 'partner')),
  destination_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  referral_code text not null,
  session_id text,
  email text not null,
  full_name text,
  phone text,
  lead_type text not null check (lead_type in ('customer', 'partner')),
  lead_source text not null check (lead_source in ('email_gate', 'customer_form', 'partner_form')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_partners_user_id on public.partners(user_id);
create index if not exists idx_partners_referral_code on public.partners(referral_code);
create index if not exists idx_partners_status on public.partners(status);

create index if not exists idx_referral_visits_partner_id on public.referral_visits(partner_id);
create index if not exists idx_referral_visits_referral_code on public.referral_visits(referral_code);
create index if not exists idx_referral_visits_session_id on public.referral_visits(session_id);
create index if not exists idx_referral_visits_created_at on public.referral_visits(created_at desc);

create index if not exists idx_outbound_clicks_partner_id on public.outbound_clicks(partner_id);
create index if not exists idx_outbound_clicks_referral_code on public.outbound_clicks(referral_code);
create index if not exists idx_outbound_clicks_session_id on public.outbound_clicks(session_id);
create index if not exists idx_outbound_clicks_created_at on public.outbound_clicks(created_at desc);

create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_partner_id on public.leads(partner_id);
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

create policy "Admins read all partners"
on public.partners
for select
using (public.is_admin());

create policy "Partners read own partner row"
on public.partners
for select
using (public.is_partner_owner(id));

create policy "Admins insert partners"
on public.partners
for insert
with check (public.is_admin());

create policy "Admins update partners"
on public.partners
for update
using (public.is_admin())
with check (public.is_admin());

create policy "Admins read all referral visits"
on public.referral_visits
for select
using (public.is_admin());

create policy "Partners read own referral visits"
on public.referral_visits
for select
using (public.is_partner_owner(partner_id));

create policy "Admins read all outbound clicks"
on public.outbound_clicks
for select
using (public.is_admin());

create policy "Partners read own outbound clicks"
on public.outbound_clicks
for select
using (public.is_partner_owner(partner_id));

create policy "Admins read all leads"
on public.leads
for select
using (public.is_admin());

create policy "Partners read own leads"
on public.leads
for select
using (public.is_partner_owner(partner_id));
