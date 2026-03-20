# Referral MVP Backend

This repo will keep the current Vite/React frontend and add server-side public tracking through Supabase Edge Functions.

## Core Tables

- `partners`
- `referral_visits`
- `outbound_clicks`
- `leads`

`public.users` remains the identity/auth-linked table. `partners` holds referral and Zinzino-specific data.

## Data Rules

- `partners.referral_code` must be uppercase, unique, and immutable after creation.
- A `verified` partner must have all three Zinzino URLs populated.
- Zinzino URLs must use `https://`.
- Public clients do not insert directly into tracking or lead tables.

## Edge Functions

### `track-visit`

Purpose:
- Log an inbound referral visit for a verified partner.

Input:

```json
{
  "ref": "ELIN2026",
  "session_id": "uuid-or-cookie-id",
  "landing_page": "/test",
  "referrer": "https://instagram.com/",
  "utm_source": "instagram",
  "utm_medium": "story",
  "utm_campaign": "spring-launch",
  "user_agent": "Mozilla/5.0 ..."
}
```

Rules:
- Look up partner by `referral_code`.
- Only log visits for `status = 'verified'`.
- Do not throw on invalid refs. Return a safe response.

Output:

```json
{
  "ok": true,
  "partnerFound": true,
  "verified": true
}
```

### `track-click-and-redirect`

Purpose:
- Validate referral code.
- Log outbound click.
- Return the destination URL for frontend redirect.

Input:

```json
{
  "ref": "ELIN2026",
  "type": "test",
  "session_id": "uuid-or-cookie-id"
}
```

Rules:
- Resolve partner by `referral_code`.
- Require `status = 'verified'`.
- Map `type` to:
  - `test` -> `zinzino_test_url`
  - `shop` -> `zinzino_shop_url`
  - `partner` -> `zinzino_partner_url`
- If no valid destination exists, return a safe failure response.
- Frontend performs the browser redirect after receiving `destination_url`.

Output:

```json
{
  "ok": true,
  "destination_url": "https://www.zinzino.com/...."
}
```

Failure example:

```json
{
  "ok": false,
  "reason": "partner_not_verified"
}
```

### `upsert-lead`

Purpose:
- Store lead data with simple, durable attribution.

Input:

```json
{
  "email": "anna@example.com",
  "full_name": "Anna Holm",
  "phone": "0701234567",
  "ref": "ELIN2026",
  "session_id": "uuid-or-cookie-id",
  "lead_type": "customer",
  "lead_source": "customer_form"
}
```

Rules:
- Exact email match only.
- Resolve verified partner from `ref`.
- If no existing lead for the email exists: create one.
- If a lead exists:
  - update only when the new interaction is newer
  - and the previous interaction is within 30 days
- Never overwrite a newer attribution with an older interaction.

Output:

```json
{
  "ok": true,
  "mode": "created",
  "lead_id": "uuid"
}
```

Possible `mode` values:
- `created`
- `updated`
- `ignored`

## Standard Failure Reasons

Use these exact values so frontend and functions share one contract:

- `partner_not_found`
- `partner_not_verified`
- `destination_missing`
- `invalid_type`
- `invalid_email`

## Frontend Integration Order

1. Replace direct outbound links with internal CTA handlers.
2. Add `session_id` creation/persistence in `src/lib/referral.ts`.
3. Call `track-click-and-redirect` before leaving the site.
4. Call `track-visit` on referral-aware landing pages.
5. Move lead forms from direct table access to `upsert-lead`.

## MVP KPIs

Must be queryable from Postgres before any PostHog work:

- visits per partner
- unique sessions per partner
- outbound clicks per partner
- leads per partner
- visit -> click
- click -> lead
- visit -> lead
