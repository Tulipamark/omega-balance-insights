export type GrowthProjectionScenario = {
  name: "low" | "mid" | "high";
  monthlyVisitors: number;
  trafficGrowthRateMonthly: number;
  visitToLeadRate: number;
  leadToCustomerRate: number;
  leadToPartnerInterestRate: number;
  partnerInterestToTeamMemberRate: number;
  teamMemberActivationRate: number;
  activeRetentionRate: number;
  averageCustomersPerActiveTeamMember: number;
  monthlyExternalPartnerAdds: number;
  externalPartnerGrowthRateMonthly: number;
  externalPartnerActivationRate: number;
  monthlyExternalCustomerAdds: number;
  externalCustomerGrowthRateMonthly: number;
};

export type GrowthProjectionCheckpoint = {
  month: number;
  projectedVisitors: number;
  projectedLeads: number;
  projectedCustomersThisMonth: number;
  projectedPartnerInterest: number;
  projectedSystemTeamMembersThisMonth: number;
  projectedExternalTeamMembersThisMonth: number;
  projectedNewTeamMembersThisMonth: number;
  projectedTotalTeamMembers: number;
  projectedActiveTeamMembers: number;
  projectedCustomerBase: number;
  projectedTeamLedShare: number;
  projectedValueProxy: number;
};

export type GrowthProjectionResult = {
  scenario: GrowthProjectionScenario;
  monthly: GrowthProjectionCheckpoint[];
  checkpoints: GrowthProjectionCheckpoint[];
};

export const GROWTH_PROJECTION_SCENARIOS: Record<GrowthProjectionScenario["name"], GrowthProjectionScenario> = {
  low: {
    name: "low",
    monthlyVisitors: 1000,
    trafficGrowthRateMonthly: 0.02,
    visitToLeadRate: 0.02,
    leadToCustomerRate: 0.2,
    leadToPartnerInterestRate: 0.05,
    partnerInterestToTeamMemberRate: 0.12,
    teamMemberActivationRate: 0.18,
    activeRetentionRate: 0.88,
    averageCustomersPerActiveTeamMember: 4,
    monthlyExternalPartnerAdds: 1,
    externalPartnerGrowthRateMonthly: 0.01,
    externalPartnerActivationRate: 0.3,
    monthlyExternalCustomerAdds: 3,
    externalCustomerGrowthRateMonthly: 0.01,
  },
  mid: {
    name: "mid",
    monthlyVisitors: 2500,
    trafficGrowthRateMonthly: 0.04,
    visitToLeadRate: 0.03,
    leadToCustomerRate: 0.28,
    leadToPartnerInterestRate: 0.08,
    partnerInterestToTeamMemberRate: 0.2,
    teamMemberActivationRate: 0.25,
    activeRetentionRate: 0.91,
    averageCustomersPerActiveTeamMember: 6,
    monthlyExternalPartnerAdds: 4,
    externalPartnerGrowthRateMonthly: 0.025,
    externalPartnerActivationRate: 0.4,
    monthlyExternalCustomerAdds: 10,
    externalCustomerGrowthRateMonthly: 0.02,
  },
  high: {
    name: "high",
    monthlyVisitors: 5000,
    trafficGrowthRateMonthly: 0.06,
    visitToLeadRate: 0.045,
    leadToCustomerRate: 0.35,
    leadToPartnerInterestRate: 0.12,
    partnerInterestToTeamMemberRate: 0.28,
    teamMemberActivationRate: 0.32,
    activeRetentionRate: 0.94,
    averageCustomersPerActiveTeamMember: 8,
    monthlyExternalPartnerAdds: 8,
    externalPartnerGrowthRateMonthly: 0.04,
    externalPartnerActivationRate: 0.48,
    monthlyExternalCustomerAdds: 18,
    externalCustomerGrowthRateMonthly: 0.03,
  },
};

