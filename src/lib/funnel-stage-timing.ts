import type { FunnelEvent } from "@/lib/omega-types";

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

function getNextAction(step: FunnelTimingStepInsight) {
  switch (step.key) {
    case "landing_to_cta":
      return "Se over hero-copy, tydlighet i forsta CTA och om landningen snabbt forklarar nasta steg.";
    case "cta_to_form_start":
      return "Minska friktionen mellan klick och formular genom tydligare forvantan, enklare overgang och battre mobilkansla.";
    case "form_start_to_submit":
      return "Gor formularet lattare att slutföra och folj upp validering, felmeddelanden och input-hjalp.";
    default:
      return "Fortsatt minska friktionen i nasta steg.";
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
      "Hur snabbt forsta besoket blir till ett konkret klick pa nasta steg.",
      sessions,
      LANDING_EVENTS,
      CTA_EVENTS,
    ),
    buildStepInsight(
      "cta_to_form_start",
      "CTA-klick till formstart",
      "Hur snabbt klicket blir till faktisk aktivitet i kund- eller partnerformularet.",
      sessions,
      CTA_EVENTS,
      FORM_START_EVENTS,
    ),
    buildStepInsight(
      "form_start_to_submit",
      "Formstart till skickat formular",
      "Hur latt det ar att ta sig fran pabörjat formular till fardigt submit.",
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
        title: `Storst tidsfriktion: ${topFrictionStep.label}`,
        summary: `${topFrictionStep.completionCount} av ${topFrictionStep.fromCount} uppmatta sessioner tog sig vidare i detta steg. Medianen ligger pa ${
          topFrictionStep.medianSeconds !== null ? `${roundToOneDecimal(topFrictionStep.medianSeconds)} sek` : "okand tid"
        }.`,
        nextAction: getNextAction(topFrictionStep),
      }
    : {
        title: "Ingen ledtidsdata an",
        summary: "Det finns an sa lange inte tillrackligt manga sammanhangande sessioner for att rakna ledtid mellan stegen.",
        nextAction: "Skapa nagra riktiga testfloden sa borjar den har sektionen fyllas med matbar friktion.",
      };

  return {
    sessionsAnalyzed: sessions.length,
    steps,
    headline,
  };
}
