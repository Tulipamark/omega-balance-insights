# Growth Compass Manual Scenarios v1

These scenarios are a manual validation layer for Growth Compass v1.

The goal is not mathematical perfection. The goal is to test whether the model
produces useful, believable outputs that create direction instead of false
comfort.

## How To Read This

Each scenario includes:
- input
- expected status
- why that status is reasonable

If too many scenarios collapse into the same status, the model is too soft.

## Scenario 1: No movement yet

Input:
- personalCustomers30d = 0
- recruitedPartners30d = 0
- activeFirstLinePartners30d = 0
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `inactive`

Why:
- no current momentum
- no activity to build from

## Scenario 2: First customer only

Input:
- personalCustomers30d = 1
- recruitedPartners30d = 0
- activeFirstLinePartners30d = 0
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `active`

Why:
- real movement has started
- still individual, not yet repeatable

## Scenario 3: First recruited partner only

Input:
- personalCustomers30d = 0
- recruitedPartners30d = 1
- activeFirstLinePartners30d = 0
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `active`

Why:
- recruiting has started
- but nothing suggests activation or duplication yet

## Scenario 4: Two personal customers, still solo

Input:
- personalCustomers30d = 2
- recruitedPartners30d = 0
- activeFirstLinePartners30d = 0
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `active`

Why:
- strong personal effort
- but still no team signal

Interpretation:
- the model should resist calling this `growing` too early

## Scenario 5: Early build mode

Input:
- personalCustomers30d = 2
- recruitedPartners30d = 0
- activeFirstLinePartners30d = 1
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `growing`

Why:
- repeated personal traction
- first-line activation has begun

## Scenario 6: Recruiting with first team signal

Input:
- personalCustomers30d = 1
- recruitedPartners30d = 2
- activeFirstLinePartners30d = 1
- partnerGeneratedLeads30d = 1
- partnerGeneratedCustomers30d = 0

Expected:
- `growing`

Why:
- personal and recruiting movement
- first sign that activity may spread through others

## Scenario 7: Duplication begins

Input:
- personalCustomers30d = 2
- recruitedPartners30d = 2
- activeFirstLinePartners30d = 2
- partnerGeneratedLeads30d = 3
- partnerGeneratedCustomers30d = 0

Expected:
- `duplicating`

Why:
- enough first-line activation
- enough partner-generated inflow to count as real duplication

## Scenario 8: Strong duplication with first team customer

Input:
- personalCustomers30d = 1
- recruitedPartners30d = 2
- activeFirstLinePartners30d = 2
- partnerGeneratedLeads30d = 1
- partnerGeneratedCustomers30d = 1

Expected:
- `duplicating`

Why:
- partner-generated customer is stronger than raw lead count
- duplication is now outcome-based, not just activity-based

## Scenario 9: Leader-track threshold

Input:
- personalCustomers30d = 3
- recruitedPartners30d = 2
- activeFirstLinePartners30d = 3
- partnerGeneratedLeads30d = 5
- partnerGeneratedCustomers30d = 0

Expected:
- `leader-track`

Why:
- enough active depth
- enough partner-driven inflow
- personal activity still present

## Scenario 10: Leader-track with customer confirmation

Input:
- personalCustomers30d = 2
- recruitedPartners30d = 2
- activeFirstLinePartners30d = 3
- partnerGeneratedLeads30d = 2
- partnerGeneratedCustomers30d = 2

Expected:
- `leader-track`

Why:
- multiple active first-line partners
- partner-generated customer outcomes
- not just internal motion

## Scenario 11: Fragile momentum

Input:
- personalCustomers30d = 1
- recruitedPartners30d = 1
- activeFirstLinePartners30d = 0
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `active`

Why:
- movement exists
- but momentum is fragile and can stop easily

Important flag:
- `momentum-fragile`

## Scenario 12: Team signal without much personal push

Input:
- personalCustomers30d = 0
- recruitedPartners30d = 2
- activeFirstLinePartners30d = 1
- partnerGeneratedLeads30d = 1
- partnerGeneratedCustomers30d = 0

Expected:
- `growing`

Why:
- recruitment is real
- first-line activation exists
- the model should still acknowledge build-mode even if customer activity is weak

## Scenario 13: High score but wrong shape

Input:
- personalCustomers30d = 5
- recruitedPartners30d = 0
- activeFirstLinePartners30d = 0
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `active`

Why:
- this is deliberate
- high personal production alone should not be confused with duplication

This is an important guardrail.

## Scenario 14: Wide but shallow team

Input:
- personalCustomers30d = 1
- recruitedPartners30d = 4
- activeFirstLinePartners30d = 1
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `growing`

Why:
- many recruits without enough activation should not jump straight to duplication

## Scenario 15: Duplication stronger than personal effort

Input:
- personalCustomers30d = 1
- recruitedPartners30d = 1
- activeFirstLinePartners30d = 2
- partnerGeneratedLeads30d = 4
- partnerGeneratedCustomers30d = 1

Expected:
- `duplicating`

Why:
- team activity is clearly taking over from solo effort

## Scenario 16: Activity dropped after earlier momentum

Input:
- personalCustomers30d = 0
- recruitedPartners30d = 0
- activeFirstLinePartners30d = 1
- partnerGeneratedLeads30d = 0
- partnerGeneratedCustomers30d = 0

Expected:
- `active`

Why:
- not fully dead
- but not truly growing either

Interpretation:
- useful case to monitor in v2 if we later add retention or consecutive active periods

## Current Read Of The Model

### What looks healthy
- strong personal activity alone does not get promoted too easily
- duplication requires real first-line activation
- leader-track still needs personal presence

### What to watch
- the line between `active` and `growing`
- whether scenario 12 feels too generous
- whether scenario 16 should later become its own "stalled" subtype in v2

## Decision Rule

If these scenarios feel broadly believable:
- keep v1

If too many borderline cases feel too generous:
- tighten `growing`

If too many real builders get stuck in `active`:
- loosen `growing`
