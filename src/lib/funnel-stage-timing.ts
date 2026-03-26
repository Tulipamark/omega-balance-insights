import type { AdminPartnerRow, FunnelEvent, GrowthCompassRow, Lead } from "@/lib/omega-types";

const LANDING_EVENTS = new Set(["landing_viewed"]);
const CTA_EVENTS = new Set([
  "hero_primary_cta_clicked",
  "hero_secondary_cta_clicked",
  "sticky_cta_clicked",
  "closing_cta_clicked",
  "partner_hero_primary_cta_clicked",
  "partner_sticky_cta_clicked",
]);
const FORM_START_EVENTS = new Set(["lead_form_started", "partner_form_started"]);
const FORM_SUBMIT_EVENTS = new Set(["lead_form_submitted", "partner_form_submitted"]);

export interface FunnelTimingStepInsight {
  key: string;
  label: string;
  description: string;
  fromCount: number;
  completionCount: number;
  completionRatePct: number;
  medianSeconds: number | null;
  averageSeconds: number | null;
}

export interface FunnelTimingInsights {
  sessionsAnalyzed: number;
  steps: FunnelTimingStepInsight[];
  headline: {
    title: string;
    summary: string;
    nextAction: string;
  };
}

export interface PartnerLifecycleTimingInsights {
  recordsAnalyzed: number;
  steps: FunnelTimingStepInsight[];
  headline: {
    title: string;
    summary: string;
    nextAction: string;
  };
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function getAverage(values: number[]) {
  if (!values.length) {
    return null;
  }

  return roundToOneDecimal(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getMedian(values: number[]) {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return roundToOneDecimal((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return roundToOneDecimal(sorted[middle]);
}

function getFirstTimestamp(events: FunnelEvent[], names: Set<string>, afterTimestamp?: number) {
  for (const event of events) {
    if (!names.has(event.event_name)) {
      continue;
    }

    const timestamp = new Date(event.created_at).getTime();
    if (typeof afterTimestamp === "number" && timestamp <= afterTimestamp) {
      continue;
    }

    return timestamp;
  }

  return null;
}

function getTimestamp(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getEarliestTimestamp(...values: Array<number | null | undefined>) {
  const validValues = values.filter((value): value is number => typeof value === "number");
  if (!validValues.length) {
    return null;
  }

  return Math.min(...validValues);
}

function getLeadPartnerPriority(lead: Lead) {
  const value = lead.details?.partner_priority;
  return value === "hot" || value === "follow_up" || value === "not_now" ? value : null;
}

function getLeadAdminNote(lead: Lead) {
  const value = lead.details?.admin_note;
  return typeof value === "string" ? value.trim() : "";
}

function hasInternalReview(lead: Lead) {
  return getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).length > 0;
}

function getLeadTeamIntentConfirmed(lead: Lead) {
  return lead.details?.team_intent_confirmed === true;
}

function getLeadZinzinoVerified(lead: Lead) {
  return lead.status === "active" || lead.details?.zinzino_verified === true;
}

function isCandidate(lead: Lead) {
  return hasInternalReview(lead) || getLeadZinzinoVerified(lead) || getLeadTeamIntentConfirmed(lead) || lead.status === "qualified";
}

function isReviewReady(lead: Lead) {
  return lead.status === "active" || (hasInternalReview(lead) && getLeadZinzinoVerified(lead) && getLeadTeamIntentConfirmed(lead));
}

function getLeadReviewUpdatedTimestamp(lead: Lead) {
  return getTimestamp(lead.details?.review_updated_at);
}

function getLeadCandidateTimestamp(lead: Lead) {
  if (!isCandidate(lead)) {
    return null;
  }

  return getEarliestTimestamp(
    getLeadReviewUpdatedTimestamp(lead),
    lead.status === "qualified" || lead.status === "active" ? getTimestamp(lead.updated_at) : null,
  );
}

function getLeadReviewReadyTimestamp(lead: Lead) {
  if (!isReviewReady(lead)) {
    return null;
  }

  return getEarliestTimestamp(
    getLeadReviewUpdatedTimestamp(lead),
    lead.status === "active" ? getTimestamp(lead.updated_at) : null,
  );
}

function getPartnerLinksReadyTimestamp(partner: AdminPartnerRow) {
  if (!partner.zzLinksReady) {
    return null;
  }

  return getTimestamp(partner.verifiedAt);
}

function getPartnerActiveSignalTimestamp(partner: AdminPartnerRow, growthByPartnerId: Map<string, GrowthCompassRow>) {
  const row = growthByPartnerId.get(partner.partnerId);
  if (!row || row.status === "inactive") {
    return null;
  }

  return getTimestamp(row.firstActiveSignalAt);
}

function buildStepInsight(
  key: string,
  label: string,
  description: string,
  sessions: FunnelEvent[][],
  fromNames: Set<string>,
  toNames: Set<string>,
): FunnelTimingStepInsight {
  const durations: number[] = [];
  let fromCount = 0;

  sessions.forEach((events) => {
    const fromTimestamp = getFirstTimestamp(events, fromNames);
    if (fromTimestamp === null) {
      return;
    }

    fromCount += 1;
    const toTimestamp = getFirstTimestamp(events, toNames, fromTimestamp);
    if (toTimestamp === null) {
      return;
    }

    durations.push((toTimestamp - fromTimestamp) / 1000);
  });

  return {
    key,
    label,
    description,
    fromCount,
    completionCount: durations.length,
    completionRatePct: fromCount ? roundToOneDecimal((durations.length / fromCount) * 100) : 0,
    medianSeconds: getMedian(durations),
    averageSeconds: getAverage(durations),
  };
}

function buildRecordStepInsight<T>(
  key: string,
  label: string,
  description: string,
  records: T[],
  getFromTimestamp: (record: T) => number | null,
  getToTimestamp: (record: T) => number | null,
): FunnelTimingStepInsight {
  const durations: number[] = [];
  let fromCount = 0;

  records.forEach((record) => {
    const fromTimestamp = getFromTimestamp(record);
    if (fromTimestamp === null) {
      return;
    }

    fromCount += 1;
    const toTimestamp = getToTimestamp(record);
    if (toTimestamp === null || toTimestamp < fromTimestamp) {
      return;
    }

    durations.push((toTimestamp - fromTimestamp) / 1000);
  });

  return {
    key,
    label,
    description,
    fromCount,
    completionCount: durations.length,
    completionRatePct: fromCount ? roundToOneDecimal((durations.length / fromCount) * 100) : 0,
    medianSeconds: getMedian(durations),
    averageSeconds: getAverage(durations),
  };
}

function getNextAction(step: FunnelTimingStepInsight) {
  switch (step.key) {
    case "landing_to_cta":
      return "Se över hero-copy, tydlighet i första CTA och om landningen snabbt förklarar nästa steg.";
    case "cta_to_form_start":
      return "Minska friktionen mellan klick och formulär genom tydligare förväntan, enklare övergång och bättre mobilkänsla.";
    case "form_start_to_submit":
      return "Gör formuläret lättare att slutföra och följ upp validering, felmeddelanden och input-hjälp.";
    case "partner_lead_to_candidate":
      return "Kort ned tiden till första riktiga bedömning så att nya partnerleads snabbt får prioritet och riktning.";
    case "candidate_to_ready":
      return "Driv snabbare mot tydligt ja, ZZ-bekräftelse och teamavsikt så att onboarding kan starta utan friktion.";
    case "portal_partner_to_links_ready":
      return "Lås setup direkt efter portalstart så att test-, shop- och partnerlänk blir klara innan momentum tappas.";
    default:
      return "Fortsätt minska friktionen i nästa steg.";
  }
}

export function buildFunnelStageTimingInsights(events: FunnelEvent[]): FunnelTimingInsights {
  const sessions = [...events.reduce((map, event) => {
    if (!event.session_id) {
      return map;
    }

    const list = map.get(event.session_id) || [];
    list.push(event);
    map.set(event.session_id, list);
    return map;
  }, new Map<string, FunnelEvent[]>()).values()]
    .map((sessionEvents) => [...sessionEvents].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));

  const steps = [
    buildStepInsight(
      "landing_to_cta",
      "Landning till CTA-klick",
      "Hur snabbt första besöket blir till ett konkret klick på nästa steg.",
      sessions,
      LANDING_EVENTS,
      CTA_EVENTS,
    ),
    buildStepInsight(
      "cta_to_form_start",
      "CTA-klick till formstart",
      "Hur snabbt klicket blir till faktisk aktivitet i kund- eller partnerformuläret.",
      sessions,
      CTA_EVENTS,
      FORM_START_EVENTS,
    ),
    buildStepInsight(
      "form_start_to_submit",
      "Formstart till skickat formulär",
      "Hur lätt det är att ta sig från påbörjat formulär till färdigt submit.",
      sessions,
      FORM_START_EVENTS,
      FORM_SUBMIT_EVENTS,
    ),
  ];

  const measuredSteps = steps.filter((step) => step.fromCount > 0);
  const topFrictionStep = measuredSteps.length
    ? [...measuredSteps].sort((a, b) => {
        if (a.completionRatePct !== b.completionRatePct) {
          return a.completionRatePct - b.completionRatePct;
        }

        return (b.medianSeconds || 0) - (a.medianSeconds || 0);
      })[0]
    : null;

  const headline = topFrictionStep
    ? {
        title: `Störst tidsfriktion: ${topFrictionStep.label}`,
        summary: `${topFrictionStep.completionCount} av ${topFrictionStep.fromCount} uppmätta sessioner tog sig vidare i detta steg. Medianen ligger på ${
          topFrictionStep.medianSeconds !== null ? `${roundToOneDecimal(topFrictionStep.medianSeconds)} sek` : "okänd tid"
        }.`,
        nextAction: getNextAction(topFrictionStep),
      }
    : {
        title: "Ingen ledtidsdata än",
        summary: "Det finns än så länge inte tillräckligt många sammanhängande sessioner för att räkna ledtid mellan stegen.",
        nextAction: "Skapa några riktiga testflöden så börjar den här sektionen fyllas med mätbar friktion.",
      };

  return {
    sessionsAnalyzed: sessions.length,
    steps,
    headline,
  };
}

export function buildPartnerLifecycleTimingInsights(
  data: Pick<{ partnerApplications: Lead[]; partners: AdminPartnerRow[]; growthCompass: GrowthCompassRow[] }, "partnerApplications" | "partners" | "growthCompass">,
): PartnerLifecycleTimingInsights {
  const growthByPartnerId = new Map(data.growthCompass.map((row) => [row.partnerId, row]));
  const steps = [
    buildRecordStepInsight(
      "partner_lead_to_candidate",
      "Partnerlead till kandidat",
      "Hur snabbt en ny partnerlead får sin första verkliga interna bedömning eller progressignal.",
      data.partnerApplications,
      (lead) => getTimestamp(lead.created_at),
      getLeadCandidateTimestamp,
    ),
    buildRecordStepInsight(
      "candidate_to_ready",
      "Kandidat till onboarding redo",
      "Hur lång tid det tar att gå från påbörjad bedömning till att allt är bekräftat för portalstart.",
      data.partnerApplications,
      getLeadCandidateTimestamp,
      getLeadReviewReadyTimestamp,
    ),
    buildRecordStepInsight(
      "portal_partner_to_links_ready",
      "Portalpartner till 3 länkar klara",
      "Hur snabbt ett nytt partnerkonto får komplett ZZ-setup för test, shop och partner.",
      data.partners,
      (partner) => getTimestamp(partner.createdAt),
      getPartnerLinksReadyTimestamp,
    ),
    buildRecordStepInsight(
      "links_ready_to_active_signal",
      "3 länkar till aktiv signal",
      "Hur snabbt komplett setup blir till första verkliga aktivitet som syns i Growth Compass.",
      data.partners,
      getPartnerLinksReadyTimestamp,
      (partner) => getPartnerActiveSignalTimestamp(partner, growthByPartnerId),
    ),
  ];

  const measuredSteps = steps.filter((step) => step.fromCount > 0);
  const topFrictionStep = measuredSteps.length
    ? [...measuredSteps].sort((a, b) => {
        if (a.completionRatePct !== b.completionRatePct) {
          return a.completionRatePct - b.completionRatePct;
        }

        return (b.medianSeconds || 0) - (a.medianSeconds || 0);
      })[0]
    : null;

  const headline = topFrictionStep
    ? {
        title: `Störst tidsfriktion: ${topFrictionStep.label}`,
        summary: `${topFrictionStep.completionCount} av ${topFrictionStep.fromCount} uppmätta poster tog sig vidare i detta steg. Medianen ligger på ${
          topFrictionStep.medianSeconds !== null ? `${roundToOneDecimal(topFrictionStep.medianSeconds)} sek` : "okänd tid"
        }.`,
        nextAction: getNextAction(topFrictionStep),
      }
    : {
        title: "Ingen partnerledtid än",
        summary: "Det finns än så länge inte tillräckligt med sammanhängande partnerdata för att räkna ledtid i partnerresan.",
        nextAction: "Skapa några riktiga onboardingflöden så börjar den här sektionen fyllas med mätbar friktion.",
      };

  return {
    recordsAnalyzed: Math.max(data.partnerApplications.length, data.partners.length),
    steps,
    headline,
  };
}
