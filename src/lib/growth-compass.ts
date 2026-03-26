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

function hasAnyActivity(input: PartnerProgressInput) {
  return (
    input.personalCustomers30d > 0 ||
    input.recruitedPartners30d > 0 ||
    input.activeFirstLinePartners30d > 0 ||
    input.partnerGeneratedLeads30d > 0 ||
    input.partnerGeneratedCustomers30d > 0
  );
}

function hasPersonalActivity(input: PartnerProgressInput) {
  return input.personalCustomers30d > 0 || input.recruitedPartners30d > 0;
}

function hasRepeatedPersonalActivity(input: PartnerProgressInput) {
  return input.personalCustomers30d >= 2 || input.recruitedPartners30d >= 2;
}

function hasEarlyTeamSignal(input: PartnerProgressInput) {
  return (
    input.activeFirstLinePartners30d >= 1 ||
    input.partnerGeneratedLeads30d >= 1 ||
    input.partnerGeneratedCustomers30d >= 1
  );
}

function hasDuplicationSignal(input: PartnerProgressInput) {
  return (
    input.activeFirstLinePartners30d >= 2 &&
    (input.partnerGeneratedLeads30d >= 3 || input.partnerGeneratedCustomers30d >= 1)
  );
}

function hasLeaderSignal(input: PartnerProgressInput) {
  return (
    input.activeFirstLinePartners30d >= 3 &&
    (input.partnerGeneratedLeads30d >= 5 || input.partnerGeneratedCustomers30d >= 2) &&
    hasPersonalActivity(input)
  );
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

  if (!hasAnyActivity(normalized)) {
    return "inactive";
  }

  if (hasLeaderSignal(normalized)) {
    return "leader-track";
  }

  if (hasDuplicationSignal(normalized)) {
    return "duplicating";
  }

  if (hasRepeatedPersonalActivity(normalized) && hasEarlyTeamSignal(normalized)) {
    return "growing";
  }

  return "active";
}

export function getGrowthCompassFlags(input: PartnerProgressInput, status?: PartnerStatus): GrowthCompassFlag[] {
  const normalized = normalizeGrowthCompassInput(input);
  const resolvedStatus = status ?? getGrowthCompassStatus(normalized);
  const flags = new Set<GrowthCompassFlag>();

  if (!hasAnyActivity(normalized)) {
    flags.add("no-current-activity");
  }

  if (hasPersonalActivity(normalized)) {
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
      return "Skapa den första startsignalen: första kunden eller första rekryterade partnern.";
    case "active":
      if (!hasRepeatedPersonalActivity(normalized) && !hasEarlyTeamSignal(normalized)) {
        return "Upprepa första resultatet och skapa den första first-line-signalen.";
      }

      if (!hasRepeatedPersonalActivity(normalized)) {
        return "Upprepa första resultatet så att aktiviteten inte bara blir en engångsspik.";
      }

      return "Aktivera den första first-line-partnern eller skapa den första partnerdrivna signalen.";
    case "growing":
      if (normalized.activeFirstLinePartners30d < 2) {
        return "Aktivera en andra first-line-partner.";
      }

      if (normalized.partnerGeneratedCustomers30d < 1) {
        return "Hjälp teamet att skapa den första partnergenererade kunden.";
      }

      return "Nå ett jämnt partnergenererat inflöde, med start i 3 partnergenererade leads.";
    case "duplicating":
      if (normalized.activeFirstLinePartners30d < 3) {
        return "Aktivera en tredje first-line-partner.";
      }

      return "Stabilisera det partnergenererade inflödet över nästa cykel.";
    case "leader-track":
      return "Stabilisera strukturen utan att tappa egen närvaro och fart.";
  }
}

function getMissingToNext(input: PartnerProgressInput, status: PartnerStatus): string[] {
  const normalized = normalizeGrowthCompassInput(input);
  const missing: string[] = [];

  switch (status) {
    case "inactive":
      return ["1 första kund eller 1 första rekryterad partner"];
    case "active":
      if (!hasRepeatedPersonalActivity(normalized)) {
        if (normalized.personalCustomers30d > 0 && normalized.personalCustomers30d < 2) {
          missing.push(`${2 - normalized.personalCustomers30d} kund till för upprepad egen aktivitet`);
        } else if (normalized.recruitedPartners30d > 0 && normalized.recruitedPartners30d < 2) {
          missing.push(`${2 - normalized.recruitedPartners30d} partner till för upprepad rekrytering`);
        } else {
          missing.push("ett andra personligt resultat");
        }
      }

      if (!hasEarlyTeamSignal(normalized)) {
        missing.push("1 first-line-signal");
      }

      return missing;
    case "growing":
      if (normalized.activeFirstLinePartners30d < 2) {
        missing.push(`${2 - normalized.activeFirstLinePartners30d} aktiv first-line-partner till`);
      }

      if (normalized.partnerGeneratedCustomers30d < 1 && normalized.partnerGeneratedLeads30d < 3) {
        missing.push("1 partnergenererad kund eller 3 partnergenererade leads");
      }

      return missing;
    case "duplicating":
      if (normalized.activeFirstLinePartners30d < 3) {
        missing.push(`${3 - normalized.activeFirstLinePartners30d} aktiv first-line-partner till`);
      }

      if (normalized.partnerGeneratedLeads30d < 5 && normalized.partnerGeneratedCustomers30d < 2) {
        missing.push("stabilare partnerdrivet inflöde");
      }

      if (!hasPersonalActivity(normalized)) {
        missing.push("egen aktivitet denna period");
      }

      return missing;
    case "leader-track":
      return [
        "en bredare aktiv first line",
        "fortsatt partnerdrivet inflöde",
        "stabilitet över flera perioder",
      ];
  }
}

function getNextBestAction(status: PartnerStatus) {
  switch (status) {
    case "inactive":
      return "Fokusera på ett första resultat: din första kund eller din första rekryterade partner.";
    case "active":
      return "Upprepa första resultatet innan du lägger på mer komplexitet, och sök sedan den första first-line-signalen.";
    case "growing":
      return "Flytta fokus från egen produktion till first-line-aktivering så att beteendet kan börja upprepas genom andra.";
    case "duplicating":
      return "Stärk jämnheten i partnergenererade leads och kunder så att strukturen håller bortom en enskild topp.";
    case "leader-track":
      return "Skydda momentumet, behåll egen närvaro och stabilisera den partnerdrivna aktiviteten över mer än en cykel.";
  }
}

function getExplanation(input: PartnerProgressInput, status: PartnerStatus) {
  const normalized = normalizeGrowthCompassInput(input);

  switch (status) {
    case "inactive":
      return "Det finns ännu ingen tydlig ny startsignal, så modellen ser ingen aktuell rörelse att bygga vidare på.";
    case "active":
      return "Det finns verklig rörelse, men den är fortfarande främst personlig och ännu inte stark nog för att räknas som tidigt systembeteende.";
    case "growing":
      return "Det finns upprepad aktivitet och en tidig first-line-signal, vilket tyder på att partnern är på väg bort från ett rent enpersonsläge.";
    case "duplicating":
      return "Aktiva first-line-partners och partnergenererat inflöde tyder på att beteendet börjar dupliceras genom andra.";
    case "leader-track":
      return normalized.partnerGeneratedCustomers30d > 0
        ? "Partnern visar aktiv first-line-bredd, verklig duplicering och kundutfall längre ned i teamet."
        : "Partnern visar stark aktiv first-line-bredd och partnerdrivet inflöde, men behöver fortfarande visa stabilitet över tid.";
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
