import type { AdminDashboardData, AdminPartnerRow, GrowthCompassRow, Lead, PartnerLeadPriority } from "@/lib/omega-types";

export interface PartnerFunnelStage {
  key: string;
  label: string;
  count: number;
  description: string;
  focus: string;
  conversionFromPrevious: number | null;
  dropFromPrevious: number | null;
}

export interface PartnerFunnelBlocker {
  key: string;
  label: string;
  count: number;
  description: string;
  nextAction: string;
  samples: string[];
}

export interface PartnerFunnelInsights {
  applicationStages: PartnerFunnelStage[];
  activationStages: PartnerFunnelStage[];
  blockers: PartnerFunnelBlocker[];
  headline: {
    title: string;
    summary: string;
    nextAction: string;
  };
}

function roundPercent(numerator: number, denominator: number) {
  if (!denominator) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

function getLeadPartnerPriority(lead: Lead): PartnerLeadPriority | null {
  const value = lead.details?.partner_priority;
  return value === "hot" || value === "follow_up" || value === "not_now" ? value : null;
}

function getLeadAdminNote(lead: Lead) {
  const value = lead.details?.admin_note;
  return typeof value === "string" ? value.trim() : "";
}

function getLeadTeamIntentConfirmed(lead: Lead) {
  return lead.details?.team_intent_confirmed === true;
}

function getLeadZinzinoVerified(lead: Lead) {
  return lead.status === "active" || lead.details?.zinzino_verified === true;
}

function hasInternalReview(lead: Lead) {
  return getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).length > 0;
}

function isCandidate(lead: Lead) {
  return hasInternalReview(lead) || getLeadZinzinoVerified(lead) || getLeadTeamIntentConfirmed(lead) || lead.status === "qualified";
}

function isReviewReady(lead: Lead) {
  return lead.status === "active" || (hasInternalReview(lead) && getLeadZinzinoVerified(lead) && getLeadTeamIntentConfirmed(lead));
}

function isActivatedPartner(row?: GrowthCompassRow) {
  return row ? row.status !== "inactive" : false;
}

function hasDuplicationSignal(row?: GrowthCompassRow) {
  return row ? row.status === "duplicating" || row.status === "leader-track" : false;
}

function mapSamplesToLabels(samples: Array<Lead | AdminPartnerRow>) {
  return samples.slice(0, 3).map((item) => ("partnerId" in item ? item.partnerName : item.name));
}

function buildStage(
  key: string,
  label: string,
  count: number,
  description: string,
  focus: string,
  previousCount?: number,
): PartnerFunnelStage {
  if (typeof previousCount !== "number") {
    return {
      key,
      label,
      count,
      description,
      focus,
      conversionFromPrevious: null,
      dropFromPrevious: null,
    };
  }

  return {
    key,
    label,
    count,
    description,
    focus,
    conversionFromPrevious: roundPercent(count, previousCount),
    dropFromPrevious: Math.max(previousCount - count, 0),
  };
}

