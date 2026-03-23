-- KPI views built on the current source-of-truth tables.
-- These views intentionally avoid introducing a parallel events/sessions layer.

create or replace view public.kpi_funnel_daily as
with days as (
  select date_trunc('day', created_at) as day from public.referral_visits
  union
  select date_trunc('day', created_at) as day from public.outbound_clicks
  union
  select date_trunc('day', created_at) as day from public.leads where lead_type = 'customer'
  union
  select date_trunc('day', created_at) as day from public.customers
  union
  select date_trunc('day', created_at) as day from public.orders where status = 'paid'
),
visits as (
  select date_trunc('day', created_at) as day, count(*) as visits
  from public.referral_visits
  group by 1
),
clicks as (
  select date_trunc('day', created_at) as day, count(*) as outbound_clicks
  from public.outbound_clicks
  group by 1
),
customer_leads as (
  select date_trunc('day', created_at) as day, count(*) as customer_leads
  from public.leads
  where lead_type = 'customer'
  group by 1
),
customers as (
  select date_trunc('day', created_at) as day, count(*) as customers
  from public.customers
  group by 1
),
paid_orders as (
  select
    date_trunc('day', created_at) as day,
    count(*) as paid_orders,
    coalesce(sum(amount), 0)::numeric(12,2) as paid_revenue
  from public.orders
  where status = 'paid'
  group by 1
)
select
  d.day,
  coalesce(v.visits, 0) as visits,
  coalesce(c.outbound_clicks, 0) as outbound_clicks,
  coalesce(l.customer_leads, 0) as customer_leads,
  coalesce(cu.customers, 0) as customers,
  coalesce(o.paid_orders, 0) as paid_orders,
  coalesce(o.paid_revenue, 0)::numeric(12,2) as paid_revenue,
  case
    when coalesce(v.visits, 0) > 0
      then round((coalesce(c.outbound_clicks, 0)::numeric / v.visits) * 100, 2)
    else 0
  end as visit_to_click_pct,
  case
    when coalesce(c.outbound_clicks, 0) > 0
      then round((coalesce(l.customer_leads, 0)::numeric / c.outbound_clicks) * 100, 2)
    else 0
  end as click_to_lead_pct,
  case
    when coalesce(l.customer_leads, 0) > 0
      then round((coalesce(cu.customers, 0)::numeric / l.customer_leads) * 100, 2)
    else 0
  end as lead_to_customer_pct,
  case
    when coalesce(cu.customers, 0) > 0
      then round((coalesce(o.paid_orders, 0)::numeric / cu.customers) * 100, 2)
    else 0
  end as customer_to_paid_order_pct,
  case
    when coalesce(v.visits, 0) > 0
      then round((coalesce(o.paid_orders, 0)::numeric / v.visits) * 100, 2)
    else 0
  end as visit_to_paid_order_pct
from days d
left join visits v on v.day = d.day
left join clicks c on c.day = d.day
left join customer_leads l on l.day = d.day
left join customers cu on cu.day = d.day
left join paid_orders o on o.day = d.day
order by d.day desc;

create or replace view public.kpi_partner_pipeline as
with partner_applications as (
  select *
  from public.leads
  where lead_type = 'partner'
),
partner_users as (
  select *
  from public.users
  where role = 'partner'
)
select
  count(*) as applications,
  count(*) filter (where status = 'new') as new_candidates,
  count(*) filter (where status = 'qualified') as verified_candidates,
  count(*) filter (where status = 'active') as active_partner_accounts,
  count(*) filter (where status in ('lost', 'inactive')) as inactive_or_lost,
  (select count(*) from public.partners) as partner_records,
  (select count(*) from partner_users) as portal_partner_users,
  case
    when count(*) > 0
      then round((count(*) filter (where status = 'qualified')::numeric / count(*)) * 100, 2)
    else 0
  end as application_to_verified_pct,
  case
    when count(*) filter (where status = 'qualified') > 0
      then round(
        (
          count(*) filter (where status = 'active')::numeric
          / count(*) filter (where status = 'qualified')
        ) * 100,
        2
      )
    else 0
  end as verified_to_active_pct
