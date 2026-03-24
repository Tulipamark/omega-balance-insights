# Growth Projection Engine

## Purpose

Growth Projection Engine is an internal scenario model.

It is not a payout calculator.
It is not an official Zinzino forecast.
It is not a promise of future results.

Its purpose is to help us reason about:

- inflow
- conversion
- activation
- retention
- external relationship-driven growth
- likely team growth over 12 to 60 months

The model should help us understand whether the machine is getting stronger,
not whether we can predict exact money.

## Why This Exists

The biggest mistake in network-driven businesses is to estimate outcomes from
the compensation plan before the input machine is under control.

That leads to:

- fake precision
- inflated expectations
- weak operational focus

Our platform has much more influence over:

- how many people enter the flow
- how many become leads
- how many become customers
- how many show partner interest
- how many actually become active
- how many stay active long enough to create duplication
- how much growth also arrives from personal networks and leadership outside the portal

That is what this engine should model.

## Design Principles

1. Two growth engines, not one

The model must include both:

- system-driven growth
- external relationship-driven growth

2. Inputs over fantasy

The model should start from traffic, leads, conversion, activation, retention,
and external adds.

3. Scenarios over certainty

The engine should always support:

- low case
- mid case
- high case

4. Team activity over headcount

The most important output is not total names in structure.

It is:

- active people
- customer base
- team-led inflow

5. Revenue proxy over payout fantasy

If we show a money-like output, it should be clearly labeled as an internal
revenue or volume proxy, not official ZZ payout.

## Scope

The first version should answer:

1. If inflow grows to X, what might happen to leads over time?
2. If lead conversion stays at Y, what might happen to customers?
3. If partner conversion stays at Z, how many partner candidates and team
   members might we get?
4. If activation and retention improve, how much stronger could the team become
   over 12 to 60 months?
5. How much of total growth may come from work outside the platform itself?

The first version should not answer:

- exact payout
- official ZZ rank
- exact commission
- official future qualification status

## Inputs

### Core monthly inputs

- monthlyVisitors
- trafficGrowthRateMonthly
- visitToLeadRate
- leadToCustomerRate
- leadToPartnerInterestRate
- partnerInterestToTeamMemberRate
- teamMemberActivationRate
- activeRetentionRate
- averageCustomersPerActiveTeamMember
- monthlyExternalPartnerAdds
- externalPartnerGrowthRateMonthly
- externalPartnerActivationRate
- monthlyExternalCustomerAdds
- externalCustomerGrowthRateMonthly

### Optional later inputs

- referralShareOfTraffic
- partnerLedLeadShare
- averagePartnerCandidatesPerActiveTeamMember
- averageNewCustomersFromPartnerLedActivity

## Definitions

### Visitor

Someone who enters the funnel.

### Lead

Someone who shows customer or partner intent.

### Customer

Someone who becomes a real customer signal in our system and contributes to the
commercial value around the Zinzino flow.

### Partner interest

Someone who shows meaningful partner intent.

### Team member

Someone who is part of our working team layer and uses our platform and model.

### Active team member

A team member who shows actual activity and contributes to customer or partner
movement, not just passive membership.

## Outputs

The first version should return a monthly projection timeline with:

- month
- projectedVisitors
- projectedLeads
- projectedCustomersThisMonth
- projectedPartnerInterest
- projectedSystemTeamMembersThisMonth
- projectedExternalTeamMembersThisMonth
- projectedNewTeamMembersThisMonth
- projectedTotalTeamMembers
- projectedActiveTeamMembers
- projectedCustomerBase
- projectedTeamLedShare

### Revenue / value proxy

Optional output:

- projectedValueProxy

This should be based on customer base and active team size, not presented as
official ZZ payout.

## Suggested Base Mechanics

### 1. Lead generation

projectedLeads = projectedVisitors * visitToLeadRate

### 2. System-created customer generation

projectedCustomersThisMonth = projectedLeads * leadToCustomerRate

### 3. Partner interest generation

projectedPartnerInterest = projectedLeads * leadToPartnerInterestRate

### 4. System-created team members

projectedSystemTeamMembersThisMonth =
projectedPartnerInterest * partnerInterestToTeamMemberRate

### 5. External team members

projectedExternalTeamMembersThisMonth =
monthlyExternalPartnerAdds * external growth factor

### 6. Total new team members

projectedNewTeamMembersThisMonth =
projectedSystemTeamMembersThisMonth + projectedExternalTeamMembersThisMonth

### 7. Total team size

Total team size must be cumulative.

This is different from new team members added in the current month.

### 8. Active team members

Each month:

- new active members come from:
  - system-created team members times activation rate
  - external team members times external activation rate
- existing active members are reduced by retention drop

### 9. Customer base

Customer base should be cumulative, built from:

- system-created customers
- external customer adds

