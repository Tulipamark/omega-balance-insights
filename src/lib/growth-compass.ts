export type PartnerProgressInput = {
  personalCustomers30d: number;
  recruitedPartners30d: number;
  activeFirstLinePartners30d: number;
  partnerGeneratedLeads30d: number;
  partnerGeneratedCustomers30d: number;
};

export type PartnerStatus =
  | "inactive"
  | "active"
  | "growing"
  | "duplicating"
  | "leader-track";

export type GrowthCompassFlag =
  | "no-current-activity"
  | "personal-activity-present"
  | "recruiting-started"
  | "first-line-not-active"
  | "duplication-started"
  | "partner-generated-customers-present"
  | "momentum-fragile"
  | "leader-signal";

export type GrowthCompassResult = {
  status: PartnerStatus;
  score: number;
  nextMilestone: string;
  nextBestAction: string;
  explanation: string;
  flags: GrowthCompassFlag[];
  missingToNext: string[];
};

function clampNonNegative(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function normalizeGrowthCompassInput(input: PartnerProgressInput): PartnerProgressInput {
  return {
    personalCustomers30d: clampNonNegative(input.personalCustomers30d),
    recruitedPartners30d: clampNonNegative(input.recruitedPartners30d),
    activeFirstLinePartners30d: clampNonNegative(input.activeFirstLinePartners30d),
    partnerGeneratedLeads30d: clampNonNegative(input.partnerGeneratedLeads30d),
    partnerGeneratedCustomers30d: clampNonNegative(input.partnerGeneratedCustomers30d),
  };
}

export function calculateGrowthCompassScore(input: PartnerProgressInput) {
  const normalized = normalizeGrowthCompassInput(input);

  return (
    normalized.personalCustomers30d * 10 +
    normalized.recruitedPartners30d * 12 +
    normalized.activeFirstLinePartners30d * 20 +
    normalized.partnerGeneratedLeads30d * 6 +
    normalized.partnerGeneratedCustomers30d * 15
  );
}

export function getGrowthCompassStatus(input: PartnerProgressInput): PartnerStatus {
  const normalized = normalizeGrowthCompassInput(input);
  const hasPersonalActivity = normalized.personalCustomers30d > 0 || normalized.recruitedPartners30d > 0;
  const hasMeaningfulGrowth =
    normalized.personalCustomers30d >= 2 ||
    normalized.recruitedPartners30d >= 2;
  const hasEarlyTeamSignal =
    normalized.activeFirstLinePartners30d >= 1 ||
    normalized.partnerGeneratedLeads30d >= 1;
  const hasDuplication =
    normalized.activeFirstLinePartners30d >= 2 &&
    (normalized.partnerGeneratedLeads30d >= 3 || normalized.partnerGeneratedCustomers30d >= 1);
  const hasLeaderSignal =
    normalized.activeFirstLinePartners30d >= 3 &&
    (normalized.partnerGeneratedLeads30d >= 5 || normalized.partnerGeneratedCustomers30d >= 2) &&
    hasPersonalActivity;

  if (
    !hasPersonalActivity &&
    normalized.activeFirstLinePartners30d === 0 &&
    normalized.partnerGeneratedLeads30d === 0 &&
    normalized.partnerGeneratedCustomers30d === 0
  ) {
    return "inactive";
  }

  if (hasLeaderSignal) {
    return "leader-track";
  }

  if (hasDuplication) {
    return "duplicating";
  }

  if (hasMeaningfulGrowth && hasEarlyTeamSignal) {
    return "growing";
  }

  return "active";
}

export function getGrowthCompassFlags(input: PartnerProgressInput, status?: PartnerStatus): GrowthCompassFlag[] {
  const normalized = normalizeGrowthCompassInput(input);
  const resolvedStatus = status ?? getGrowthCompassStatus(normalized);
  const flags = new Set<GrowthCompassFlag>();
  const hasPersonalActivity = normalized.personalCustomers30d > 0 || normalized.recruitedPartners30d > 0;

  if (!hasPersonalActivity && normalized.activeFirstLinePartners30d === 0 && normalized.partnerGeneratedLeads30d === 0 && normalized.partnerGeneratedCustomers30d === 0) {
    flags.add("no-current-activity");
  }

  if (hasPersonalActivity) {
    flags.add("personal-activity-present");
  }

  if (normalized.recruitedPartners30d > 0) {
    flags.add("recruiting-started");
  }

  if (normalized.recruitedPartners30d > 0 && normalized.activeFirstLinePartners30d === 0) {
    flags.add("first-line-not-active");
  }

  if (normalized.partnerGeneratedLeads30d > 0) {
    flags.add("duplication-started");
  }

  if (normalized.partnerGeneratedCustomers30d > 0) {
    flags.add("partner-generated-customers-present");
  }

  if (resolvedStatus === "active" || resolvedStatus === "growing") {
    flags.add("momentum-fragile");
  }

  if (resolvedStatus === "leader-track") {
    flags.add("leader-signal");
  }

  return [...flags];
}

function getNextMilestone(input: PartnerProgressInput, status: PartnerStatus) {
  const normalized = normalizeGrowthCompassInput(input);

  switch (status) {
    case "inactive":
      return "Get the first customer or recruit the first partner";
    case "active":
      if (normalized.personalCustomers30d < 2) {
        return "Get the second personal customer";
      }
      if (normalized.recruitedPartners30d < 2) {
        return "Recruit the second partner";
      }
      return "Activate the first first-line partner";
    case "growing":
      if (normalized.activeFirstLinePartners30d < 2) {
        return "Activate 1 more first-line partner";
      }
      if (normalized.partnerGeneratedCustomers30d < 1) {
        return "Help the team generate the first partner-driven customer";
      }
      return "Reach 3 partner-generated leads";
    case "duplicating":
      if (normalized.activeFirstLinePartners30d < 3) {
        return "Activate a third first-line partner";
      }
      return "Sustain partner-generated inflow across the next cycle";
    case "leader-track":
      return "Increase the number of active first-line partners without losing personal momentum";
  }
}

function getMissingToNext(input: PartnerProgressInput, status: PartnerStatus): string[] {
  const normalized = normalizeGrowthCompassInput(input);
  const missing: string[] = [];

  switch (status) {
    case "inactive":
      if (normalized.personalCustomers30d < 1) {
        missing.push("1 personlig kund");
      }
      if (normalized.recruitedPartners30d < 1) {
        missing.push("1 rekryterad partner");
      }
      return missing;
    case "active":
      if (normalized.personalCustomers30d < 2) {
        missing.push(`${2 - normalized.personalCustomers30d} kund till`);
      }
      if (normalized.recruitedPartners30d < 2) {
        missing.push(`${2 - normalized.recruitedPartners30d} partner till`);
      }
      if (normalized.activeFirstLinePartners30d < 1) {
        missing.push("1 aktiv first-line-partner");
      }
      return missing;
    case "growing":
      if (normalized.activeFirstLinePartners30d < 2) {
        missing.push(`${2 - normalized.activeFirstLinePartners30d} aktiv first-line-partner`);
      }
      if (normalized.partnerGeneratedLeads30d < 3 && normalized.partnerGeneratedCustomers30d < 1) {
        missing.push("partnergenererat inflöde");
      }
      return missing;
    case "duplicating":
      if (normalized.activeFirstLinePartners30d < 3) {
        missing.push(`${3 - normalized.activeFirstLinePartners30d} aktiv first-line-partner`);
      }
      if (normalized.partnerGeneratedLeads30d < 5 && normalized.partnerGeneratedCustomers30d < 2) {
        missing.push("starkare partnerdriven aktivitet");
      }
      if (normalized.personalCustomers30d < 1 && normalized.recruitedPartners30d < 1) {
        missing.push("egen aktivitet denna period");
      }
      return missing;
    case "leader-track":
      return ["behåll stabil aktivitet i first line", "fortsätt bygga med fart och kvalitet"];
  }
}

function getNextBestAction(status: PartnerStatus) {
  switch (status) {
    case "inactive":
      return "Focus on one first result: your first customer or your first recruited partner.";
    case "active":
      return "Repeat your first success and avoid stopping after one result.";
    case "growing":
      return "Shift attention from personal production to activating first-line partners.";
    case "duplicating":
      return "Strengthen consistency in partner-generated leads and customers.";
    case "leader-track":
      return "Protect momentum and expand the number of active first-line partners.";
  }
}

function getExplanation(input: PartnerProgressInput, status: PartnerStatus) {
  const normalized = normalizeGrowthCompassInput(input);

  switch (status) {
    case "inactive":
      return "There is no meaningful recent activity yet, so the model sees no forward movement.";
    case "active":
      return "There is personal movement, but the activity is still mostly driven by the individual.";
    case "growing":
      return "There is repeated personal traction and early signs that the partner is building beyond a single test.";
    case "duplicating":
      return "First-line partners are active and some inflow is starting to come through others.";
    case "leader-track":
      return normalized.partnerGeneratedCustomers30d > 0
        ? "The partner shows real duplication, active first-line depth, and downstream customer activity."
        : "The partner shows strong first-line activation and sustained duplication signals.";
  }
}

export function evaluateGrowthCompass(input: PartnerProgressInput): GrowthCompassResult {
  const normalized = normalizeGrowthCompassInput(input);
  const status = getGrowthCompassStatus(normalized);
  const score = calculateGrowthCompassScore(normalized);

  return {
    status,
    score,
    nextMilestone: getNextMilestone(normalized, status),
    nextBestAction: getNextBestAction(status),
    explanation: getExplanation(normalized, status),
    flags: getGrowthCompassFlags(normalized, status),
    missingToNext: getMissingToNext(normalized, status),
  };
}