export function buildPartnerFunnelInsights(
  data: Pick<AdminDashboardData, "partnerApplications" | "partners" | "growthCompass">,
): PartnerFunnelInsights {
  const applications = data.partnerApplications;
  const candidateLeads = applications.filter(isCandidate);
  const readyForOnboarding = applications.filter(isReviewReady);
  const teamMembers = applications.filter((lead) => lead.status === "active");

  const growthByPartnerId = new Map(data.growthCompass.map((row) => [row.partnerId, row]));
  const partnersWithLinks = data.partners.filter((partner) => partner.zzLinksReady);
  const activatedPartners = data.partners.filter((partner) => isActivatedPartner(growthByPartnerId.get(partner.partnerId)));
  const duplicatingPartners = data.partners.filter((partner) => hasDuplicationSignal(growthByPartnerId.get(partner.partnerId)));

  const applicationStages = [
    buildStage(
      "applications",
      "Partnerleads",
      applications.length,
      "Intresse fångat i adminflödet och redo för första bedömning.",
      "Säkerställ snabb första sortering så att heta kandidater inte kallnar.",
    ),
    buildStage(
      "candidates",
      "Kandidater",
      candidateLeads.length,
      "Leads där intern bedömning eller tydlig progressignal finns.",
      "Flytta fler från oklar avstämning till aktiv kandidatstatus.",
      applications.length,
    ),
    buildStage(
      "ready",
      "Redo för onboarding",
      readyForOnboarding.length,
      "Alla grundsignaler är bekräftade för portalstart.",
      "Ta dessa till konto och start innan de tappar momentum.",
      candidateLeads.length,
    ),
    buildStage(
      "team-members",
      "Teammedlemmar",
      teamMembers.length,
      "Ansökningar som faktiskt blivit aktiva partnerkonton i ert lager.",
      "Minska tiden mellan klar kandidat och faktisk portalstart.",
      readyForOnboarding.length,
    ),
  ];

  const activationStages = [
    buildStage(
      "portal-partners",
      "Portalpartners",
      data.partners.length,
      "Partners med åtkomst i portalen och egen referral-identitet.",
      "Håll setup och uppföljning tät direkt efter att konto skapats.",
    ),
    buildStage(
      "links-ready",
      "4 länkar klara",
      partnersWithLinks.length,
      "Partnern har komplett ZZ-setup för test, shop, partner och konsultation.",
      "Det här är den första operativa grind som måste passeras snabbt.",
      data.partners.length,
    ),
    buildStage(
      "activated",
      "Aktiv signal",
      activatedPartners.length,
      "Growth Compass ser faktisk rörelse snarare än bara registrerad setup.",
      "Hjälp partnern till första rytm och första observerbara aktivitet.",
      partnersWithLinks.length,
    ),
    buildStage(
      "duplicating",
      "Dupliceringssignal",
      duplicatingPartners.length,
      "Partnern visar first-line eller teamdriven rörelse, inte bara soloaktivitet.",
      "Få fler från egen aktivitet till verklig duplication.",
      activatedPartners.length,
    ),
  ];

  const blockers: PartnerFunnelBlocker[] = [
    {
      key: "unreviewed",
      label: "Ogranskade partnerleads",
      count: applications.filter((lead) => !isCandidate(lead) && lead.status !== "active").length,
      description: "Personer som finns i flödet men ännu saknar tydlig intern riktning.",
      nextAction: "Gör första bedömning, sätt prioritet och avgör om kandidaten ska drivas vidare.",
      samples: mapSamplesToLabels(applications.filter((lead) => !isCandidate(lead) && lead.status !== "active")),
    },
    {
      key: "ready-to-onboard",
      label: "Klara men inte onboardade",
      count: readyForOnboarding.filter((lead) => lead.status !== "active").length,
      description: "Kandidater där beslutet i praktiken verkar taget men konto ännu inte är skapat.",
      nextAction: "Flytta från adminbeslut till faktisk onboarding samma arbetsflöde.",
      samples: mapSamplesToLabels(readyForOnboarding.filter((lead) => lead.status !== "active")),
    },
    {
      key: "missing-links",
      label: "Portalpartners utan 4 länkar",
      count: data.partners.filter((partner) => !partner.zzLinksReady).length,
      description: "Partners som finns i portalen men där funneln ännu inte kan användas fullt ut.",
      nextAction: "Komplettera setup direkt efter portalstart så att bokning och redirect fungerar.",
      samples: mapSamplesToLabels(data.partners.filter((partner) => !partner.zzLinksReady)),
    },
    {
      key: "inactive-after-setup",
      label: "Länkar klara men ingen aktivitet",
      count: partnersWithLinks.filter((partner) => !isActivatedPartner(growthByPartnerId.get(partner.partnerId))).length,
      description: "Setup finns, men systemet ser ännu ingen tydlig rörelse i praktiken.",
      nextAction: "Styr mot första aktivitet, första kund eller första first-line-signal.",
      samples: mapSamplesToLabels(
        partnersWithLinks.filter((partner) => !isActivatedPartner(growthByPartnerId.get(partner.partnerId))),
      ),
    },
  ].sort((a, b) => b.count - a.count);

  const topBlocker = blockers[0];
  const headline = topBlocker && topBlocker.count > 0
    ? {
        title: `Största friktion: ${topBlocker.label}`,
        summary: `${topBlocker.count} personer fastnar här just nu, vilket gör detta till nästa mest lönsamma åtgärdspunkt.`,
        nextAction: topBlocker.nextAction,
      }
    : {
        title: "Funneln rör sig framåt",
        summary: "Det finns ingen tydlig dominerande flaskhals just nu i partnerflödet.",
        nextAction: "Fortsätt optimera mot snabbare onboarding och fler dupliceringssignaler.",
      };

  return {
    applicationStages,
    activationStages,
    blockers,
    headline,
  };
}