Version 1 can assume low churn or ignore churn if we do not have enough signal
yet.

## Scenario Presets

The first version should support three presets.

### Low case

- lower traffic growth
- weaker lead conversion
- weaker team-member conversion
- lower activation
- lower retention

### Mid case

- stable improvement
- realistic conversion
- moderate activation
- moderate retention

### High case

- stronger inflow
- better conversion
- better activation
- better retention

These should be explicit and editable.

## Example Scenario Thinking

The engine should help us reason like this:

- if monthly visitors grow from 1,000 to 5,000 over time
- and visit to lead stays around 3%
- and lead to customer stays around 25%
- and lead to partner interest stays around 10%
- and 20% of partner interest becomes real team members
- and 25% of team members become active

what does the team look like after:

- 12 months
- 24 months
- 36 months
- 60 months

## Success Criteria

Growth Projection Engine v1 is successful if:

- it is easy to explain
- it helps us reason about scale honestly
- it keeps focus on machine quality, not payout fantasy
- it can be recalibrated as real data improves
- it is clearly separated from official ZZ logic

## Recommended Next Step

Before building code:

1. lock one low / mid / high scenario table
2. define default monthly assumptions
3. decide whether customer base should include churn in v1
4. then implement a small TypeScript engine

The first release should stay simple, explicit, and editable.

## Scenario Table v1

These are not promises.

They are working assumptions for internal planning.

### Low case

- monthlyVisitors: `1,000`
- trafficGrowthRateMonthly: `2%`
- visitToLeadRate: `2.0%`
- leadToCustomerRate: `20%`
- leadToPartnerInterestRate: `5%`
- partnerInterestToTeamMemberRate: `12%`
- teamMemberActivationRate: `18%`
- activeRetentionRate: `88%`
- averageCustomersPerActiveTeamMember: `4`
- monthlyExternalPartnerAdds: `1`
- externalPartnerGrowthRateMonthly: `1%`
- externalPartnerActivationRate: `30%`
- monthlyExternalCustomerAdds: `3`
- externalCustomerGrowthRateMonthly: `1%`

Interpretation:

- inflow exists, but conversion is still fairly weak
- some team members come in from both system and relationships, but few become truly active
- customer growth happens, but slowly

### Mid case

- monthlyVisitors: `2,500`
- trafficGrowthRateMonthly: `4%`
- visitToLeadRate: `3.0%`
- leadToCustomerRate: `28%`
- leadToPartnerInterestRate: `8%`
- partnerInterestToTeamMemberRate: `20%`
- teamMemberActivationRate: `25%`
- activeRetentionRate: `91%`
- averageCustomersPerActiveTeamMember: `6`
- monthlyExternalPartnerAdds: `4`
- externalPartnerGrowthRateMonthly: `2.5%`
- externalPartnerActivationRate: `40%`
- monthlyExternalCustomerAdds: `10`
- externalCustomerGrowthRateMonthly: `2%`

Interpretation:

- the machine is working
- customer and partner inflow are both meaningful
- external relationship-driven growth is material, not marginal
- a reasonable share of team members become active
- the team starts creating repeated movement instead of isolated spikes

### High case

- monthlyVisitors: `5,000`
- trafficGrowthRateMonthly: `6%`
- visitToLeadRate: `4.5%`
- leadToCustomerRate: `35%`
- leadToPartnerInterestRate: `12%`
- partnerInterestToTeamMemberRate: `28%`
- teamMemberActivationRate: `32%`
- activeRetentionRate: `94%`
- averageCustomersPerActiveTeamMember: `8`
- monthlyExternalPartnerAdds: `8`
- externalPartnerGrowthRateMonthly: `4%`
- externalPartnerActivationRate: `48%`
- monthlyExternalCustomerAdds: `18`
- externalCustomerGrowthRateMonthly: `3%`

Interpretation:

- inflow is strong and improving
- both customer and team conversion are clearly above average
- strong leaders are also adding meaningful external growth outside the system
- activation is materially better than in a typical manual team model
- active members begin to create real leverage

## What These Scenarios Should Produce

The first implementation should show projected outcomes at:

- 12 months
- 24 months
- 36 months
- 60 months

Each scenario should report at least:

- total visitors processed
- total leads created
- customers created this month
- total partner interest created
- new team members this month
- total team size
- active team members at each checkpoint
- total customer base at each checkpoint

## Default Interpretation Rules

When presenting results:

- low case = conservative but still functioning system
- mid case = realistic success case if the machine is working
- high case = strong execution case, not baseline expectation

The UI or docs must never present the high case as the default future.

## Versioning Note

These scenario values are placeholders for v2.

They should later be adjusted using real data from:

- actual traffic
- actual lead conversion
- actual customer signals
- actual partner-candidate flow
- actual activation and retention patterns
- actual external relationship-driven partner adds
- actual external customer adds