function clampRate(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function clampPositive(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function roundMetric(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeGrowthProjectionScenario(input: GrowthProjectionScenario): GrowthProjectionScenario {
  return {
    ...input,
    monthlyVisitors: clampPositive(input.monthlyVisitors),
    trafficGrowthRateMonthly: clampPositive(input.trafficGrowthRateMonthly),
    visitToLeadRate: clampRate(input.visitToLeadRate),
    leadToCustomerRate: clampRate(input.leadToCustomerRate),
    leadToPartnerInterestRate: clampRate(input.leadToPartnerInterestRate),
    partnerInterestToTeamMemberRate: clampRate(input.partnerInterestToTeamMemberRate),
    teamMemberActivationRate: clampRate(input.teamMemberActivationRate),
    activeRetentionRate: clampRate(input.activeRetentionRate),
    averageCustomersPerActiveTeamMember: clampPositive(input.averageCustomersPerActiveTeamMember),
    monthlyExternalPartnerAdds: clampPositive(input.monthlyExternalPartnerAdds),
    externalPartnerGrowthRateMonthly: clampPositive(input.externalPartnerGrowthRateMonthly),
    externalPartnerActivationRate: clampRate(input.externalPartnerActivationRate),
    monthlyExternalCustomerAdds: clampPositive(input.monthlyExternalCustomerAdds),
    externalCustomerGrowthRateMonthly: clampPositive(input.externalCustomerGrowthRateMonthly),
  };
}

export function runGrowthProjection(
  scenario: GrowthProjectionScenario,
  months = 60,
  checkpointMonths = [12, 24, 36, 60],
): GrowthProjectionResult {
  const normalized = normalizeGrowthProjectionScenario(scenario);
  const monthly: GrowthProjectionCheckpoint[] = [];

  let totalTeamMembers = 0;
  let activeTeamMembers = 0;
  let customerBase = 0;

  for (let month = 1; month <= months; month += 1) {
    const trafficGrowthFactor = Math.pow(1 + normalized.trafficGrowthRateMonthly, month - 1);
    const externalPartnerGrowthFactor = Math.pow(1 + normalized.externalPartnerGrowthRateMonthly, month - 1);
    const externalCustomerGrowthFactor = Math.pow(1 + normalized.externalCustomerGrowthRateMonthly, month - 1);

    const projectedVisitors = normalized.monthlyVisitors * trafficGrowthFactor;
    const projectedLeads = projectedVisitors * normalized.visitToLeadRate;
    const projectedCustomersThisMonth = projectedLeads * normalized.leadToCustomerRate;
    const projectedPartnerInterest = projectedLeads * normalized.leadToPartnerInterestRate;
    const projectedSystemTeamMembersThisMonth =
      projectedPartnerInterest * normalized.partnerInterestToTeamMemberRate;
    const projectedExternalTeamMembersThisMonth =
      normalized.monthlyExternalPartnerAdds * externalPartnerGrowthFactor;
    const projectedNewTeamMembersThisMonth =
      projectedSystemTeamMembersThisMonth + projectedExternalTeamMembersThisMonth;
    const projectedExternalCustomersThisMonth =
      normalized.monthlyExternalCustomerAdds * externalCustomerGrowthFactor;

    const newlyActiveFromSystem =
      projectedSystemTeamMembersThisMonth * normalized.teamMemberActivationRate;
    const newlyActiveFromExternal =
      projectedExternalTeamMembersThisMonth * normalized.externalPartnerActivationRate;

    totalTeamMembers += projectedNewTeamMembersThisMonth;
    activeTeamMembers =
      activeTeamMembers * normalized.activeRetentionRate +
      newlyActiveFromSystem +
      newlyActiveFromExternal;
    customerBase += projectedCustomersThisMonth + projectedExternalCustomersThisMonth;

    const potentialTeamLedCustomers = activeTeamMembers * normalized.averageCustomersPerActiveTeamMember;
    const projectedTeamLedShare =
      customerBase > 0 ? Math.min(1, potentialTeamLedCustomers / customerBase) : 0;
    const projectedValueProxy = customerBase + potentialTeamLedCustomers;

    monthly.push({
      month,
      projectedVisitors: roundMetric(projectedVisitors),
      projectedLeads: roundMetric(projectedLeads),
      projectedCustomersThisMonth: roundMetric(projectedCustomersThisMonth + projectedExternalCustomersThisMonth),
      projectedPartnerInterest: roundMetric(projectedPartnerInterest),
      projectedSystemTeamMembersThisMonth: roundMetric(projectedSystemTeamMembersThisMonth),
      projectedExternalTeamMembersThisMonth: roundMetric(projectedExternalTeamMembersThisMonth),
      projectedNewTeamMembersThisMonth: roundMetric(projectedNewTeamMembersThisMonth),
      projectedTotalTeamMembers: roundMetric(totalTeamMembers),
      projectedActiveTeamMembers: roundMetric(activeTeamMembers),
      projectedCustomerBase: roundMetric(customerBase),
      projectedTeamLedShare: roundMetric(projectedTeamLedShare),
      projectedValueProxy: roundMetric(projectedValueProxy),
    });
  }

  const checkpoints = checkpointMonths
    .filter((month) => month > 0 && month <= months)
    .map((month) => monthly[month - 1]);

  return {
    scenario: normalized,
    monthly,
    checkpoints,
  };
}
