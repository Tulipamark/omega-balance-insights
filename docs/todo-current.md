# Todo Current

## Purpose

This is the current working todo for the next product passes.

For the more structured master version, use `systematic-todo.md`.
For the shorter execution queue that I should keep working from automatically, use `top-10-execution-list.md`.
For the sharper model-first priority order, use `top-7-model-optimization.md`.
For the zoomed-out product picture, use `system-overview.md`.
For market prioritization and language-vs-market decisions, use `market-priority-matrix.md`.

It is meant to stay practical:

- what is verified now
- what is next
- what we should judge work against

## Verified Now

- Admin is split into clearer subpages.
- Partner view acts as a team-layer, not a fake Zinzino backoffice.
- Partners can manage their own ZZ links in the partner view.
- Omega link is the primary outward-facing link.
- Growth Compass is reduced to list + detail dialog.
- Growth Projection is reduced to scenario select + detail dialog.
- Partner view includes:
  - first 30 days
  - progress toward first result
  - clearer lead statuses
  - lead filters for urgent, active, and new
  - next-step guidance per lead
- Admin partner application flow clearly reflects:
  - partner lead
  - candidate
  - team member
- Admin now shows clearer candidate -> team member criteria and top blockers before portal access.
- Core docs exist for:
  - portal lifecycle
  - team engagement levels
  - partner first 30 days
  - growth projection
  - first result engine
  - next 5 days plan
  - live readiness light

## Next Priorities

### Right Now For Live

Keep the next passes narrow and real:

- run one manual customer flow and one manual partner flow against live data
- verify admin shows attribution, session, and next-step signals as expected
- keep fixing only issues that would confuse a real visitor, partner, or admin
- avoid broad new feature work until the live usage pass stays clean

### 1. Candidate -> Team Member

Make this more concrete and measurable.

Needs:

- clearer criteria for when someone is still a candidate
- clearer criteria for when someone is ready to become a team member
- clearer ownership of the next action in admin
- visible blockers when someone is not yet ready
- less ambiguity around "ready", "verified", and "onboarded"
- keep team membership tied to active Zinzino join plus desire to build with us

### 1b. Team Member -> Core

Define the tighter inner circle without turning it into a fake rank system.

Needs:

- simple criteria for who belongs in the core
- support logic for closer access, calls, and rhythm
- no prestige ladder without real behavioral basis
- keep it as support access, not a prestige badge

### 2. First Result Engine, Version 2

Make the first-result flow more operational.

Needs:

- even clearer next-step guidance in partner view
- stronger focus on first contact, follow-up, and first response
- faster filtering of what deserves action right now
- less passive display, more practical support
- tighter connection between lead state and recommended action

### 3. Mock vs Real

Mark what is real and what is still interpretive or mocked.

Needs:

- identify UI blocks that still rely on mock data
- identify metrics that are still approximation or fallback
- avoid letting polished UI imply stronger truth than we actually have

### 4. Remove Low-Value Surface Area

Keep simplifying where the UI is heavier than the value it gives.

Needs:

- remove or compress blocks that are visually large but operationally weak
- keep admin scan-friendly
- keep partner view action-oriented

### 5. Live Readiness

Start preparing for real usage with a very small checklist.

Needs:

- link safety and redirect correctness
- ownership of critical flows
- clarity on what depends on Supabase or mock/demo assumptions
- a rollback-safe mindset for live changes
- use `live-readiness-light.md` as the baseline, not a larger launch document
- run one small sharp usage pass before widening traffic

### 6. GDPR / Privacy Gaps

Close the most important privacy and compliance gaps before broader live use.

Needs:

- define legal basis per main flow
- sharpen portal terms and privacy text
- define re-accept rules for future version changes
- define retention and deletion logic
- define internal handling of data subject requests
- use `gdpr-gap-list.md` as the working gap document

## Parameters For Prioritization

Every meaningful change should be judged against these:

- `Truthful to Zinzino`
  - does this imply official Zinzino logic that we do not own?

- `First Result`
  - does this help someone reach first meaningful movement faster?

- `Partner Usefulness`
  - does this make the partner's next step clearer?

- `Admin Usefulness`
  - does this help internal follow-up and decision-making?

- `Avoids Double Work`
  - does this reduce unnecessary work between Omega and Zinzino?

- `Scales`
  - will this still work when more partners and leads exist?

- `Data Trust`
  - is this based on strong signal or weak interpretation?

- `Live Readiness`
  - is this moving us toward real use or only nicer internal demo behavior?

## Current Working Order

1. sharpen candidate -> team member flow
2. improve first-result support in the partner view
3. mark mock vs real where it matters
4. remove low-value UI weight
5. prepare a minimal live-readiness checklist
6. close the most important GDPR/privacy gaps

## Guardrails

Do not spend the next passes on:

- fake payout logic
- fake BI complexity
- duplicating the Zinzino network tree
- broad strategy expansion without stronger daily usefulness

Prefer:

- clearer onboarding
- better lead action support
- cleaner admin decisions
- smaller but truer product behavior
