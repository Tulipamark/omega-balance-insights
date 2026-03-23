# Growth Compass Spec v1

## Purpose

Growth Compass is an internal planning and progress model.

It does not calculate official Zinzino payouts.
It does not claim to reproduce the compensation plan exactly.
It is designed to translate partner behavior into measurable progress signals,
clear milestones, and next-best-action guidance.

The goal is to help partners and admins understand:
- current momentum
- likely growth direction
- what action matters most next

Strategic references for this model:
- [ZZ Compensation Plan – Structured](C:/Users/Heléne/omegabalance-lovable/docs/zz-comp-plan-structured.md)
- [ZZ Growth Signals](C:/Users/Heléne/omegabalance-lovable/docs/zz-comp-plan-signals.md)
- [ZZ Compensation Mechanics](C:/Users/Heléne/omegabalance-lovable/docs/zz-comp-plan-mechanics.md)

## Scope

Growth Compass should answer:

1. Is this partner currently `inactive`, `active`, `growing`, `duplicating`, or `leader-track`?
2. What milestone is closest next?
3. What is the most important next action?
4. Is progress driven only by the partner personally, or starting to duplicate through others?

Growth Compass should not answer:
- exact payout
- exact Zinzino rank
- expected commission in money
- official qualification status

## Design Principles

1. Behavior over theory
2. Progress over payout
3. Simplicity over false precision
4. Separate from source-of-truth KPI
5. ZZ-aligned but not ZZ-claiming

## Inputs

Initial version uses a rolling 30-day window.

### Core inputs
- `personalCustomers30d`
- `recruitedPartners30d`
- `activeFirstLinePartners30d`
- `partnerGeneratedLeads30d`
- `partnerGeneratedCustomers30d`

### Optional future inputs
- `retentionCustomers60d`
- `retentionPartners60d`
- `sourceMixPartnerVsSelf`
- `consecutiveActiveMonths`
- `customerToPartnerConversionRate`

## Derived Concepts

### Personal activity
- `personalCustomers30d`
- `recruitedPartners30d`

### First-line activation
- `activeFirstLinePartners30d`

### Duplication
- `partnerGeneratedLeads30d`
- `partnerGeneratedCustomers30d`

### Momentum
- weighted score from all core inputs

## Status Levels

### `inactive`
- no meaningful activity in the last 30 days

### `active`
- some personal activity exists
- but not enough evidence of team momentum yet

### `growing`
- repeated personal activity
- at least some successful recruiting or customer generation
- early signs of consistency

### `duplicating`
- first-line partners are active
- some inflow is coming through others

### `leader-track`
- multiple active first-line partners
- real duplication
- sustained progress, not one-off spikes

## Suggested Initial Thresholds

These thresholds are internal model assumptions, not external claims.

### `inactive`
- all core inputs are `0`

### `active`
Any of:
- `personalCustomers30d >= 1`
- `recruitedPartners30d >= 1`

And:
- `activeFirstLinePartners30d = 0`

### `growing`
At least:
- `personalCustomers30d >= 2`
or
- `recruitedPartners30d >= 2`

And at least one of:
- `activeFirstLinePartners30d >= 1`
- `partnerGeneratedLeads30d >= 1`

### `duplicating`
At least:
- `activeFirstLinePartners30d >= 2`

And at least one of:
- `partnerGeneratedLeads30d >= 3`
- `partnerGeneratedCustomers30d >= 1`

### `leader-track`
At least:
- `activeFirstLinePartners30d >= 3`

And at least one of:
- `partnerGeneratedLeads30d >= 5`
- `partnerGeneratedCustomers30d >= 2`

And:
- personal activity still present

## Milestones

### `inactive -> active`
- first customer
- first recruited partner

### `active -> growing`
- second customer
- second recruited partner
- first active first-line partner

### `growing -> duplicating`
- second active first-line partner
- first partner-generated customer
- three partner-generated leads

### `duplicating -> leader-track`
- third active first-line partner
- sustained partner-generated inflow
- consistent activity over multiple periods

## Next-Best-Action Logic

### If status = `inactive`
- get the first customer or recruit the first partner

### If status = `active`
- repeat the first success and avoid stopping after one result

### If status = `growing`
- activate first-line partners, not only personal production

### If status = `duplicating`
- strengthen consistency in partner-generated activity

### If status = `leader-track`
- protect momentum and increase the number of active first-line partners

## Output Contract

The model returns:
- `status`
- `score`
- `nextMilestone`
- `nextBestAction`
- `explanation`
- `flags`

## Scoring Model

Suggested weights:
- `personalCustomers30d * 10`
- `recruitedPartners30d * 12`
- `activeFirstLinePartners30d * 20`
- `partnerGeneratedLeads30d * 6`
- `partnerGeneratedCustomers30d * 15`

Principles:
- active first-line partners should weigh heavily
- partner-generated customers should weigh more than leads
- score should support status classification, not replace it

## Flags

Examples:
- `no-current-activity`
- `personal-activity-present`
- `recruiting-started`
- `first-line-not-active`
- `duplication-started`
- `partner-generated-customers-present`
- `momentum-fragile`
- `leader-signal`

## Data Boundaries

Do not include:
- payout estimates
- unofficial commission assumptions
- inferred ZZ transaction truth we cannot verify

## UI Guidance

Present Growth Compass as:
- internal guidance
- progress view
- behavioral compass

Do not present it as:
- official Zinzino status
- payout estimate
- legal or financial truth

Recommended sections:
- Current status
- Why this status
- Next milestone
- Next best action

## Versioning

- `v1` = simple 30-day behavior model
- `v2` = improved thresholds using real usage data
- `v3` = possible retention and consistency signals

Thresholds and weights should be explicit and documented.

## Success Criteria For v1

Growth Compass v1 is successful if:
- it is easy to explain
- it helps identify the next useful action
- it does not pretend to know payouts
- it aligns reasonably with real-world partner development
- it can be adjusted as data quality improves
