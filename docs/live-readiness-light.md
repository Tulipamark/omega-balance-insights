# Live Readiness Light

## Purpose

This is the smallest useful readiness checklist before real usage.

It is not a launch playbook.

It is only meant to answer:

- what absolutely needs to be trustworthy
- what cannot still be fuzzy when real people use the system

## 1. Link And Redirect Safety

Must be true:

- partner ZZ links are present where needed
- redirect destinations use `https://`
- the right referral code leads to the right partner destination
- broken or missing destinations fail clearly instead of silently

Why it matters:

- if routing is wrong, trust breaks immediately

## 2. Lead Capture Reliability

Must be true:

- customer and partner leads are saved correctly
- partner and customer intent stay separated
- referral attribution is preserved through submission
- obvious submission failures surface clearly

Why it matters:

- without reliable lead capture, the whole operating layer weakens

## 3. Candidate To Team Member Rule

Must be true:

- nobody becomes a team member before active Zinzino join
- nobody becomes a team member before "wants to build with us" is confirmed
- admin understands why someone is blocked or ready
- blocker reasons are visible enough that onboarding is not guesswork

Why it matters:

- this protects the team layer from becoming muddy or inflated

## 4. Truth Labels

Must be true:

- scenario, demo, and internal interpretation are visible where needed
- no one mistakes projection for truth
- no one mistakes internal model logic for official Zinzino logic

Why it matters:

- polished UI should not create false certainty

## 5. Ownership And Recovery

Must be true:

- we know who owns:
  - link setup
  - admin review
  - partner onboarding
  - portal access decisions
- if something breaks, we know the first rollback or recovery step

Why it matters:

- live issues are not only technical
- they become worse when ownership is fuzzy

## Minimal Ready Signal

We are ready enough for real usage when:

- links route correctly
- leads save correctly
- attribution survives the flow
- team access is intentional
- demo or interpretive blocks are clearly marked

If one of those is still weak, we are not ready enough yet.

## Already Hardened

These parts should now be treated as baseline protections, not optional polish:

- customer, contact, and partner forms ignore rapid duplicate submits
- admin has clearer decision layers for onboarding, activation, and traffic
- attribution survives better across first touch, last touch, and session stitching
- optional traffic tracking is gated behind consent
- dashboard routes are split so the live app loads lighter than before

## Small Sharp Usage Pass

Before real traffic, run one small manual check:

- create one customer lead through an Omega link
- create one partner lead through an Omega link
- verify referral attribution stayed intact
- verify the candidate can not become a team member before confirmed ZZ join and build intent
- verify a valid partner route reaches the right ZZ destination

This pass is small on purpose.

If it fails, fix the flow before widening usage.