from partner_applications;

create or replace view public.kpi_duplication as
with partner_base as (
  select
    p.id as partner_id,
    p.user_id,
    p.referral_code,
    p.status as partner_record_status,
    p.created_at,
    p.verified_at,
    u.name as partner_name,
    u.email,
    u.role as portal_role
  from public.partners p
  join public.users u on u.id = p.user_id
),
visit_counts as (
  select rv.partner_id, count(*) as visits
  from public.referral_visits rv
  where rv.partner_id is not null
  group by rv.partner_id
),
click_counts as (
  select oc.partner_id, count(*) as outbound_clicks
  from public.outbound_clicks oc
  where oc.partner_id is not null
  group by oc.partner_id
),
lead_counts as (
  select
    coalesce(l.partner_id, p.id) as partner_id,
    count(*) filter (where l.lead_type = 'customer') as customer_leads,
    count(*) filter (where l.lead_type = 'partner') as partner_leads,
    count(*) as total_leads
  from public.leads l
  left join public.partners p on p.user_id = l.referred_by_user_id
  where coalesce(l.partner_id, p.id) is not null
  group by 1
),
customer_counts as (
  select
    p.id as partner_id,
    count(*) as customers
  from public.customers c
  join public.partners p on p.user_id = c.referred_by_user_id
  group by p.id
),
order_counts as (
  select
    p.id as partner_id,
    count(*) filter (where o.status = 'paid') as paid_orders,
    coalesce(sum(o.amount) filter (where o.status = 'paid'), 0)::numeric(12,2) as paid_revenue
  from public.orders o
  join public.partners p on p.user_id = o.referred_by_user_id
  group by p.id
)
select
  pb.partner_id,
  pb.user_id,
  pb.partner_name,
  pb.email,
  pb.referral_code,
  pb.portal_role,
  pb.partner_record_status,
  null::text as market_code,
  pb.created_at,
  pb.verified_at,
  coalesce(v.visits, 0) as visits,
  coalesce(c.outbound_clicks, 0) as outbound_clicks,
  coalesce(l.total_leads, 0) as total_leads,
  coalesce(l.customer_leads, 0) as customer_leads,
  coalesce(l.partner_leads, 0) as partner_leads,
  coalesce(cu.customers, 0) as customers,
  coalesce(o.paid_orders, 0) as paid_orders,
  coalesce(o.paid_revenue, 0)::numeric(12,2) as paid_revenue,
  (coalesce(l.total_leads, 0) > 0) as has_generated_leads,
  (coalesce(cu.customers, 0) > 0) as has_generated_customers,
  (coalesce(o.paid_orders, 0) > 0) as has_generated_paid_orders
from partner_base pb
left join visit_counts v on v.partner_id = pb.partner_id
left join click_counts c on c.partner_id = pb.partner_id
left join lead_counts l on l.partner_id = pb.partner_id
left join customer_counts cu on cu.partner_id = pb.partner_id
left join order_counts o on o.partner_id = pb.partner_id
order by paid_orders desc, customers desc, total_leads desc, visits desc;

create or replace view public.kpi_source_mix_daily as
select
  date_trunc('day', rv.created_at) as day,
  coalesce(nullif(rv.utm_source, ''), 'unknown') as source,
  coalesce(nullif(rv.utm_medium, ''), 'unknown') as medium,
  coalesce(nullif(rv.utm_campaign, ''), 'unknown') as campaign,
  coalesce(nullif(rv.landing_page, ''), 'unknown') as landing_page,
  'unknown'::text as market_code,
  count(*) as visits
from public.referral_visits rv
group by 1, 2, 3, 4, 5, 6
order by day desc, visits desc;
