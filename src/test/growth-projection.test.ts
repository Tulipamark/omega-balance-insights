import { describe, expect, it } from "vitest";
import {
  GROWTH_PROJECTION_SCENARIOS,
  normalizeGrowthProjectionScenario,
  runGrowthProjection,
} from "@/lib/growth-projection";

describe("growth projection", () => {
  it("normalizes invalid scenario values", () => {
    expect(
      normalizeGrowthProjectionScenario({
        name: "low",
        monthlyVisitors: -100,
        trafficGrowthRateMonthly: -0.1,
        visitToLeadRate: 2,
        leadToCustomerRate: -1,
      leadToPartnerInterestRate: 5,
      partnerInterestToTeamMemberRate: -2,
      teamMemberActivationRate: 3,
      activeRetentionRate: -4,
      averageCustomersPerActiveTeamMember: -5,
      monthlyExternalPartnerAdds: -2,
      externalPartnerGrowthRateMonthly: -0.5,
      externalPartnerActivationRate: 8,
      monthlyExternalCustomerAdds: -9,
      externalCustomerGrowthRateMonthly: -0.2,
    }),
    ).toEqual({
      name: "low",
      monthlyVisitors: 0,
      trafficGrowthRateMonthly: 0,
      visitToLeadRate: 1,
      leadToCustomerRate: 0,
      leadToPartnerInterestRate: 1,
      partnerInterestToTeamMemberRate: 0,
      teamMemberActivationRate: 1,
      activeRetentionRate: 0,
      averageCustomersPerActiveTeamMember: 0,
      monthlyExternalPartnerAdds: 0,
      externalPartnerGrowthRateMonthly: 0,
      externalPartnerActivationRate: 1,
      monthlyExternalCustomerAdds: 0,
      externalCustomerGrowthRateMonthly: 0,
    });
  });

  it("returns monthly data and selected checkpoints", () => {
    const result = runGrowthProjection(GROWTH_PROJECTION_SCENARIOS.mid, 12);

    expect(result.monthly).toHaveLength(12);
    expect(result.checkpoints.map((checkpoint) => checkpoint.month)).toEqual([12]);
  });

  it("grows visitors over time in the mid case", () => {
    const result = runGrowthProjection(GROWTH_PROJECTION_SCENARIOS.mid, 12);

    expect(result.monthly[11].projectedVisitors).toBeGreaterThan(result.monthly[0].projectedVisitors);
  });

  it("creates more output in the high case than the low case", () => {
    const low = runGrowthProjection(GROWTH_PROJECTION_SCENARIOS.low, 24);
    const high = runGrowthProjection(GROWTH_PROJECTION_SCENARIOS.high, 24);

    expect(high.monthly[23].projectedCustomerBase).toBeGreaterThan(low.monthly[23].projectedCustomerBase);
    expect(high.monthly[23].projectedActiveTeamMembers).toBeGreaterThan(low.monthly[23].projectedActiveTeamMembers);
    expect(high.monthly[23].projectedTotalTeamMembers).toBeGreaterThan(low.monthly[23].projectedTotalTeamMembers);
    expect(high.monthly[23].projectedValueProxy).toBeGreaterThan(low.monthly[23].projectedValueProxy);
  });

  it("tracks cumulative team size separately from new members", () => {
    const result = runGrowthProjection(GROWTH_PROJECTION_SCENARIOS.mid, 12);

    expect(result.monthly[11].projectedTotalTeamMembers).toBeGreaterThan(
      result.monthly[11].projectedNewTeamMembersThisMonth,
    );
  });
});
