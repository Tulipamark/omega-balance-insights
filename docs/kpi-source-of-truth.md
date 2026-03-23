# KPI Source Of Truth

This document locks the first KPI layer to the tables and fields that already
exist in the product. The goal is to avoid a parallel event model until there
is a real information gap.

This KPI layer must follow the product north star:
- attributed distribution into Zinzino
- partner activation
- duplication
- network growth

It must not imply that the platform owns checkout or transaction truth when
that truth lives outside the product.

## Principles

- Keep Supabase business tables as the source of truth.
- Build KPI views on top of current tables before adding new schema.
- Treat dashboard numbers as invalid until they can be checked against raw rows.

## Current Truth Tables

### `public.referral_visits`

Purpose:
- Captured attributed visits from referral links.

Important fields:
- `partner_id`
- `referral_code`
- `session_id`
- `landing_page`
- `referrer`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `created_at`

### `public.outbound_clicks`

Purpose:
- Captured outbound CTA clicks from attributed partner traffic.

Important fields:
- `partner_id`
- `referral_code`
- `session_id`
- `destination_type`
- `destination_url`
- `created_at`

### `public.leads`

Purpose:
- Unified lead table for both customer and partner interest.

Important fields:
- `id`
- `email`
- `referral_code`
- `referred_by_user_id`
- `partner_id`
- `session_id`
- `type`
- `lead_type`
- `lead_source`
- `status`
- `source_page`
- `details`
- `created_at`
- `updated_at`

Notes:
- `type` is the legacy app enum: `customer_lead | partner_lead`.
- `lead_type` is the newer business label: `customer | partner`.
- `lead_source` describes intake path: `email_gate | customer_form | partner_form`.

### `public.users`

Purpose:
- Portal users and role ownership.

Important fields:
- `id`
- `auth_user_id`
- `email`
- `role`
- `referral_code`
- `parent_partner_id`
- `created_at`

Notes:
- `role` is portal access, not partner verification state.
- A user can currently be `admin` or `partner`.

### `public.partners`

Purpose:
- Verified partner records and partner-facing destination URLs.

Important fields:
- `id`
- `user_id`
- `referral_code`
- `status`
- `zinzino_partner_id`
- `zinzino_test_url`
- `zinzino_shop_url`
- `zinzino_partner_url`
- `consultation_url`
- `market_code`
- `created_at`
- `verified_at`

Notes:
- `status` here reflects partner record state: `pending | verified | rejected`.
- This is not the same status model as `leads.status`.

### `public.partner_relationships`

Purpose:
- Sponsor/member tree for partner network structure.

Important fields:
- `sponsor_user_id`
- `partner_user_id`
- `level`
- `created_at`

### `public.customers`

Purpose:
- Known customers attributed to a referrer.

Important fields:
- `id`
- `email`
- `referred_by_user_id`
- `referral_code`
- `status`
- `created_at`

## Locked KPI Definitions

### 1. Funnel KPI

Question:
- Is the customer acquisition flow working end to end?

Measures:
- Visits
- Outbound clicks
- Customer leads
- Known customers

Primary sources:
- Visits: `referral_visits.created_at`
- Outbound clicks: `outbound_clicks.created_at`
- Customer leads: `leads.created_at` where `lead_type = 'customer'`
- Customers: `customers.created_at`

First view:
- `kpi_funnel_daily`

Open definition notes:
- "Visit" currently means an attributed referral visit, not all site traffic.
- "Known customer" means a customer row we can truthfully attribute in our own data.
- We should not present revenue or external purchase value as a core KPI until
  we have reliable truth back from Zinzino.

### 2. Partner Pipeline

Question:
- Are we attracting, reviewing, and activating the right partner candidates?

Measures:
- Partner applications
- Verified partner candidates
- Active partner accounts

Primary sources:
- Applications: `leads` where `lead_type = 'partner'`
- Verified candidates: `leads` where `lead_type = 'partner' and status = 'qualified'`
- Active partner accounts: `leads` where `lead_type = 'partner' and status = 'active'`
- Supporting partner record count: `partners`
- Supporting portal access count: `users` where `role = 'partner'`

First view:
- `kpi_partner_pipeline`

Open definition notes:
- For pipeline reporting, `leads.status` should be the main truth for candidate stage.
- `partners.status` is useful support data, but represents a different lifecycle.

### 3. Duplication

Question:
- Are partners other than us generating real inflow and outcomes?

Measures:
- Partners with referral visits
- Partners with outbound clicks
- Partners with leads
- Partners with customers
- Share of inflow attributed to partners

Primary sources:
- Partner universe: `partners`
- Partner ownership: `partners.user_id -> users.id`
- Network structure: `partner_relationships`
- Visits: `referral_visits.partner_id`
- Clicks: `outbound_clicks.partner_id`
- Leads: `leads.partner_id` or `leads.referred_by_user_id`
- Customers: `customers.referred_by_user_id`

First view:
- `kpi_duplication`

Locked definition:
- A partner counts as "producing" when they have at least one attributed lead.

Follow-up metrics:
- Producing partners with at least one customer

### 4. Source Mix

Question:
- Where is attributed inflow coming from?

Measures:
- Visits by source
- Visits by market
- Visits by landing page

Primary sources:
- `referral_visits.utm_source`
- `referral_visits.utm_medium`
- `referral_visits.utm_campaign`
- `referral_visits.landing_page`
- `partners.market_code`

First view:
- `kpi_source_mix_daily`

Open definition notes:
- We do not yet have a single unified source taxonomy across all flows.
- In the first version, source mix should stay limited to what `referral_visits` can support honestly.

## Definitions We Must Not Keep Fuzzy

### What is a lead?

Current answer:
- A row in `public.leads`.

Operational split:
- Customer lead: `lead_type = 'customer'`
- Partner application: `lead_type = 'partner'`

### What is an active partner?

Current answer:
- For partner onboarding workflow: a partner lead with `status = 'active'`.

Supporting signals:
- Matching `users.role = 'partner'`
- Matching `partners` row exists

### What is verified?

Current answer:
- For candidate workflow: a partner lead with `status = 'qualified'`.

Note:
- This is separate from `partners.status = 'verified'`.

### What is duplication?

Current answer:
- Another partner, not the admin operator, generates attributed inflow.

Minimum measurable threshold:
- At least one attributed lead tied to that partner.

Stronger thresholds:
- At least one attributed customer

## First SQL Views To Build

1. `kpi_funnel_daily`
- Daily counts for attributed visits, outbound clicks, customer leads, and known customers.

2. `kpi_partner_pipeline`
- Counts for partner applications by stage using `leads.status`.

3. `kpi_duplication`
- Per-partner production summary across visits, clicks, leads, and known customers.

4. `kpi_source_mix_daily`
- Daily visit mix by `utm_source`, `utm_medium`, landing page, and market where available.

## What We Are Explicitly Not Building Yet

- Generic event table
- Generic session table
- Parallel lead model
- Parallel partner model
- Full BI layer
- Cohorts and retention before base KPI truth is stable

## Manual Verification Rule

Before any dashboard number is trusted:

1. Run the SQL view.
2. Inspect the underlying raw rows.
3. Confirm the count matches expectation.

If the raw rows and the KPI disagree, the dashboard is wrong until proven otherwise.
