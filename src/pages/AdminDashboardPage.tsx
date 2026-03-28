import { Activity, ArrowRightLeft, BadgeCheck, Copy, MousePointerClick, Network, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { onboardPartnerFromLead, updatePartnerLeadReview } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GrowthCompassCard } from "@/components/GrowthCompassCard";
import { DashboardSection, DashboardShell, dashboardIcons } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GROWTH_PROJECTION_SCENARIOS, runGrowthProjection } from "@/lib/growth-projection";
import { getAdminDashboardData, signOutPortalUser, updatePartnerZzLinks } from "@/lib/omega-data";
import { buildFunnelStageTimingInsights, buildPartnerLifecycleTimingInsights } from "@/lib/funnel-stage-timing";
import { buildPartnerFunnelInsights } from "@/lib/partner-funnel";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type {
  AdminPartnerRow,
  ConfidenceLevel,
  FunnelEvent,
  GrowthCompassRow,
  KpiFunnelEventDay,
  Lead,
  LeadAttributionContext,
  OnboardPartnerFromLeadResponse,
  PartnerLeadPriority,
  ReferralTouchpoint,
} from "@/lib/omega-types";

const EMPTY_GROWTH_COMPASS_ROWS: GrowthCompassRow[] = [];
const EMPTY_FUNNEL_EVENT_ROWS: KpiFunnelEventDay[] = [];
const EMPTY_FUNNEL_EVENT_TIMELINE: FunnelEvent[] = [];
const EMPTY_PARTNER_ROWS: AdminPartnerRow[] = [];
const EMPTY_PARTNER_APPLICATIONS: Lead[] = [];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value);
}

function formatElapsedDays(from: string | null | undefined) {
  if (!from) {
    return "-";
  }

  const timestamp = new Date(from).getTime();
  if (!Number.isFinite(timestamp)) {
    return "-";
  }

  const diffMs = Date.now() - timestamp;
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) {
    return "I dag";
  }

  if (diffDays === 1) {
    return "1 dag";
  }

  return `${formatWholeNumber(diffDays)} dagar`;
}

function formatDuration(seconds: number | null) {
  if (seconds === null) {
    return "-";
  }

  if (seconds < 60) {
    return `${formatWholeNumber(Math.round(seconds))} sek`;
  }

  const roundedMinutes = Math.round((seconds / 60) * 10) / 10;
  if (roundedMinutes < 60) {
    return `${String(roundedMinutes).replace(".", ",")} min`;
  }

  const roundedHours = Math.round((seconds / 3600) * 10) / 10;
  return `${String(roundedHours).replace(".", ",")} h`;
}

function formatFunnelDelta(value: number | null) {
  if (value === null) {
    return "Bassteg";
  }

  return `${formatPercent(value)} från föregående steg`;
}

function getFunnelEventLabel(eventName: string) {
  switch (eventName) {
    case "landing_viewed":
      return "Landning visad";
    case "page_viewed":
      return "Sida visad";
    case "hero_primary_cta_clicked":
      return "Hero CTA klick";
    case "hero_secondary_cta_clicked":
      return "Hero sekundär CTA";
    case "sticky_cta_clicked":
      return "Sticky CTA klick";
    case "closing_cta_clicked":
      return "Closing CTA klick";
    case "lead_form_started":
      return "Kundform startad";
    case "lead_form_submitted":
      return "Kundform skickad";
    case "lead_form_submit_failed":
      return "Kundform misslyckades";
    case "consultation_redirect_requested":
      return "Konsultationsredirect begärd";
    case "partner_hero_primary_cta_clicked":
      return "Partner CTA klick";
    case "partner_sticky_cta_clicked":
      return "Partner sticky CTA";
    case "partner_form_started":
      return "Partnerform startad";
    case "partner_form_submitted":
      return "Partnerform skickad";
    case "partner_form_submit_failed":
      return "Partnerform misslyckades";
    default:
      return eventName;
  }
}

function formatDetailValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getPageTypeLabel(value: unknown) {
  switch (value) {
    case "customer":
      return "Kundsida";
    case "partner":
      return "Partnersida";
    case "admin":
      return "Adminsida";
    default:
      return null;
  }
}

function getLandingTypeLabel(value: unknown) {
  switch (value) {
    case "customer":
      return "Kundlandning";
    case "partner":
      return "Partnerlandning";
    default:
      return null;
  }
}

function getPlacementLabel(value: unknown) {
  switch (value) {
    case "hero":
      return "Hero";
    case "sticky-bar":
      return "Sticky-bar";
    case "closing-section":
      return "Closing-sektion";
    default:
      return formatDetailValue(value);
  }
}

function getDestinationTypeLabel(value: unknown) {
  switch (value) {
    case "test":
      return "Testlänk";
    case "shop":
      return "Shoplänk";
    case "partner":
      return "Partnerlänk";
    case "consultation":
      return "Konsultation";
    default:
      return formatDetailValue(value);
  }
}

function getFormTypeLabel(value: unknown) {
  switch (value) {
    case "consultation":
      return "Konsultationsform";
    case "contact":
      return "Kontaktform";
    case "partner_application":
      return "Partneransökan";
    default:
      return formatDetailValue(value);
  }
}

function formatFunnelEventDetails(details: unknown) {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return "-";
  }

  const detailMap = details as Record<string, unknown>;
  const formattedParts = [
    getLandingTypeLabel(detailMap.landingType),
    getPageTypeLabel(detailMap.pageType),
    getPlacementLabel(detailMap.placement),
    getDestinationTypeLabel(detailMap.destinationType),
    getFormTypeLabel(detailMap.formType),
  ].filter((value): value is string => Boolean(value));

  if (formattedParts.length) {
    return formattedParts.join(" • ");
  }

  if (typeof detailMap.reason === "string" && detailMap.reason.trim()) {
    return detailMap.reason.trim();
  }

  return JSON.stringify(details);
}

function formatStatusLabel(status: "inactive" | "active" | "growing" | "duplicating" | "leader-track") {
  switch (status) {
    case "inactive":
      return "Stillastående";
    case "active":
      return "Aktiv";
    case "growing":
      return "Bygger";
    case "duplicating":
      return "Duplicerar";
    case "leader-track":
      return "Ledarspår";
  }
}

function getPartnerApplicationStatusLabel(status: Lead["status"]) {
  switch (status) {
    case "new":
      return "Partnerkandidat";
    case "qualified":
      return "Verifierad";
    case "active":
      return "Aktiv partner";
    case "inactive":
      return "Inaktiv";
    case "won":
      return "Vunnen";
    case "lost":
      return "Förlorad";
    default:
      return status;
  }
}

function getPartnerApplicationStatusVariant(status: Lead["status"]): "secondary" | "outline" | "default" {
  switch (status) {
    case "new":
      return "outline";
    case "qualified":
      return "secondary";
    case "active":
      return "default";
    default:
      return "outline";
  }
}

function getPortalStageKey(lead: Lead) {
  if (lead.status === "active") {
    return "team_member" as const;
  }

  if (lead.status === "inactive") {
    return "inactive" as const;
  }

  if (lead.status === "won") {
    return "won" as const;
  }

  if (lead.status === "lost") {
    return "lost" as const;
  }

  const hasInternalReview = getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0;
  const hasProgressSignals = hasInternalReview || getLeadZinzinoVerified(lead) || getLeadTeamIntentConfirmed(lead) || lead.status === "qualified";

  return hasProgressSignals ? "candidate" as const : "partner_lead" as const;
}

function getPortalStageLabel(lead: Lead) {
  switch (getPortalStageKey(lead)) {
    case "partner_lead":
      return "Partnerlead";
    case "candidate":
      return "Kandidat";
    case "team_member":
      return "Teammedlem";
    case "inactive":
      return "Vilande";
    case "won":
      return "Vunnen";
    case "lost":
      return "Avslutad";
    default:
      return "Oklar";
  }
}

function getPortalStageDescription(lead: Lead) {
  switch (getPortalStageKey(lead)) {
    case "partner_lead":
      return "Intresse är fångat, men personen är ännu i första uppföljningsläget.";
    case "candidate":
      return "Granskad kandidat som följs upp tills ZZ-join och tydligt build intent är bekräftade.";
    case "team_member":
      return "Aktiv ZZ-partner med portalåtkomst i vårt teamlager.";
    case "inactive":
      return "Har funnits i flödet, men är inte aktiv i nuläget.";
    case "won":
      return "Har gått vidare positivt i processen.";
    case "lost":
      return "Ska inte drivas vidare just nu.";
    default:
      return "Saknar tydlig tolkning just nu.";
  }
}

function getPortalStageVariant(lead: Lead): "secondary" | "outline" | "default" {
  switch (getPortalStageKey(lead)) {
    case "candidate":
      return "secondary";
    case "team_member":
      return "default";
    default:
      return "outline";
  }
}

function getPortalStageNextAction(lead: Lead) {
  switch (lead.status) {
    case "new":
      return "Bedöm matchning, sätt prioritet och avgör om personen ska följas upp vidare som kandidat.";
    case "qualified":
      return "Följ upp aktivt och bekräfta både ZZ-join och vilja att bygga med er innan portalåtkomst skapas.";
    case "active":
      return "Fokus ligger nu på onboarding, första aktivitet och att teammedlemmen kommer igång i portalen.";
    case "inactive":
      return "Låt personen vila tills rätt timing finns, men behåll noteringar om varför flödet pausades.";
    case "won":
      return "Säkerställ att nästa steg efter positivt besked faktiskt tas och inte stannar i admin.";
    case "lost":
      return "Avsluta tydligt och lägg inte mer energi här just nu.";
    default:
      return "Avgör vad nästa tydliga steg i processen ska vara.";
  }
}

function getPortalStageDecisionLabel(status: Lead["status"]) {
  switch (status) {
    case "new":
      return "Redo att bedömas";
    case "qualified":
      return "Redo för verifiering";
    case "active":
      return "Redo för onboarding";
    case "inactive":
      return "Pausad";
    case "won":
      return "Positivt utfall";
    case "lost":
      return "Avslutad";
    default:
      return "Oklar";
  }
}

function getLeadReadinessLabel(lead: Lead) {
  if (lead.status === "active") {
    return "Klar";
  }

  if (getLeadReviewReady(lead)) {
    return "Redo";
  }

  return "Ej redo";
}

function getLeadReadinessDescription(lead: Lead) {
  if (lead.status === "active") {
    return "Finns redan i portalen som teammedlem.";
  }

  if (getLeadReviewReady(lead)) {
    return "Klar att bli teammedlem när du vill öppna portalåtkomst.";
  }

  return getLeadReviewBlockers(lead).join(", ");
}

function getLeadFollowUpRecommendation(lead: Lead) {
  if (lead.status === "active") {
    return "Följ upp första inloggning, legal, ZZ-länkar och första aktivitet i portalen.";
  }

  const hasInternalReview = getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0;
  const zinzinoVerified = getLeadZinzinoVerified(lead);
  const teamIntentConfirmed = getLeadTeamIntentConfirmed(lead);

  if (!hasInternalReview) {
    return "Gör en första intern bedömning och avgör om personen ska drivas vidare som kandidat.";
  }

  if (!zinzinoVerified) {
    return "Följ upp efter samtal eller Zoom och bekräfta om ZZ-join är genomförd eller nära nästa steg.";
  }

  if (!teamIntentConfirmed) {
    return "Bekräfta att personen faktiskt vill bygga med er modell, inte bara undersöka möjligheten.";
  }

  return "Allt är bekräftat. Skapa teammedlem och säkra att onboarding verkligen startar direkt.";
}

function getLeadContactMethod(lead: Lead) {
  if (lead.status === "active") {
    return "Portalstart";
  }

  const hasInternalReview = getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0;
  const zinzinoVerified = getLeadZinzinoVerified(lead);
  const teamIntentConfirmed = getLeadTeamIntentConfirmed(lead);

  if (!hasInternalReview) {
    return "Kort avstämning";
  }

  if (!zinzinoVerified) {
    return "Samtal eller Zoom";
  }

  if (!teamIntentConfirmed) {
    return "Tydlig bekräftelse";
  }

  return "Onboarding";
}

function getLeadContactMethodDescription(lead: Lead) {
  switch (getLeadContactMethod(lead)) {
    case "Portalstart":
      return "Säkra inloggning, legal och att personen kommer igång samma vecka.";
    case "Kort avstämning":
      return "Kort kontakt för att avgöra matchning, timing och om kandidaten ska prioriteras vidare.";
    case "Samtal eller Zoom":
      return "Ett riktig samtal passar bättre än lös textdialog när nästa steg mot ZZ ska klargöras.";
    case "Tydlig bekräftelse":
      return "Be om ett tydligt ja eller nej till om personen faktiskt vill bygga med er modell.";
    case "Onboarding":
      return "Allt är klart. Flytta snabbt från beslut till faktisk start i portalen.";
    default:
      return "Välj den kontaktform som för personen tydligast vidare.";
  }
}

function getPartnerPriorityLabel(priority?: PartnerLeadPriority | null) {
  switch (priority) {
    case "hot":
      return "Het";
    case "follow_up":
      return "Följ upp";
    case "not_now":
      return "Inte nu";
    default:
      return null;
  }
}

function getPartnerPriorityVariant(priority?: PartnerLeadPriority | null): "destructive" | "secondary" | "outline" {
  switch (priority) {
    case "hot":
      return "destructive";
    case "follow_up":
      return "secondary";
    default:
      return "outline";
  }
}

function getLeadUrgencyLabel(lead: Lead) {
  if (lead.status === "active") {
    return "Onboarda nu";
  }

  if (getLeadReviewReady(lead)) {
    return "Kontakta nu";
  }

  const priority = getLeadPartnerPriority(lead);
  if (priority === "hot") {
    return "Kontakta nu";
  }

  if (priority === "follow_up" || getLeadZinzinoVerified(lead) || getLeadTeamIntentConfirmed(lead)) {
    return "Följ upp snart";
  }

  return "Kan vänta";
}

function getLeadUrgencyVariant(lead: Lead): "destructive" | "secondary" | "outline" | "default" {
  switch (getLeadUrgencyLabel(lead)) {
    case "Onboarda nu":
      return "default";
    case "Kontakta nu":
      return "destructive";
    case "Följ upp snart":
      return "secondary";
    default:
      return "outline";
  }
}

function getLeadUrgencyReason(lead: Lead) {
  if (lead.status === "active") {
    return "Portalåtkomst finns redan, så fokus bör ligga på att få igång första aktivitet direkt.";
  }

  if (getLeadReviewReady(lead)) {
    return "Alla kriterier är klara och relationen bör flyttas direkt till onboarding innan värmen hinner svalna.";
  }

  const priority = getLeadPartnerPriority(lead);
  if (priority === "hot") {
    return "Leaden är markerad som varm och bör få snabb personlig uppföljning.";
  }

  if (priority === "follow_up") {
    return "Kandidaten är relevant, men nästa steg kräver inte samma direkthet som de varmaste posterna.";
  }

  if (getLeadZinzinoVerified(lead) || getLeadTeamIntentConfirmed(lead)) {
    return "Något viktigt steg är redan taget, så den här kandidaten bör inte tappa fart.";
  }

  return "Tidigt läge eller låg signal just nu. Håll kvar i listan utan att lägga först energi här.";
}

function getPartnerActivationUrgency(
  status: "inactive" | "active" | "growing" | "duplicating" | "leader-track",
  zzLinksReady: boolean,
) {
  if (!zzLinksReady) {
    return "Säkra setup nu";
  }

  switch (status) {
    case "inactive":
      return "Aktivera nu";
    case "active":
      return "Följ upp nära";
    case "growing":
    case "duplicating":
    case "leader-track":
      return "Skydda momentum";
    default:
      return "Följ upp";
  }
}

function getPartnerActivationUrgencyVariant(
  status: "inactive" | "active" | "growing" | "duplicating" | "leader-track",
  zzLinksReady: boolean,
): "destructive" | "secondary" | "outline" | "default" {
  switch (getPartnerActivationUrgency(status, zzLinksReady)) {
    case "Säkra setup nu":
    case "Aktivera nu":
      return "destructive";
    case "Skydda momentum":
      return "default";
    case "Följ upp nära":
      return "secondary";
    default:
      return "outline";
  }
}

function getGrowthCompassVariant(status: "inactive" | "active" | "growing" | "duplicating" | "leader-track") {
  switch (status) {
    case "inactive":
      return "outline" as const;
    case "active":
      return "secondary" as const;
    case "growing":
      return "secondary" as const;
    case "duplicating":
      return "default" as const;
    case "leader-track":
      return "default" as const;
  }
}

function getGrowthCompassLabel(status: "inactive" | "active" | "growing" | "duplicating" | "leader-track") {
  return formatStatusLabel(status);
}

function getConfidenceLabel(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "Hög";
    case "medium":
      return "Medel";
    case "low":
      return "Låg";
  }
}

function getConfidenceVariant(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "default" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
  }
}

function getLeadPartnerPriority(lead: Lead): PartnerLeadPriority | null {
  const value = lead.details?.partner_priority;
  return value === "hot" || value === "follow_up" || value === "not_now" ? value : null;
}

function getLeadDetailValue(lead: Lead, key: "company" | "interest" | "readiness" | "background") {
  const value = lead.details?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "-";
}

function getLeadAdminNote(lead: Lead) {
  const value = lead.details?.admin_note;
  return typeof value === "string" ? value : "";
}

function getLeadAttribution(lead: Lead): LeadAttributionContext | null {
  const value = lead.details?.attribution;

  if (!value || typeof value !== "object") {
    return null;
  }

  const attribution = value as Record<string, unknown>;
  const lastTouchValue = attribution.lastTouch;

  if (
    typeof attribution.sessionId !== "string" ||
    typeof attribution.landingPage !== "string" ||
    !lastTouchValue ||
    typeof lastTouchValue !== "object"
  ) {
    return null;
  }

  return {
    sessionId: attribution.sessionId,
    referralCode: typeof attribution.referralCode === "string" ? attribution.referralCode : null,
    referredByUserId: typeof attribution.referredByUserId === "string" ? attribution.referredByUserId : null,
    landingPage: attribution.landingPage,
    firstTouch: isReferralTouchpoint(attribution.firstTouch) ? attribution.firstTouch : null,
    lastTouch: isReferralTouchpoint(lastTouchValue) ? lastTouchValue : {
      capturedAt: "",
      landingPage: attribution.landingPage,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    },
  };
}

function isReferralTouchpoint(value: unknown): value is ReferralTouchpoint {
  if (!value || typeof value !== "object") {
    return false;
  }

  const touchpoint = value as Record<string, unknown>;
  return (
    typeof touchpoint.capturedAt === "string" &&
    typeof touchpoint.landingPage === "string" &&
    (typeof touchpoint.utmSource === "string" || touchpoint.utmSource === null || touchpoint.utmSource === undefined) &&
    (typeof touchpoint.utmMedium === "string" || touchpoint.utmMedium === null || touchpoint.utmMedium === undefined) &&
    (typeof touchpoint.utmCampaign === "string" || touchpoint.utmCampaign === null || touchpoint.utmCampaign === undefined)
  );
}

function getTouchpointChannels(touchpoint: ReferralTouchpoint | null) {
  if (!touchpoint) {
    return "Inga UTM-parametrar";
  }

  const parts = [touchpoint.utmSource, touchpoint.utmMedium, touchpoint.utmCampaign].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  return parts.length ? parts.join(" / ") : "Inga UTM-parametrar";
}

function getLeadTeamIntentConfirmed(lead: Lead) {
  return lead.details?.team_intent_confirmed === true;
}

function getLeadZinzinoVerified(lead: Lead) {
  return lead.status === "active" || lead.details?.zinzino_verified === true;
}

function getLeadReviewReady(lead: Lead) {
  const hasInternalReview = getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0;
  const zinzinoVerified = getLeadZinzinoVerified(lead);
  const teamIntentConfirmed = getLeadTeamIntentConfirmed(lead);

  return lead.status === "active" || (hasInternalReview && zinzinoVerified && teamIntentConfirmed);
}

function getLeadReviewBlockers(lead: Lead) {
  return [
    ...(getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0
      ? []
      : ["Intern bedömning saknas"]),
    ...(getLeadZinzinoVerified(lead) ? [] : ["ZZ-join ej verifierad"]),
    ...(getLeadTeamIntentConfirmed(lead) ? [] : ["Build intent ej bekräftat"]),
  ];
}

function getApplicationQueueScore(lead: Lead) {
  const priority = getLeadPartnerPriority(lead);
  const ready = getLeadReviewReady(lead);

  if (lead.status === "active") {
    return 0;
  }

  if (priority === "hot" && ready) {
    return 5;
  }

  if (ready) {
    return 4;
  }

  if (priority === "hot") {
    return 3;
  }

  if (priority === "follow_up") {
    return 2;
  }

  if (lead.status === "qualified") {
    return 1;
  }

  return 0;
}

function buildCandidatePathSteps(lead: Lead) {
  const hasInternalReview = getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0;
  const zinzinoVerified = getLeadZinzinoVerified(lead);
  const teamIntentConfirmed = getLeadTeamIntentConfirmed(lead);
  const teamMember = lead.status === "active";

  return [
    {
      label: "Intresse fångat",
      description: "Lead finns i systemet och kan följas upp.",
      done: true,
      current: !hasInternalReview,
    },
    {
      label: "Kandidat bedömd",
      description: "Intern bedömning är satt och personen följs upp aktivt.",
      done: hasInternalReview || teamMember,
      current: hasInternalReview && !zinzinoVerified && !teamMember,
    },
    {
      label: "ZZ-join verifierad",
      description: "Personen är bekräftad som aktiv partner i Zinzino.",
      done: zinzinoVerified || teamMember,
      current: zinzinoVerified && !teamIntentConfirmed && !teamMember,
    },
    {
      label: "Vill bygga med oss",
      description: "Det är tydligt att personen ska in i vårt teamlager.",
      done: teamIntentConfirmed || teamMember,
      current: teamIntentConfirmed && !teamMember,
    },
    {
      label: "Teammedlem",
      description: "Portalåtkomst är skapad och onboarding kan börja.",
      done: teamMember,
      current: teamMember,
    },
  ];
}

function getCoreReadiness(lead: Lead) {
  const priority = getLeadPartnerPriority(lead);
  const readiness = typeof lead.details?.readiness === "string" ? lead.details.readiness.toLowerCase() : "";
  const hasBuildIntent = lead.details?.team_intent_confirmed === true;

  if (lead.status !== "active") {
    return {
      label: "Inte aktuellt ännu",
      description: "Närmare stöd från Omega Balance-teamet blir relevant först efter att personen blivit teammedlem.",
      ready: false,
    };
  }

  if (priority === "hot" && hasBuildIntent && (readiness.includes("nu") || readiness.includes("redo"))) {
    return {
      label: "Möjligt närmare stöd",
      description: "Personen ser ut att kunna vara aktuell för tätare rytm, calls och närmare stöd från Omega Balance-teamet.",
      ready: true,
    };
  }

  return {
    label: "Vanlig teammedlem",
    description: "Låt personen först visa stabil aktivitet innan närmare stöd från Omega Balance-teamet blir relevant.",
    ready: false,
  };
}

function getCoreSupportPlan(lead: Lead) {
  const readiness = getCoreReadiness(lead);

  if (lead.status !== "active") {
    return {
      title: "Inte aktuellt ännu",
      items: [
        "Fokusera först på att få personen till teammedlem.",
        "Skapa inte tätare access innan ZZ-join och build intent är klara.",
      ],
    };
  }

  if (readiness.ready) {
    return {
      title: "Nästa steg med närmare stöd",
      items: [
        "Bjud in personen till närmare rytm med privata calls eller tätare Zoom.",
        "Lägg till personen i närmaste kommunikationen, till exempel privat grupp eller tätare uppföljning.",
        "Sätt ett konkret fokus för veckan så det närmare stödet direkt leder till rörelse.",
      ],
    };
  }

  return {
    title: "Nästa steg före närmare stöd",
    items: [
      "Låt personen först visa stabil aktivitet i vardagen.",
      "Följ upp om första resultat börjar bli upprepade, inte bara enstaka.",
      "När rytmen sitter kan närmare stöd från Omega Balance-teamet bli relevant som stödlager.",
    ],
  };
}

function DataTruthBadges({ isDemo, interpretive = false, projected = false }: { isDemo: boolean; interpretive?: boolean; projected?: boolean }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {isDemo ? (
        <Badge variant="outline" className="rounded-full px-3 py-1">
          Demo-data
        </Badge>
      ) : null}
      {interpretive ? (
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          Intern tolkning
        </Badge>
      ) : null}
      {projected ? (
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          Scenario
        </Badge>
      ) : null}
    </div>
  );
}

const adminSections = [
  {
    key: "overview",
    label: "Översikt",
    title: "Adminöversikt",
    subtitle: "Samlad bild av inflöde, partnerläge och de viktigaste signalerna just nu.",
    icon: dashboardIcons.dashboard,
  },
  {
    key: "applications",
    label: "Ansökningar",
    title: "Partneransökningar",
    subtitle: "Granska intresse, sätt prioritet och skapa konto först när partnern är verifierad i Zinzino.",
    icon: dashboardIcons.leads,
  },
  {
    key: "partners",
    label: "Partners",
    title: "Partners och tillväxt",
    subtitle: "Se vilka som bygger, vilka som står still och vilka som börjar duplicera.",
    icon: dashboardIcons.network,
  },
  {
    key: "traffic",
    label: "Trafik",
    title: "Trafik och attribution",
    subtitle: "Följ visits, klick, källor och duplicering utan att blanda ihop det med payout eller revenue.",
    icon: dashboardIcons.performance,
  },
] as const;

type AdminSectionKey = (typeof adminSections)[number]["key"];

const AdminDashboardPage = () => {
  const { section } = useParams<{ section?: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isDemo = searchParams.get("demo") === "admin" || !isSupabaseConfigured;
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [provisionedPartner, setProvisionedPartner] = useState<OnboardPartnerFromLeadResponse | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [zinzinoVerified, setZinzinoVerified] = useState(false);
  const [partnerPriority, setPartnerPriority] = useState<PartnerLeadPriority | "none">("none");
  const [adminNote, setAdminNote] = useState("");
  const [teamIntentConfirmed, setTeamIntentConfirmed] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [selectedGrowthCompassPartnerId, setSelectedGrowthCompassPartnerId] = useState<string | null>(null);
  const [growthCompassDialogOpen, setGrowthCompassDialogOpen] = useState(false);
  const [selectedProjectionScenarioName, setSelectedProjectionScenarioName] = useState<string>("");
  const [projectionDialogOpen, setProjectionDialogOpen] = useState(false);
  const [selectedPartnerForLinks, setSelectedPartnerForLinks] = useState<AdminPartnerRow | null>(null);
  const [zzTestUrl, setZzTestUrl] = useState("");
  const [zzShopUrl, setZzShopUrl] = useState("");
  const [zzPartnerUrl, setZzPartnerUrl] = useState("");
  const [zzConsultationUrl, setZzConsultationUrl] = useState("");
  const [zzLinkStatus, setZzLinkStatus] = useState<string | null>(null);
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
  });

  const onboardMutation = useMutation({
    mutationFn: (leadId: string) => onboardPartnerFromLead({ lead_id: leadId }),
    onSuccess: async (result) => {
      setProvisionedPartner(result);
      setProvisionError(null);
      setCopyStatus(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      setProvisionError(error instanceof Error ? error.message : "Kunde inte skapa teammedlem just nu.");
      setProvisionedPartner(null);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      selectedLead
        ? updatePartnerLeadReview({
            lead_id: selectedLead.id,
            partner_priority: partnerPriority === "none" ? null : partnerPriority,
            admin_note: adminNote.trim() || null,
            zinzino_verified: zinzinoVerified,
            team_intent_confirmed: teamIntentConfirmed,
          })
        : Promise.reject(new Error("No partner application selected.")),
    onSuccess: async () => {
      setReviewStatus("Review updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      setReviewStatus(error instanceof Error ? error.message : "Kunde inte uppdatera granskningen just nu.");
    },
  });

  const zzLinksMutation = useMutation({
    mutationFn: () =>
      selectedPartnerForLinks
        ? updatePartnerZzLinks(selectedPartnerForLinks.partnerId, {
            test: zzTestUrl,
            shop: zzShopUrl,
            partner: zzPartnerUrl,
            consultation: zzConsultationUrl,
          })
        : Promise.reject(new Error("No partner selected.")),
    onSuccess: async () => {
      setZzLinkStatus("ZZ-länkarna är sparade.");
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      setZzLinkStatus(error instanceof Error ? error.message : "Kunde inte spara ZZ-länkarna.");
    },
  });

  useEffect(() => {
    if (!selectedLead) {
      return;
    }

    setZinzinoVerified(getLeadZinzinoVerified(selectedLead));
    setPartnerPriority(getLeadPartnerPriority(selectedLead) ?? "none");
    setAdminNote(getLeadAdminNote(selectedLead));
    setTeamIntentConfirmed(getLeadTeamIntentConfirmed(selectedLead));
    setReviewStatus(null);
  }, [selectedLead]);

  useEffect(() => {
    const firstPartnerId = dashboardQuery.data?.growthCompass?.[0]?.partnerId ?? null;

    setSelectedGrowthCompassPartnerId((current) => {
      if (!firstPartnerId) {
        return null;
      }

      const exists = dashboardQuery.data?.growthCompass?.some((row) => row.partnerId === current);
      return exists ? current : firstPartnerId;
    });
  }, [dashboardQuery.data?.growthCompass]);

  useEffect(() => {
    if (!selectedPartnerForLinks) {
      return;
    }

    setZzTestUrl(selectedPartnerForLinks.zzLinks.test || "");
    setZzShopUrl(selectedPartnerForLinks.zzLinks.shop || "");
    setZzPartnerUrl(selectedPartnerForLinks.zzLinks.partner || "");
    setZzConsultationUrl(selectedPartnerForLinks.zzLinks.consultation || "");
    setZzLinkStatus(null);
  }, [selectedPartnerForLinks]);

  const currentSection =
    section === "guide"
      ? "guide"
      : adminSections.find((item) => item.key === section)?.key ?? (section ? null : "overview");

  const navigation = useMemo(
    () => [
      ...adminSections.map((item) => ({ label: item.label, href: `/dashboard/admin/${item.key}`, icon: item.icon })),
      { label: "Guide", href: "/dashboard/admin/guide", icon: dashboardIcons.dashboard },
    ],
    [],
  );

  const sectionMeta =
    currentSection === "guide"
      ? {
          key: "guide",
          label: "Läsguide",
          title: "Läsguide",
          subtitle: "Kort hjälp för hur adminytan ska läsas i dag. Bra som grund innan vi översätter allt till fler språk.",
          icon: dashboardIcons.dashboard,
        }
      : adminSections.find((item) => item.key === currentSection) ?? adminSections[0];
  const growthProjectionSummaries = useMemo(
    () =>
      Object.values(GROWTH_PROJECTION_SCENARIOS).map((scenario) => {
        const result = runGrowthProjection(scenario);

        return {
          name: scenario.name,
          checkpoints: result.checkpoints,
        };
      }),
    [],
  );
  const selectedProjectionSummary =
    growthProjectionSummaries.find((scenario) => scenario.name === selectedProjectionScenarioName) || null;
  const data = dashboardQuery.data;
  const latestFunnelDay = data?.kpis?.funnelDaily?.[0] || null;
  const pipeline = data?.kpis?.partnerPipeline || null;
  const producingPartners = data?.kpis?.duplication?.filter((row) => row.has_generated_leads).length || 0;
  const latestKnownCustomers = latestFunnelDay?.customers ?? 0;
  const growthCompassRows = useMemo(() => data?.growthCompass ?? EMPTY_GROWTH_COMPASS_ROWS, [data?.growthCompass]);
  const funnelEventRows = useMemo(
    () => data?.kpis?.funnelEventsDaily ?? EMPTY_FUNNEL_EVENT_ROWS,
    [data?.kpis?.funnelEventsDaily],
  );
  const recentFunnelEvents = useMemo(() => data?.recentFunnelEvents ?? EMPTY_FUNNEL_EVENT_TIMELINE, [data?.recentFunnelEvents]);
  const funnelEventTimeline = useMemo(
    () => data?.funnelEventTimeline ?? EMPTY_FUNNEL_EVENT_TIMELINE,
    [data?.funnelEventTimeline],
  );
  const partnerRows = useMemo(() => data?.partners ?? EMPTY_PARTNER_ROWS, [data?.partners]);
  const partnerApplications = useMemo(
    () => data?.partnerApplications ?? EMPTY_PARTNER_APPLICATIONS,
    [data?.partnerApplications],
  );
  const partnerFunnelInsights = useMemo(() => (data ? buildPartnerFunnelInsights(data) : null), [data]);
  const funnelTimingInsights = useMemo(
    () => buildFunnelStageTimingInsights(funnelEventTimeline),
    [funnelEventTimeline],
  );
  const partnerLifecycleTimingInsights = useMemo(
    () => buildPartnerLifecycleTimingInsights({
      partnerApplications,
      partners: partnerRows,
      growthCompass: growthCompassRows,
    }),
    [growthCompassRows, partnerApplications, partnerRows],
  );
  const funnelEventSummary = useMemo(() => {
    const countFor = (eventNames: string[]) =>
      funnelEventRows
        .filter((row) => eventNames.includes(row.event_name))
        .reduce((sum, row) => sum + row.events, 0);

    const pageViewsByPath = new Map<string, number>();
    recentFunnelEvents
      .filter((event) => event.event_name === "page_viewed")
      .forEach((event) => {
        const current = pageViewsByPath.get(event.page_path) || 0;
        pageViewsByPath.set(event.page_path, current + 1);
      });

    return {
      pageViews: countFor(["page_viewed"]),
      landings: countFor(["landing_viewed"]),
      ctaClicks: countFor([
        "hero_primary_cta_clicked",
        "sticky_cta_clicked",
        "closing_cta_clicked",
        "partner_hero_primary_cta_clicked",
        "partner_sticky_cta_clicked",
      ]),
      formStarts: countFor(["lead_form_started", "partner_form_started"]),
      formSubmits: countFor(["lead_form_submitted", "partner_form_submitted"]),
      submitFailures: countFor(["lead_form_submit_failed", "partner_form_submit_failed"]),
      topViewedPages: [...pageViewsByPath.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 8),
    };
  }, [funnelEventRows, recentFunnelEvents]);
  const sessionJourneySummary = useMemo(() => {
    const eventsBySession = new Map<string, typeof funnelEventTimeline>();

    funnelEventTimeline.forEach((event) => {
      if (!event.session_id) {
        return;
      }

      const existing = eventsBySession.get(event.session_id) || [];
      existing.push(event);
      eventsBySession.set(event.session_id, existing);
    });

    return [...eventsBySession.entries()]
      .map(([sessionId, events]) => {
        const sortedEvents = [...events].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        const firstEvent = sortedEvents[0] || null;
        const firstLanding = sortedEvents.find((event) => event.event_name === "landing_viewed") || firstEvent;
        const pageViews = sortedEvents.filter((event) => event.event_name === "page_viewed");
        const ctaEvents = sortedEvents.filter((event) =>
          [
            "hero_primary_cta_clicked",
            "sticky_cta_clicked",
            "closing_cta_clicked",
            "partner_hero_primary_cta_clicked",
            "partner_sticky_cta_clicked",
          ].includes(event.event_name),
        );
        const formStart = sortedEvents.find((event) =>
          ["lead_form_started", "partner_form_started"].includes(event.event_name),
        );
        const formSubmit = sortedEvents.find((event) =>
          ["lead_form_submitted", "partner_form_submitted"].includes(event.event_name),
        );
        const pageTrail = Array.from(
          new Set(
            sortedEvents
              .filter((event) => event.event_name === "landing_viewed" || event.event_name === "page_viewed")
              .map((event) => event.page_path),
          ),
        );

        return {
          sessionId,
          firstSeenAt: firstEvent?.created_at || "",
          referralCode: firstLanding?.referral_code || firstEvent?.referral_code || null,
          source: firstLanding?.utm_source || firstEvent?.utm_source || null,
          landingPage: firstLanding?.page_path || firstEvent?.page_path || "-",
          pageViews: pageViews.length,
          ctaClicks: ctaEvents.length,
          reachedForm: Boolean(formStart),
          submittedForm: Boolean(formSubmit),
          pageTrail,
        };
      })
      .sort((a, b) => new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime())
      .slice(0, 10);
  }, [funnelEventTimeline]);
  const trafficSourceSummary = useMemo(() => {
    const sourceMixRows = data?.kpis?.sourceMixDaily || [];
    const aggregate = <TKey extends string>(getKey: (row: typeof sourceMixRows[number]) => TKey) => {
      const buckets = new Map<TKey, number>();

      sourceMixRows.forEach((row) => {
        const key = getKey(row);
        buckets.set(key, (buckets.get(key) || 0) + row.visits);
      });

      return [...buckets.entries()]
        .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
        .slice(0, 8);
    };

    return {
      topSources: aggregate((row) => row.source || "Direkt"),
      topCampaigns: aggregate((row) => row.campaign || "Utan kampanj"),
      topLandingPages: aggregate((row) => row.landing_page || "/"),
    };
  }, [data?.kpis?.sourceMixDaily]);
  const sessionSourceSummary = useMemo(() => {
    const buckets = new Map<string, { sessions: number; surfOnly: number; ctaDriven: number; formDriven: number }>();

    sessionJourneySummary.forEach((session) => {
      const source = session.source || "Direkt";
      const current = buckets.get(source) || { sessions: 0, surfOnly: 0, ctaDriven: 0, formDriven: 0 };

      current.sessions += 1;
      if (session.submittedForm || session.reachedForm) {
        current.formDriven += 1;
      } else if (session.ctaClicks > 0) {
        current.ctaDriven += 1;
      } else {
        current.surfOnly += 1;
      }

      buckets.set(source, current);
    });

    return [...buckets.entries()]
      .map(([source, metrics]) => ({ source, ...metrics }))
      .sort((a, b) => b.sessions - a.sessions || a.source.localeCompare(b.source))
      .slice(0, 8);
  }, [sessionJourneySummary]);
  const trafficActionSummary = useMemo(() => {
    const actionableSources = sessionSourceSummary
      .map((row) => {
        const ctaRate = row.sessions ? row.ctaDriven / row.sessions : 0;
        const formRate = row.sessions ? row.formDriven / row.sessions : 0;
        const surfRate = row.sessions ? row.surfOnly / row.sessions : 0;

        let recommendation = "Fortsätt samla underlag.";
        let focus = "neutral";

        if (row.formDriven > 0) {
          recommendation = "Bra källa för handling. Fortsätt mata samma budskap och följ upp snabbt.";
          focus = "scale";
        } else if (row.ctaDriven > 0) {
          recommendation = "Driver klick men inte formulär ännu. Testa tydligare nästa steg efter CTA.";
          focus = "convert";
        } else if (row.sessions >= 2) {
          recommendation = "Ger mest surf just nu. Justera budskap eller skicka trafiken till en tydligare landning.";
          focus = "fix";
        }

        return {
          ...row,
          ctaRate,
          formRate,
          surfRate,
          recommendation,
          focus,
        };
      })
      .sort((a, b) => {
        const scoreA = a.formDriven * 3 + a.ctaDriven * 2 - a.surfOnly;
        const scoreB = b.formDriven * 3 + b.ctaDriven * 2 - b.surfOnly;
        return scoreB - scoreA || b.sessions - a.sessions || a.source.localeCompare(b.source);
      });

    const strongestSource = actionableSources.find((row) => row.formDriven > 0) || actionableSources[0] || null;
    const frictionSource =
      actionableSources.find((row) => row.surfOnly >= 2 && row.formDriven === 0) ||
      actionableSources.find((row) => row.ctaDriven > 0 && row.formDriven === 0) ||
      null;
    const strongestLanding = trafficSourceSummary.topLandingPages[0] || null;

    const actionQueue = actionableSources
      .filter((row) => row.sessions > 0)
      .map((row) => ({
        source: row.source,
        priority:
          row.formDriven > 0
            ? "Skala"
            : row.ctaDriven > 0
              ? "Konvertera"
              : row.surfOnly >= 2
                ? "Justera"
                : "Bevaka",
        summary:
          row.formDriven > 0
            ? `${formatWholeNumber(row.formDriven)} sessioner nådde formulär. Dubbel ned på samma vinkel.`
            : row.ctaDriven > 0
              ? `${formatWholeNumber(row.ctaDriven)} sessioner klickade vidare men stannade före formulär.`
              : `${formatWholeNumber(row.surfOnly)} sessioner stannade vid surf.`,
        nextStep: row.recommendation,
      }))
      .slice(0, 5);

    return {
      strongestSource,
      frictionSource,
      strongestLanding,
      actionQueue,
    };
  }, [sessionSourceSummary, trafficSourceSummary.topLandingPages]);
  const selectedGrowthCompassRow =
    growthCompassRows.find((row) => row.partnerId === selectedGrowthCompassPartnerId) || growthCompassRows[0] || null;
  const showOverview = currentSection === "overview";
  const showApplications = currentSection === "applications";
  const showPartners = currentSection === "partners";
  const showTraffic = currentSection === "traffic";
  const showGuide = currentSection === "guide";
  const selectedLeadCoreReadiness = selectedLead ? getCoreReadiness(selectedLead) : null;
  const selectedLeadCoreSupportPlan = selectedLead ? getCoreSupportPlan(selectedLead) : null;
  const selectedLeadAttribution = selectedLead ? getLeadAttribution(selectedLead) : null;
  const partnerNameById = useMemo(
    () => new Map(partnerRows.map((partner) => [partner.partnerId, partner.partnerName])),
    [partnerRows],
  );
  const partnersWithSetupNoActivity = useMemo(() => {
    if (!partnerRows.length || !growthCompassRows.length) {
      return [];
    }

    const growthByPartnerId = new Map(growthCompassRows.map((row) => [row.partnerId, row]));

    return partnerRows
      .map((partner) => ({
        partner,
        growth: growthByPartnerId.get(partner.partnerId) || null,
      }))
      .filter(({ partner, growth }) => partner.zzLinksReady && growth?.status === "inactive")
      .sort((a, b) => {
        const aTime = new Date(a.partner.verifiedAt || a.partner.createdAt).getTime();
        const bTime = new Date(b.partner.verifiedAt || b.partner.createdAt).getTime();
        return aTime - bTime;
      });
  }, [growthCompassRows, partnerRows]);
  const partnersMovingTowardDuplication = useMemo(() => {
    if (!partnerRows.length || !growthCompassRows.length) {
      return [];
    }

    const partnerById = new Map(partnerRows.map((partner) => [partner.partnerId, partner]));
    const priorityByStatus = new Map([
      ["leader-track", 3],
      ["duplicating", 2],
      ["growing", 1],
    ]);

    return growthCompassRows
      .filter((row) => row.status === "growing" || row.status === "duplicating" || row.status === "leader-track")
      .map((row) => ({
        row,
        partner: partnerById.get(row.partnerId) || null,
      }))
      .sort((a, b) => {
        const statusDiff = (priorityByStatus.get(b.row.status) || 0) - (priorityByStatus.get(a.row.status) || 0);
        if (statusDiff !== 0) {
          return statusDiff;
        }

        return b.row.score - a.row.score;
      });
  }, [growthCompassRows, partnerRows]);
  const activationDecisionSummary = useMemo(() => {
    const partnerById = new Map(partnerRows.map((partner) => [partner.partnerId, partner]));

    const awaitingSetup = growthCompassRows
      .filter((row) => {
        const partner = partnerById.get(row.partnerId);
        return partner && !partner.zzLinksReady;
      })
      .map((row) => ({ row, partner: partnerById.get(row.partnerId) || null }));

    const readyButInactive = partnersWithSetupNoActivity;

    const buildingRhythm = growthCompassRows
      .filter((row) => row.status === "active")
      .map((row) => ({ row, partner: partnerById.get(row.partnerId) || null }))
      .sort((a, b) => b.row.score - a.row.score);

    const movingNow = partnersMovingTowardDuplication;

    const actionQueue = [
      {
        key: "setup",
        label: "Länkar saknas efter portalstart",
        count: awaitingSetup.length,
        oldest: awaitingSetup[0]?.partner?.createdAt || null,
        nextStep: "Säkra test-, shop- och partnerlänk direkt så att personen kan börja dela något konkret.",
      },
      {
        key: "inactive",
        label: "Setup klar men ingen aktivitet",
        count: readyButInactive.length,
        oldest: readyButInactive[0]?.partner.verifiedAt || readyButInactive[0]?.partner.createdAt || null,
        nextStep: "Följ upp första inloggning, första delning och ett verkligt första samtal samma vecka.",
      },
      {
        key: "active",
        label: "Aktiv men ännu inte duplicering",
        count: buildingRhythm.length,
        oldest: buildingRhythm[0]?.partner?.verifiedAt || buildingRhythm[0]?.partner?.createdAt || null,
        nextStep: "Skydda rytmen och hjälp partnern få första line-rörelse innan energin sprids.",
      },
      {
        key: "moving",
        label: "På väg mot duplicering",
        count: movingNow.length,
        oldest: movingNow[0]?.partner?.verifiedAt || movingNow[0]?.partner?.createdAt || null,
        nextStep: "Ge tätare stöd till dem som redan visar first-line-signal eller partnergenererade leads.",
      },
    ].filter((item) => item.count > 0);

    return {
      awaitingSetup,
      readyButInactive,
      buildingRhythm,
      movingNow,
      actionQueue,
      strongestPartner:
        movingNow[0]?.row ||
        buildingRhythm[0]?.row ||
        readyButInactive[0]?.growth ||
        null,
    };
  }, [growthCompassRows, partnerRows, partnersMovingTowardDuplication, partnersWithSetupNoActivity]);
  const topPartnerActivationList = useMemo(() => {
    const setupRows = activationDecisionSummary.awaitingSetup
      .slice(0, 2)
      .map(({ row, partner }) => ({
        key: `${row.partnerId}-setup`,
        partnerId: row.partnerId,
        partnerName: row.partnerName,
        email: partner?.email || row.email,
        urgency: getPartnerActivationUrgency(row.status, false),
        urgencyVariant: getPartnerActivationUrgencyVariant(row.status, false),
        reason: "Partnern har portalåtkomst men saknar länkar som gör att något konkret kan börja delas.",
        nextStep: "Lägg in test-, shop- och partnerlänk direkt och säkra att första delningen verkligen blir av.",
      }));

    const inactiveRows = activationDecisionSummary.readyButInactive
      .slice(0, 2)
      .map(({ partner }) => ({
        key: `${partner.partnerId}-inactive`,
        partnerId: partner.partnerId,
        partnerName: partner.partnerName,
        email: partner.email,
        urgency: getPartnerActivationUrgency("inactive", partner.zzLinksReady),
        urgencyVariant: getPartnerActivationUrgencyVariant("inactive", partner.zzLinksReady),
        reason: "Setup är klar men första verkliga signalen saknas fortfarande, så energin riskerar att stanna av tidigt.",
        nextStep: "Följ upp inloggning, första delning eller första bokade dialog denna vecka.",
      }));

    const momentumRows = activationDecisionSummary.movingNow
      .slice(0, 2)
      .map(({ row, partner }) => ({
        key: `${row.partnerId}-momentum`,
        partnerId: row.partnerId,
        partnerName: row.partnerName,
        email: partner?.email || row.email,
        urgency: getPartnerActivationUrgency(row.status, partner?.zzLinksReady ?? true),
        urgencyVariant: getPartnerActivationUrgencyVariant(row.status, partner?.zzLinksReady ?? true),
        reason: "Partnern visar redan rörelse och bör få tätare stöd så att first-line-momentum inte tappas.",
        nextStep: row.nextBestAction,
      }));

    return [...setupRows, ...inactiveRows, ...momentumRows].slice(0, 6);
  }, [activationDecisionSummary]);
  const leadsReadyButNotOnboarded = useMemo(() => {
    if (!partnerApplications.length) {
      return [];
    }

    return partnerApplications
      .filter((lead) => lead.status !== "active" && getLeadReviewReady(lead))
      .sort((a, b) => new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime());
  }, [partnerApplications]);
  const sortedPartnerApplications = useMemo(
    () =>
      [...partnerApplications].sort((a, b) => {
        const scoreDiff = getApplicationQueueScore(b) - getApplicationQueueScore(a);
        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [partnerApplications],
  );
  const onboardingDecisionSummary = useMemo(() => {
    const applications = partnerApplications;
    const growthByPartnerName = new Map(growthCompassRows.map((row) => [row.partnerName.toLowerCase(), row]));
    const partnerByEmail = new Map(partnerRows.map((partner) => [partner.email.toLowerCase(), partner]));

    const needsReview = applications.filter((lead) => {
      const hasInternalReview = getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0;
      return lead.status !== "active" && !hasInternalReview;
    });
    const waitingForZz = applications.filter((lead) => {
      const hasInternalReview = getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0;
      return lead.status !== "active" && hasInternalReview && !getLeadZinzinoVerified(lead);
    });
    const waitingForIntent = applications.filter((lead) => {
      const hasInternalReview = getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0;
      return lead.status !== "active" && hasInternalReview && getLeadZinzinoVerified(lead) && !getLeadTeamIntentConfirmed(lead);
    });
    const readyNow = applications.filter((lead) => lead.status !== "active" && getLeadReviewReady(lead));
    const onboardingNeedsActivation = applications
      .filter((lead) => lead.status === "active")
      .map((lead) => {
        const partner = partnerByEmail.get(lead.email.toLowerCase()) || null;
        const growth = growthByPartnerName.get(lead.name.toLowerCase()) || null;
        return { lead, partner, growth };
      })
      .filter(({ partner, growth }) => {
        if (!partner) {
          return true;
        }

        return !partner.zzLinksReady || growth?.status === "inactive" || !growth;
      });

    const oldestDate = (leads: Lead[]) => leads[0]?.updated_at || leads[0]?.created_at || null;
    const topPriorityLead =
      sortedPartnerApplications.find((lead) => lead.status !== "active") ||
      applications.find((lead) => lead.status !== "active") ||
      null;

    const actionQueue = [
      {
        key: "review",
        label: "Första bedömning",
        count: needsReview.length,
        oldest: oldestDate(needsReview),
        nextStep: "Gör en snabb intern bedömning och sätt tydlig prioritet på de varma kandidaterna.",
      },
      {
        key: "zz",
        label: "Väntar på ZZ-verifiering",
        count: waitingForZz.length,
        oldest: oldestDate(waitingForZz),
        nextStep: "Följ upp via samtal eller Zoom tills ZZ-join är tydligt bekräftad.",
      },
      {
        key: "intent",
        label: "Väntar på build intent",
        count: waitingForIntent.length,
        oldest: oldestDate(waitingForIntent),
        nextStep: "Be om ett tydligt ja eller nej till att bygga med er modell innan portalstart.",
      },
      {
        key: "ready",
        label: "Redo för onboarding",
        count: readyNow.length,
        oldest: oldestDate(readyNow),
        nextStep: "Skapa teammedlem snabbt medan relationen fortfarande är varm och beslutad.",
      },
      {
        key: "activation",
        label: "Behöver första aktivering",
        count: onboardingNeedsActivation.length,
        oldest: onboardingNeedsActivation[0]?.lead.updated_at || onboardingNeedsActivation[0]?.lead.created_at || null,
        nextStep: "Säkra första inloggning, länkar och ett konkret första steg samma vecka.",
      },
    ].filter((item) => item.count > 0);

    return {
      needsReview,
      waitingForZz,
      waitingForIntent,
      readyNow,
      onboardingNeedsActivation,
      topPriorityLead,
      actionQueue,
    };
  }, [growthCompassRows, partnerApplications, partnerRows, sortedPartnerApplications]);
  const candidateTeamReadinessSummary = useMemo(() => {
    const candidates = partnerApplications.filter((lead) => lead.status !== "active");
    const internalReviewReady = candidates.filter(
      (lead) => getLeadPartnerPriority(lead) !== null || getLeadAdminNote(lead).trim().length > 0,
    );
    const zzVerified = candidates.filter((lead) => getLeadZinzinoVerified(lead));
    const intentConfirmed = candidates.filter((lead) => getLeadTeamIntentConfirmed(lead));
    const readyNow = candidates.filter((lead) => getLeadReviewReady(lead));

    const blockerEntries = [
      {
        key: "review",
        label: "Intern bedömning saknas",
        count: candidates.filter(
          (lead) => getLeadPartnerPriority(lead) === null && getLeadAdminNote(lead).trim().length === 0,
        ).length,
        nextStep: "Sätt prioritet eller skriv en kort intern notering direkt efter första avstämningen.",
      },
      {
        key: "zz",
        label: "ZZ-join ej verifierad",
        count: candidates.filter((lead) => !getLeadZinzinoVerified(lead)).length,
        nextStep: "Bekräfta aktiv join innan personen flyttas vidare till teamlagret.",
      },
      {
        key: "intent",
        label: "Build intent ej bekräftat",
        count: candidates.filter((lead) => !getLeadTeamIntentConfirmed(lead)).length,
        nextStep: "Be om ett tydligt ja till att faktiskt bygga med er modell, inte bara undersöka.",
      },
    ]
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return {
      totalCandidates: candidates.length,
      internalReviewReady: internalReviewReady.length,
      zzVerified: zzVerified.length,
      intentConfirmed: intentConfirmed.length,
      readyNow: readyNow.length,
      topBlocker: blockerEntries[0] || null,
      blockerEntries,
    };
  }, [partnerApplications]);
  const topApplicationFocusList = useMemo(() => {
    return sortedPartnerApplications
      .filter((lead) => getLeadUrgencyLabel(lead) !== "Kan vänta")
      .slice(0, 5)
      .map((lead) => ({
        lead,
        urgency: getLeadUrgencyLabel(lead),
        reason: getLeadUrgencyReason(lead),
        nextStep: getLeadFollowUpRecommendation(lead),
      }));
  }, [sortedPartnerApplications]);
  const adminStuckLists = useMemo(() => {
    if (!data || !partnerFunnelInsights) {
      return [];
    }

    const applicationLookup = new Map(partnerApplications.map((lead) => [lead.name, lead]));
    const partnerLookup = new Map(partnerRows.map((partner) => [partner.partnerName, partner]));

    return partnerFunnelInsights.blockers.map((blocker) => ({
      ...blocker,
      sampleLeads: blocker.samples
        .map((name) => applicationLookup.get(name))
        .filter((lead): lead is Lead => Boolean(lead))
        .slice(0, 3),
      samplePartners: blocker.samples
        .map((name) => partnerLookup.get(name))
        .filter((partner): partner is AdminPartnerRow => Boolean(partner))
        .slice(0, 3),
    }));
  }, [data, partnerApplications, partnerFunnelInsights, partnerRows]);
  const overviewPrioritySummary = useMemo(() => {
    const priorities = [
      onboardingDecisionSummary.actionQueue[0]
        ? {
            area: "Onboarding",
            title: onboardingDecisionSummary.actionQueue[0].label,
            count: onboardingDecisionSummary.actionQueue[0].count,
            age: onboardingDecisionSummary.actionQueue[0].oldest,
            nextStep: onboardingDecisionSummary.actionQueue[0].nextStep,
          }
        : null,
      activationDecisionSummary.actionQueue[0]
        ? {
            area: "Aktivering",
            title: activationDecisionSummary.actionQueue[0].label,
            count: activationDecisionSummary.actionQueue[0].count,
            age: activationDecisionSummary.actionQueue[0].oldest,
            nextStep: activationDecisionSummary.actionQueue[0].nextStep,
          }
        : null,
      trafficActionSummary.actionQueue[0]
        ? {
            area: "Trafik",
            title: `${trafficActionSummary.actionQueue[0].source} - ${trafficActionSummary.actionQueue[0].priority}`,
            count: 1,
            age: null,
            nextStep: trafficActionSummary.actionQueue[0].nextStep,
          }
        : null,
      adminStuckLists[0]
        ? {
            area: "Flaskhals",
            title: adminStuckLists[0].label,
            count: adminStuckLists[0].count,
            age: null,
            nextStep: adminStuckLists[0].nextAction,
          }
        : null,
    ]
      .filter((item): item is { area: string; title: string; count: number; age: string | null; nextStep: string } => Boolean(item))
      .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area))
      .slice(0, 4);

    return {
      priorities,
      headline: priorities[0] || null,
    };
  }, [activationDecisionSummary.actionQueue, adminStuckLists, onboardingDecisionSummary.actionQueue, trafficActionSummary.actionQueue]);

  if (!isDemo && !isSupabaseConfigured) {
    return <Navigate to="/dashboard/login" replace />;
  }

  if (!currentSection) {
    return <Navigate to="/dashboard/admin/overview" replace />;
  }
  const selectedLeadBlockers = selectedLead
    ? [
        ...(partnerPriority !== "none" || adminNote.trim() ? [] : ["Sätt prioritet eller intern bedömning"]),
        ...(zinzinoVerified || selectedLead.status === "active" ? [] : ["Verifiera aktiv Zinzino-join"]),
        ...(teamIntentConfirmed || selectedLead.status === "active" ? [] : ["Bekräfta att personen vill bygga med er"]),
      ]
    : [];
  const selectedLeadReadyForPortal =
    selectedLead?.status === "active" ||
    ((partnerPriority === "hot" || partnerPriority === "follow_up") && zinzinoVerified && teamIntentConfirmed);
  const closeDialog = () => {
    setSelectedLead(null);
    setProvisionedPartner(null);
    setProvisionError(null);
    setCopyStatus(null);
    setZinzinoVerified(false);
    setPartnerPriority("none");
    setAdminNote("");
    setTeamIntentConfirmed(false);
    setReviewStatus(null);
  };

  const closeZzLinksDialog = () => {
    setSelectedPartnerForLinks(null);
    setZzTestUrl("");
    setZzShopUrl("");
    setZzPartnerUrl("");
    setZzConsultationUrl("");
    setZzLinkStatus(null);
  };

  const copyProvisioningDetails = async () => {
    if (!provisionedPartner?.email) {
      return;
    }

    const lines = [
      `Email: ${provisionedPartner.email}`,
      `Referral-kod: ${provisionedPartner.referral_code || "-"}`,
      `Lösenord: ${provisionedPartner.temporary_password || "Befintligt konto återanvändes"}`,
      "Inloggning: /dashboard/login",
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopyStatus("Inloggningsuppgifterna kopierades.");
    } catch {
      setCopyStatus("Det gick inte att kopiera automatiskt. Kopiera uppgifterna manuellt.");
    }
  };

  return (
    <DashboardShell
      title={sectionMeta.title}
      subtitle={sectionMeta.subtitle}
      roleLabel={isDemo ? "Admindemo" : "Admin"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      {!data ? (
        <div className="rounded-[1.75rem] border border-border/70 bg-white/90 p-8 shadow-card">Laddar adminvy...</div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <Button asChild type="button" variant="outline" className="rounded-xl">
              <Link to="/dashboard/partner">
                Öppna partnervyn
              </Link>
            </Button>
          </div>

          {showGuide ? (
            <DashboardSection
              title="Hur man läser adminytan"
              description="Det här är en kort guide till vad siffrorna betyder just nu och hur de ska användas. Vi håller den medvetet enkel så att den blir lätt att översätta senare."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-sm font-medium text-foreground">Översikt</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Använd översikten för att snabbt se inflöde, partnerläge och om något sticker ut som behöver uppföljning.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-sm font-medium text-foreground">Ansökningar</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Här granskar ni partnerintresse, sätter prioritet och avgör vem som ska följas upp eller onboardas.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-sm font-medium text-foreground">Partners</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Här används Tillväxtkompassen. Den visar inte officiell ZZ-status utan en intern tolkning av aktivitet, first line och duplication.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-sm font-medium text-foreground">Trafik</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Trafikvyn handlar om attribution: besök, klick och källor. Den ska inte läsas som payout, revenue eller full affärssanning.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-white p-4">
                  <p className="text-sm font-medium text-foreground">Hur man läser Tillväxtkompassen</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-subtle">
                    <li>Status visar var partnern står just nu, från stillastående till ledarspår.</li>
                    <li>Du saknar visar det minsta gapet till nästa nivå.</li>
                    <li>Nästa bästa steg visar vad partnern borde fokusera på nu.</li>
                    <li>Datatillit visar hur starkt underlaget är bakom tolkningen.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/70 bg-white p-4">
                  <p className="text-sm font-medium text-foreground">Viktiga begrepp</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-subtle">
                    <li>Kund betyder inte besök. Vi räknar hellre konservativt än för brett.</li>
                    <li>Aktiv partner betyder observerbart beteende i systemet, inte bara att någon finns registrerad.</li>
                    <li>Partnergenererat betyder aktivitet från first line eller nedströms, inte partnerns egen trafik.</li>
                    <li>Growth Compass är ett planeringslager ovanpå source of truth, inte officiell Zinzino-logik.</li>
                  </ul>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Totala leads" value={data.metrics.totalLeads} helper="Alla kund- och partnerleads i systemet." icon={<Activity className="h-5 w-5" />} />
            <MetricCard label="Totala kunder" value={data.metrics.totalCustomers} helper="Kunder som är attribuerade till en partner." icon={<BadgeCheck className="h-5 w-5" />} />
            <MetricCard label="Partnerleads" value={data.metrics.totalPartnerLeads} helper="Ansökningar och intresse för partnerskap." icon={<ArrowRightLeft className="h-5 w-5" />} />
            <MetricCard label="Aktiva partners" value={data.metrics.totalActivePartners} helper="Partners med referral-kod och dashboardåtkomst." icon={<Users className="h-5 w-5" />} />
          </div> : null}

          {data.kpis ? (
            <>
              {showOverview ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Attribuerade besök"
                  value={latestFunnelDay?.visits ?? 0}
                  helper="Senaste dagens antal besök via referrals."
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <MetricCard
                  label="Vidareklick"
                  value={latestFunnelDay?.outbound_clicks ?? 0}
                  helper={`Andel besök som klickade vidare: ${formatPercent(latestFunnelDay?.visit_to_click_pct ?? 0)}`}
                  icon={<MousePointerClick className="h-5 w-5" />}
                />
                <MetricCard
                  label="Kända kunder"
                  value={latestKnownCustomers}
                  helper={`Andel kundleads som blivit kända kunder: ${formatPercent(latestFunnelDay?.lead_to_customer_pct ?? 0)}`}
                  icon={<BadgeCheck className="h-5 w-5" />}
                />
                <MetricCard
                  label="Producerande partners"
                  value={producingPartners}
                  helper="Partners som har minst ett attribuerat lead."
                  icon={<Users className="h-5 w-5" />}
                />
              </div> : null}

              {showOverview && partnerFunnelInsights ? <DashboardSection
                title="Partnerfunnel i nuläget"
                description="Två kopplade flöden: först från partnerlead till onboarding, sedan från portalstart till verklig aktivitet och duplication."
              >
                <DataTruthBadges isDemo={isDemo} interpretive />
                <div className="grid gap-8 xl:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Från intresse till onboarding</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {partnerFunnelInsights.applicationStages.map((stage) => (
                        <div key={stage.key} className="rounded-2xl border border-border/70 bg-white/95 p-5 shadow-card">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{stage.label}</p>
                          <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(stage.count)}</p>
                          <p className="mt-2 text-sm text-subtle">{stage.description}</p>
                          <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-foreground/75">
                            {formatFunnelDelta(stage.conversionFromPrevious)}
                          </p>
                          {stage.dropFromPrevious !== null ? (
                            <p className="mt-1 text-xs text-subtle">Tapp från föregående steg: {formatWholeNumber(stage.dropFromPrevious)}</p>
                          ) : null}
                          <p className="mt-3 text-sm leading-6 text-foreground/80">{stage.focus}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Efter onboarding</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {partnerFunnelInsights.activationStages.map((stage) => (
                        <div key={stage.key} className="rounded-2xl border border-border/70 bg-white/95 p-5 shadow-card">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{stage.label}</p>
                          <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(stage.count)}</p>
                          <p className="mt-2 text-sm text-subtle">{stage.description}</p>
                          <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-foreground/75">
                            {formatFunnelDelta(stage.conversionFromPrevious)}
                          </p>
                          {stage.dropFromPrevious !== null ? (
                            <p className="mt-1 text-xs text-subtle">Tapp från föregående steg: {formatWholeNumber(stage.dropFromPrevious)}</p>
                          ) : null}
                          <p className="mt-3 text-sm leading-6 text-foreground/80">{stage.focus}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-border/70 bg-secondary/25 p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Prioriterad flaskhals</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{partnerFunnelInsights.headline.title}</p>
                    <p className="mt-3 text-sm leading-6 text-subtle">{partnerFunnelInsights.headline.summary}</p>
                    <p className="mt-4 text-sm font-medium leading-6 text-foreground/80">{partnerFunnelInsights.headline.nextAction}</p>
                  </div>

                  <div className="grid gap-3">
                    {partnerFunnelInsights.blockers.slice(0, 3).map((blocker) => (
                      <div key={blocker.key} className="rounded-2xl border border-border/70 bg-white/95 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{blocker.label}</p>
                            <p className="mt-2 text-sm leading-6 text-subtle">{blocker.description}</p>
                          </div>
                          <Badge variant={blocker.count > 0 ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                            {formatWholeNumber(blocker.count)}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-foreground/80">{blocker.nextAction}</p>
                        <p className="mt-3 text-xs text-subtle">
                          Exempel: {blocker.samples.length ? blocker.samples.join(", ") : "Inga tydliga namn just nu."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardSection> : null}

              {showOverview && overviewPrioritySummary.priorities.length ? <DashboardSection
                title="Dagens fokus"
                description="De viktigaste besluten just nu, samlade från onboarding, aktivering, trafik och flaskhalsar."
              >
                <DataTruthBadges isDemo={isDemo} interpretive />
                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[1.5rem] border border-border/70 bg-secondary/25 p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Högst prioritet</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">
                      {overviewPrioritySummary.headline?.title || "-"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-subtle">
                      {overviewPrioritySummary.headline
                        ? `${overviewPrioritySummary.headline.area} berör ${formatWholeNumber(overviewPrioritySummary.headline.count)} poster${overviewPrioritySummary.headline.age ? ` och den äldsta väntan är ${formatElapsedDays(overviewPrioritySummary.headline.age).toLowerCase()}` : ""}.`
                        : "Ingen tydlig toppprioritet just nu."}
                    </p>
                    <p className="mt-4 text-sm font-medium leading-6 text-foreground/80">
                      {overviewPrioritySummary.headline?.nextStep || "Fortsätt arbeta steg för steg i adminytan."}
                    </p>
                  </div>

                  <DataTable
                    columns={["Område", "Nu", "Omfattning", "Nästa steg"]}
                    rows={overviewPrioritySummary.priorities.map((item) => [
                      <span key={`${item.area}-area`} className="font-medium text-foreground">{item.area}</span>,
                      <span key={`${item.area}-title`} className="max-w-[220px] text-sm text-subtle">{item.title}</span>,
                      <span key={`${item.area}-count`}>
                        {formatWholeNumber(item.count)}{item.age ? ` • ${formatElapsedDays(item.age)}` : ""}
                      </span>,
                      <span key={`${item.area}-next`} className="max-w-[320px] text-sm text-subtle">{item.nextStep}</span>,
                    ])}
                    emptyState="Ingen prioritering sticker ut just nu."
                  />
                </div>
              </DashboardSection> : null}

              {showOverview && adminStuckLists.length ? <DashboardSection
                title="Stuck-lists per steg"
                description="Arbetsköer för exakt var rörelsen fastnar just nu. Börja där antalet och friktionen är störst."
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  {adminStuckLists.map((blocker) => (
                    <div key={blocker.key} className="rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{blocker.label}</p>
                          <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(blocker.count)}</p>
                        </div>
                        <Badge variant={blocker.count > 0 ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                          {blocker.count > 0 ? "Behöver åtgärd" : "Under kontroll"}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-subtle">{blocker.description}</p>
                      <p className="mt-3 text-sm leading-6 text-foreground/85">{blocker.nextAction}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {blocker.sampleLeads.map((lead) => (
                          <Button
                            key={`${blocker.key}-${lead.id}`}
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            disabled={isDemo}
                            onClick={() => {
                              setSelectedLead(lead);
                              setProvisionedPartner(null);
                              setProvisionError(null);
                              setZinzinoVerified(false);
                            }}
                          >
                            {lead.name}
                          </Button>
                        ))}
                        {blocker.samplePartners.map((partner) => (
                          <Button
                            key={`${blocker.key}-${partner.partnerId}`}
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setSelectedPartnerForLinks(partner)}
                          >
                            {partner.partnerName}
                          </Button>
                        ))}
                        {!blocker.sampleLeads.length && !blocker.samplePartners.length ? (
                          <span className="text-sm text-subtle">Inga tydliga namn just nu.</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardSection> : null}

              {showOverview ? <DashboardSection
                title="Mikroevent i funneln"
                description="Tidiga signaler som visar om trafiken faktiskt rör sig från landning till klick och vidare till formulär."
              >
                <DataTruthBadges isDemo={isDemo} />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <MetricCard
                    label="Landningar"
                    value={funnelEventSummary.landings}
                    helper="Registrerade landningsvisningar med referral eller lagrad attribution."
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                  <MetricCard
                    label="CTA-klick"
                    value={funnelEventSummary.ctaClicks}
                    helper="Hero-, sticky- och closing-CTA som faktiskt klickats."
                    icon={<MousePointerClick className="h-5 w-5" />}
                  />
                  <MetricCard
                    label="Formstarter"
                    value={funnelEventSummary.formStarts}
                    helper="När någon faktiskt börjar fylla i kund- eller partnerformulär."
                    icon={<Activity className="h-5 w-5" />}
                  />
                  <MetricCard
                    label="Skickade formulär"
                    value={funnelEventSummary.formSubmits}
                    helper="Formulär som gick till submit-flödet och skickades vidare."
                    icon={<BadgeCheck className="h-5 w-5" />}
                  />
                  <MetricCard
                    label="Skickfel"
                    value={funnelEventSummary.submitFailures}
                    helper="Formförsök som stannade innan lead kunde drivas vidare."
                    icon={<ArrowRightLeft className="h-5 w-5" />}
                  />
                </div>
              </DashboardSection> : null}

                {showOverview ? <DashboardSection
                  title="Ledtid mellan steg"
                  description="Första versionen av funnelns tidsmått. Här ser ni hur snabbt verkliga sessioner rör sig från landning till handling."
                >
                  <DataTruthBadges isDemo={isDemo} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Besöksflöde</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {funnelTimingInsights.steps.map((step) => (
                      <MetricCard
                        key={step.key}
                        label={step.label}
                      value={formatDuration(step.medianSeconds)}
                      helper={`${formatPercent(step.completionRatePct)} gick vidare från ${formatWholeNumber(step.fromCount)} sessioner. Uppmätta övergångar: ${formatWholeNumber(step.completionCount)}.`}
                      icon={<Activity className="h-5 w-5" />}
                    />
                  ))}
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.5rem] border border-border/70 bg-secondary/25 p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Prioriterad tidsfriktion</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{funnelTimingInsights.headline.title}</p>
                    <p className="mt-3 text-sm leading-6 text-subtle">{funnelTimingInsights.headline.summary}</p>
                    <p className="mt-4 text-sm font-medium leading-6 text-foreground/80">{funnelTimingInsights.headline.nextAction}</p>
                    <p className="mt-4 text-xs text-subtle">Analyserade sessioner: {formatWholeNumber(funnelTimingInsights.sessionsAnalyzed)}</p>
                  </div>

                  <DataTable
                    columns={["Steg", "Median", "Snitt", "Completion", "Underlag"]}
                    rows={funnelTimingInsights.steps.map((step) => [
                      <div key={`${step.key}-label`}>
                        <p className="font-medium text-foreground">{step.label}</p>
                        <p className="text-xs text-subtle">{step.description}</p>
                      </div>,
                      <span key={`${step.key}-median`}>{formatDuration(step.medianSeconds)}</span>,
                      <span key={`${step.key}-average`}>{formatDuration(step.averageSeconds)}</span>,
                      <span key={`${step.key}-completion`}>{formatPercent(step.completionRatePct)}</span>,
                      <span key={`${step.key}-sample`}>{formatWholeNumber(step.completionCount)} / {formatWholeNumber(step.fromCount)}</span>,
                    ])}
                      emptyState="Ingen ledtidsdata än."
                    />
                  </div>

                  <div className="mt-8">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Partnerlivscykel</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {partnerLifecycleTimingInsights.steps.map((step) => (
                        <MetricCard
                          key={step.key}
                          label={step.label}
                          value={formatDuration(step.medianSeconds)}
                          helper={`${formatPercent(step.completionRatePct)} gick vidare från ${formatWholeNumber(step.fromCount)} poster. Uppmätta övergångar: ${formatWholeNumber(step.completionCount)}.`}
                          icon={<Activity className="h-5 w-5" />}
                        />
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-[1.5rem] border border-border/70 bg-secondary/25 p-5">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Prioriterad partnerfriktion</p>
                        <p className="mt-3 text-2xl font-semibold text-foreground">{partnerLifecycleTimingInsights.headline.title}</p>
                        <p className="mt-3 text-sm leading-6 text-subtle">{partnerLifecycleTimingInsights.headline.summary}</p>
                        <p className="mt-4 text-sm font-medium leading-6 text-foreground/80">{partnerLifecycleTimingInsights.headline.nextAction}</p>
                        <p className="mt-4 text-xs text-subtle">Analyserade partnerposter: {formatWholeNumber(partnerLifecycleTimingInsights.recordsAnalyzed)}</p>
                      </div>

                      <DataTable
                        columns={["Steg", "Median", "Snitt", "Completion", "Underlag"]}
                        rows={partnerLifecycleTimingInsights.steps.map((step) => [
                          <div key={`${step.key}-label`}>
                            <p className="font-medium text-foreground">{step.label}</p>
                            <p className="text-xs text-subtle">{step.description}</p>
                          </div>,
                          <span key={`${step.key}-median`}>{formatDuration(step.medianSeconds)}</span>,
                          <span key={`${step.key}-average`}>{formatDuration(step.averageSeconds)}</span>,
                          <span key={`${step.key}-completion`}>{formatPercent(step.completionRatePct)}</span>,
                          <span key={`${step.key}-sample`}>{formatWholeNumber(step.completionCount)} / {formatWholeNumber(step.fromCount)}</span>,
                        ])}
                        emptyState="Ingen partnerledtid än."
                      />
                    </div>
                  </div>
                </DashboardSection> : null}

              {showOverview || showTraffic ? <div className="grid gap-8 xl:grid-cols-2">
                {showTraffic ? <DashboardSection
                  title="Tratten just nu"
                  description="Daglig överblick över attribuerade besök, klick vidare, kundleads och kända kunder."
                >
                  <DataTable
                    columns={["Dag", "Besök", "Klick", "Kundleads", "Kända kunder", "Besök till klick", "Lead till kund"]}
                    rows={(data.kpis.funnelDaily || []).slice(0, 7).map((row) => [
                      <span key={`${row.day}-day`} className="font-medium text-foreground">{formatDate(row.day)}</span>,
                      <span key={`${row.day}-visits`}>{row.visits}</span>,
                      <span key={`${row.day}-clicks`}>{row.outbound_clicks}</span>,
                      <span key={`${row.day}-leads`}>{row.customer_leads}</span>,
                      <span key={`${row.day}-customers`}>{row.customers}</span>,
                      <span key={`${row.day}-visit-to-click`}>{formatPercent(row.visit_to_click_pct)}</span>,
                      <span key={`${row.day}-lead-to-customer`}>{formatPercent(row.lead_to_customer_pct)}</span>,
                    ])}
                    emptyState="Ingen funneldata än."
                  />
                </DashboardSection> : null}

                {showOverview ? <DashboardSection
                  title="Partnerresan"
                  description="Hur många som ansöker, verifieras, aktiveras och faktiskt börjar producera."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ansökningar</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{pipeline?.applications ?? 0}</p>
                      <p className="mt-2 text-sm text-subtle">Andel verifierade: {formatPercent(pipeline?.application_to_verified_pct ?? 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Aktiva konton</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{pipeline?.active_partner_accounts ?? 0}</p>
                      <p className="mt-2 text-sm text-subtle">Verifierade till aktiva: {formatPercent(pipeline?.verified_to_active_pct ?? 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nya kandidater</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{pipeline?.new_candidates ?? 0}</p>
                      <p className="mt-2 text-sm text-subtle">Väntar på granskning eller kontakt.</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Partnerkonton</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{pipeline?.portal_partner_users ?? 0}</p>
                      <p className="mt-2 text-sm text-subtle">Nuvarande partneråtkomst i `users`.</p>
                    </div>
                  </div>
                </DashboardSection> : null}
              </div> : null}

              {showTraffic ? <div className="grid gap-8 xl:grid-cols-2">
                <DashboardSection
                  title="Event per steg"
                  description="Daglig överblick över mikroevent så att ni kan se var rörelsen avtar innan lead eller onboarding."
                >
                  <DataTruthBadges isDemo={isDemo} />
                  <DataTable
                    columns={["Dag", "Event", "Antal"]}
                    rows={funnelEventRows.slice(0, 10).map((row) => [
                      <span key={`${row.day}-${row.event_name}-day`} className="font-medium text-foreground">{formatDate(row.day)}</span>,
                      <span key={`${row.day}-${row.event_name}-name`}>{getFunnelEventLabel(row.event_name)}</span>,
                      <span key={`${row.day}-${row.event_name}-events`}>{formatWholeNumber(row.events)}</span>,
                    ])}
                    emptyState="Ingen eventdata än."
                  />
                </DashboardSection>

                <DashboardSection
                  title="Senaste funnel-händelser"
                  description="Snabb logg över de senaste interaktionerna som nått eventlagret."
                >
                  <DataTruthBadges isDemo={isDemo} />
                  <DataTable
                    columns={["Tid", "Event", "Sida", "Referral", "Detalj"]}
                    rows={recentFunnelEvents.slice(0, 10).map((event) => [
                      <span key={`${event.id}-time`} className="font-medium text-foreground">{formatDate(event.created_at)}</span>,
                      <span key={`${event.id}-name`}>{getFunnelEventLabel(event.event_name)}</span>,
                      <span key={`${event.id}-path`} className="max-w-[180px] truncate">{event.page_path}</span>,
                      <span key={`${event.id}-ref`}>{event.referral_code || "Direkt"}</span>,
                      <span key={`${event.id}-details`} className="max-w-[220px] truncate text-subtle">
                        {formatFunnelEventDetails(event.details)}
                      </span>,
                    ])}
                    emptyState="Inga funnel-events loggade än."
                  />
                </DashboardSection>
              </div> : null}

              {showTraffic ? <div className="grid gap-8 xl:grid-cols-2">
                <DashboardSection
                  title="Trafikbeslut just nu"
                  description="Tolkning av var traction faktiskt fungerar, var den fastnar och vad admin bör göra härnäst."
                >
                  <DataTruthBadges isDemo={isDemo} interpretive />
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Starkaste källa</p>
                      <p className="mt-3 text-xl font-semibold text-foreground">
                        {trafficActionSummary.strongestSource?.source || "-"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-subtle">
                        {trafficActionSummary.strongestSource
                          ? `${formatWholeNumber(trafficActionSummary.strongestSource.formDriven)} nådde formulär och ${formatWholeNumber(trafficActionSummary.strongestSource.sessions)} sessioner observerades.`
                          : "Ingen källa sticker ut än."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Störst friktion</p>
                      <p className="mt-3 text-xl font-semibold text-foreground">
                        {trafficActionSummary.frictionSource?.source || "-"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-subtle">
                        {trafficActionSummary.frictionSource
                          ? trafficActionSummary.frictionSource.recommendation
                          : "Ingen tydlig flaskhals i källdata än."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Starkaste landning</p>
                      <p className="mt-3 text-xl font-semibold text-foreground">
                        {trafficActionSummary.strongestLanding?.[0] || "-"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-subtle">
                        {trafficActionSummary.strongestLanding
                          ? `${formatWholeNumber(trafficActionSummary.strongestLanding[1])} attribuerade besök.`
                          : "Ingen landning sticker ut än."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <DataTable
                      columns={["Källa", "Prioritet", "Signal", "Nästa steg"]}
                      rows={trafficActionSummary.actionQueue.map((item) => [
                        <span key={`${item.source}-source`} className="font-medium text-foreground">{item.source}</span>,
                        <span key={`${item.source}-priority`}>{item.priority}</span>,
                        <span key={`${item.source}-summary`} className="max-w-[220px] truncate text-subtle">{item.summary}</span>,
                        <span key={`${item.source}-next`} className="max-w-[320px] truncate text-subtle">{item.nextStep}</span>,
                      ])}
                      emptyState="Ingen trafik att prioritera än."
                    />
                  </div>
                </DashboardSection>

                <DashboardSection
                  title="Surfade sidor"
                  description="Enkel överblick över vilka sidor besökare faktiskt tittar på när de rör sig vidare efter första landningen."
                >
                  <DataTruthBadges isDemo={isDemo} />
                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <MetricCard
                      label="Sidvisningar"
                      value={funnelEventSummary.pageViews}
                      helper="Registrerade page_viewed-events på publika sidor."
                      icon={<Activity className="h-5 w-5" />}
                    />
                    <MetricCard
                      label="Landningar"
                      value={funnelEventSummary.landings}
                      helper="Första attribuerade landningar via referrals eller lagrad attribution."
                      icon={<TrendingUp className="h-5 w-5" />}
                    />
                  </div>
                  <DataTable
                    columns={["Sida", "Sidvisningar"]}
                    rows={funnelEventSummary.topViewedPages.map(([pagePath, views]) => [
                      <span key={`${pagePath}-path`} className="font-medium text-foreground">{pagePath}</span>,
                      <span key={`${pagePath}-views`}>{formatWholeNumber(views)}</span>,
                    ])}
                    emptyState="Inga sidvisningar loggade än."
                  />
                </DashboardSection>

                <DashboardSection
                  title="Sessionsresor"
                  description="De senaste sessionerna från första landning till sidvisningar, CTA och formulär. Bra för att se om traction stannar vid tittande eller går vidare."
                >
                  <DataTruthBadges isDemo={isDemo} />
                  <div className="mb-4">
                    <DataTable
                      columns={["Källa", "Sessioner", "Bara surf", "CTA", "Form"]}
                      rows={sessionSourceSummary.map((row) => [
                        <span key={`${row.source}-source`} className="font-medium text-foreground">{row.source}</span>,
                        <span key={`${row.source}-sessions`}>{formatWholeNumber(row.sessions)}</span>,
                        <span key={`${row.source}-surf`}>{formatWholeNumber(row.surfOnly)}</span>,
                        <span key={`${row.source}-cta`}>{formatWholeNumber(row.ctaDriven)}</span>,
                        <span key={`${row.source}-form`}>{formatWholeNumber(row.formDriven)}</span>,
                      ])}
                      emptyState="Ingen källsummering än."
                    />
                  </div>
                  <DataTable
                    columns={["Start", "Källa", "Landning", "Sidor", "Nästa steg", "Spår"]}
                    rows={sessionJourneySummary.map((session) => [
                      <div key={`${session.sessionId}-start`}>
                        <p className="font-medium text-foreground">{formatDate(session.firstSeenAt)}</p>
                        <p className="text-xs text-subtle">{session.referralCode || "Direkt"}</p>
                      </div>,
                      <span key={`${session.sessionId}-source`}>{session.source || "Direkt"}</span>,
                      <span key={`${session.sessionId}-landing`} className="max-w-[180px] truncate">{session.landingPage}</span>,
                      <span key={`${session.sessionId}-pages`}>{formatWholeNumber(session.pageViews)}</span>,
                      <div key={`${session.sessionId}-next`} className="text-sm text-subtle">
                        {session.submittedForm
                          ? "Form skickad"
                          : session.reachedForm
                            ? "Form påbörjad"
                            : session.ctaClicks > 0
                              ? `${formatWholeNumber(session.ctaClicks)} CTA-klick`
                              : "Bara surf"}
                      </div>,
                      <span key={`${session.sessionId}-trail`} className="max-w-[260px] truncate text-subtle">
                        {session.pageTrail.length ? session.pageTrail.join(" -> ") : "-"}
                      </span>,
                    ])}
                    emptyState="Inga sessionsresor loggade än."
                  />
                </DashboardSection>

                <DashboardSection
                  title="Duplicering"
                  description="Vilka partners som faktiskt börjar skapa eget attribuerat inflöde och kända resultat."
                >
                  <DataTruthBadges isDemo={isDemo} />
                  <DataTable
                    columns={["Partner", "Besök", "Klick", "Leads", "Kundleads", "Partnerleads", "Kända kunder"]}
                    rows={(data.kpis.duplication || []).slice(0, 8).map((row) => [
                      <div key={`${row.partner_id}-name`}>
                        <p className="font-medium text-foreground">{row.partner_name}</p>
                        <p className="text-xs text-subtle">{row.email}</p>
                      </div>,
                      <span key={`${row.partner_id}-visits`}>{row.visits}</span>,
                      <span key={`${row.partner_id}-clicks`}>{row.outbound_clicks}</span>,
                      <span key={`${row.partner_id}-leads`}>{row.total_leads}</span>,
                      <span key={`${row.partner_id}-customer-leads`}>{row.customer_leads}</span>,
                      <span key={`${row.partner_id}-partner-leads`}>{row.partner_leads}</span>,
                      <span key={`${row.partner_id}-customers`}>{row.customers}</span>,
                    ])}
                    emptyState="Ingen dupliceringsdata än."
                  />
                </DashboardSection>

                <DashboardSection
                  title="Trafikkällor"
                  description="Senaste attribuerade besök uppdelade på källa, medium och landningssida."
                >
                  <DataTruthBadges isDemo={isDemo} />
                  <div className="mb-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Toppkällor</p>
                      <div className="mt-3 space-y-2">
                        {trafficSourceSummary.topSources.map(([source, visits]) => (
                          <div key={`source-${source}`} className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate text-foreground">{source}</span>
                            <span className="font-medium text-foreground">{formatWholeNumber(visits)}</span>
                          </div>
                        ))}
                        {!trafficSourceSummary.topSources.length ? <p className="text-sm text-subtle">Ingen källdata än.</p> : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Toppkampanjer</p>
                      <div className="mt-3 space-y-2">
                        {trafficSourceSummary.topCampaigns.map(([campaign, visits]) => (
                          <div key={`campaign-${campaign}`} className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate text-foreground">{campaign}</span>
                            <span className="font-medium text-foreground">{formatWholeNumber(visits)}</span>
                          </div>
                        ))}
                        {!trafficSourceSummary.topCampaigns.length ? <p className="text-sm text-subtle">Ingen kampanjdata än.</p> : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Topplandningar</p>
                      <div className="mt-3 space-y-2">
                        {trafficSourceSummary.topLandingPages.map(([landingPage, visits]) => (
                          <div key={`landing-${landingPage}`} className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate text-foreground">{landingPage}</span>
                            <span className="font-medium text-foreground">{formatWholeNumber(visits)}</span>
                          </div>
                        ))}
                        {!trafficSourceSummary.topLandingPages.length ? <p className="text-sm text-subtle">Ingen landningsdata än.</p> : null}
                      </div>
                    </div>
                  </div>
                  <DataTable
                    columns={["Dag", "Källa", "Medium", "Kampanj", "Landningssida", "Besök"]}
                    rows={(data.kpis.sourceMixDaily || []).slice(0, 8).map((row) => [
                      <span key={`${row.day}-${row.source}-day`} className="font-medium text-foreground">{formatDate(row.day)}</span>,
                      <span key={`${row.day}-${row.source}-source`}>{row.source}</span>,
                      <span key={`${row.day}-${row.source}-medium`}>{row.medium}</span>,
                      <span key={`${row.day}-${row.source}-campaign`}>{row.campaign}</span>,
                      <span key={`${row.day}-${row.source}-landing`}>{row.landing_page}</span>,
                      <span key={`${row.day}-${row.source}-visits`}>{row.visits}</span>,
                    ])}
                    emptyState="Ingen källdata än."
                  />
                </DashboardSection>
              </div> : null}

              {showOverview || showPartners ? <DashboardSection
                title="Tillväxtkompass"
                description="Intern kompass för senaste tidens partnerutveckling, dupliceringssignaler och viktigaste nästa steg. Detta är vägledning, inte officiell Zinzino-status."
              >
                <DataTruthBadges isDemo={isDemo} interpretive />
                <DataTable
                  columns={["Partner", "Status", "Poäng", "Datatillit", "Nästa steg", "Visa"]}
                  rows={growthCompassRows.slice(0, 12).map((row) => [
                    <button
                      key={`${row.partnerId}-partner`}
                      type="button"
                      className="text-left"
                      onClick={() => setSelectedGrowthCompassPartnerId(row.partnerId)}
                    >
                      <p className="font-medium text-foreground">{row.partnerName}</p>
                      <p className="text-xs text-subtle">{row.email}</p>
                    </button>,
                    <Badge
                      key={`${row.partnerId}-status`}
                      variant={getGrowthCompassVariant(row.status)}
                      className="rounded-full px-3 py-1 capitalize"
                    >
                      {getGrowthCompassLabel(row.status)}
                    </Badge>,
                    <span key={`${row.partnerId}-score`} className="font-medium text-foreground">{row.score}</span>,
                    <Badge
                      key={`${row.partnerId}-confidence`}
                      variant={getConfidenceVariant(row.confidence.overall)}
                      className="rounded-full px-3 py-1"
                    >
                      {getConfidenceLabel(row.confidence.overall)}
                    </Badge>,
                    <div key={`${row.partnerId}-action`} className="max-w-[260px] text-sm text-subtle">
                      {row.nextBestAction}
                    </div>,
                    <Button
                      key={`${row.partnerId}-open`}
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        setSelectedGrowthCompassPartnerId(row.partnerId);
                        setGrowthCompassDialogOpen(true);
                      }}
                    >
                      Visa
                    </Button>,
                  ])}
                  emptyState="Ingen tillväxtdata än."
                />
              </DashboardSection> : null}

              {showOverview || showPartners ? <DashboardSection
                title="Tillväxtprognos"
                description="Intern scenarioöverblick för 12, 24, 36 och 60 månader. Modellen väger ihop systemdriven tillväxt och extern relationsdriven tillväxt. Detta är inte officiell ZZ-payout."
              >
                <DataTruthBadges isDemo={isDemo} projected />
                <div className="max-w-md rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Välj scenario</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Select
                      value={selectedProjectionScenarioName}
                      onValueChange={(value) => {
                        setSelectedProjectionScenarioName(value);
                      }}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Välj scenario" />
                      </SelectTrigger>
                      <SelectContent>
                        {growthProjectionSummaries.map((scenario) => (
                          <SelectItem key={scenario.name} value={scenario.name}>
                            {scenario.name === "low" ? "Låg" : scenario.name === "mid" ? "Mellan" : "Hög"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      disabled={!selectedProjectionScenarioName}
                      onClick={() => setProjectionDialogOpen(true)}
                    >
                      Visa
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-subtle">
                    Välj ett scenario för att öppna hela prognosen i större vy.
                  </p>
                </div>
              </DashboardSection> : null}
            </>
          ) : null}

          {showPartners ? <div className="grid gap-8">
            <DashboardSection title="Leads per partner" description="Snabb överblick över vilka som driver inflöde just nu.">
              <DataTable
                columns={["Partner", "Kod", "Klick", "Leads", "Kunder"]}
                rows={data.leadsPerPartner.map((row) => [
                  <div key={`${row.partnerId}-name`}>
                    <p className="font-medium text-foreground">{row.partnerName}</p>
                  </div>,
                  <Badge key={`${row.partnerId}-code`} variant="secondary" className="rounded-full px-3 py-1">
                    {row.referralCode}
                  </Badge>,
                  <span key={`${row.partnerId}-clicks`}>{row.clicks}</span>,
                  <span key={`${row.partnerId}-leads`}>{row.leads}</span>,
                  <span key={`${row.partnerId}-customers`}>{row.customers}</span>,
                ])}
                emptyState="Ingen partnerdata ännu."
              />
            </DashboardSection>
          </div> : null}

          {showPartners ? <div className="grid gap-8">
            {showPartners ? <DashboardSection title="Direkta partnerrelationer" description="Det här visar bara våra egna relationer och uppföljning runt ZZ-flödet, inte Zinzinos officiella nätverksträd.">
              <div className="space-y-3">
                {data.networkOverview.length ? (
                  data.networkOverview.map((member) => (
                    <div key={member.partnerId} className="flex items-center justify-between rounded-2xl border border-border/70 bg-secondary/40 px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{member.partnerName}</p>
                        <p className="text-sm text-subtle">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Nivå {member.level}</p>
                        <p className="text-sm text-subtle">{formatDate(member.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-subtle">Inga partnerrelationer ännu.</p>
                )}
              </div>
            </DashboardSection> : null}
          </div> : null}

          {showApplications ? <DashboardSection title="Senaste partneransökningar" description="Här driver ni flödet från partnerlead till kandidat och vidare till teammedlem. Konto skapas först när personen är verifierad som partner hos Zinzino och ska in i vårt teamlager.">
            <div className="mb-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Partnerleads</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{pipeline?.applications ?? 0}</p>
                <p className="mt-2 text-sm text-subtle">Tidigt intresse fångat via funnel eller kontaktpunkt.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Kandidater</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{pipeline?.verified_candidates ?? 0}</p>
                <p className="mt-2 text-sm text-subtle">Granskade och kvalificerade för fortsatt uppföljning.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Teammedlemmar</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{pipeline?.portal_partner_users ?? 0}</p>
                <p className="mt-2 text-sm text-subtle">Partnerkonton i portalen för dem som faktiskt arbetar i vår modell.</p>
              </div>
            </div>

            <div className="mb-6 rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Varmast just nu</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {onboardingDecisionSummary.topPriorityLead?.name || "-"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    {onboardingDecisionSummary.topPriorityLead
                      ? getLeadFollowUpRecommendation(onboardingDecisionSummary.topPriorityLead)
                      : "Ingen tydlig kandidat sticker ut just nu."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nästa låsta steg</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {onboardingDecisionSummary.actionQueue[0]?.label || "-"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    {onboardingDecisionSummary.actionQueue[0]
                      ? `${formatWholeNumber(onboardingDecisionSummary.actionQueue[0].count)} poster ligger här just nu.`
                      : "Inga tydliga blockers i onboardingflödet just nu."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fokus denna rytm</p>
                  <p className="mt-3 text-sm leading-6 text-foreground/85">
                    Flytta kandidater ett steg i taget: bedöm snabbt, verifiera ZZ, bekräfta build intent och onboarda direkt när allt är klart.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <DataTable
                  columns={["Kö", "Antal", "Äldst väntan", "Nästa steg"]}
                  rows={onboardingDecisionSummary.actionQueue.map((item) => [
                    <span key={`${item.key}-label`} className="font-medium text-foreground">{item.label}</span>,
                    <span key={`${item.key}-count`}>{formatWholeNumber(item.count)}</span>,
                    <span key={`${item.key}-oldest`}>{formatElapsedDays(item.oldest)}</span>,
                    <span key={`${item.key}-next`} className="max-w-[320px] text-sm text-subtle">{item.nextStep}</span>,
                  ])}
                  emptyState="Inga onboardingköer sticker ut just nu."
                />
              </div>
            </div>

            <div className="mb-6 rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Kandidat till teammedlem</p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-subtle">
                    Här ser ni vad som faktiskt måste vara klart innan någon ska bli teammedlem i portalen: intern bedömning,
                    verifierad ZZ-join och tydligt build intent.
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Kandidater nu</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(candidateTeamReadinessSummary.totalCandidates)}</p>
                      <p className="mt-2 text-sm text-subtle">Alla som ännu inte är aktiva teammedlemmar.</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Intern bedömning klar</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(candidateTeamReadinessSummary.internalReviewReady)}</p>
                      <p className="mt-2 text-sm text-subtle">Prioritet eller intern notering finns redan satt.</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">ZZ verifierad</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(candidateTeamReadinessSummary.zzVerified)}</p>
                      <p className="mt-2 text-sm text-subtle">Aktiv join är bekräftad och inte bara antagen.</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Redo för teamlager</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(candidateTeamReadinessSummary.readyNow)}</p>
                      <p className="mt-2 text-sm text-subtle">Alla tre kriterierna är klara och onboarding kan starta.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Största blocker just nu</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {candidateTeamReadinessSummary.topBlocker?.label || "-"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    {candidateTeamReadinessSummary.topBlocker
                      ? `${formatWholeNumber(candidateTeamReadinessSummary.topBlocker.count)} kandidater stoppas här just nu.`
                      : "Inga tydliga kandidatblockers sticker ut just nu."}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-foreground/85">
                    {candidateTeamReadinessSummary.topBlocker?.nextStep || "Håll tempot uppe från första bedömning till faktisk portalstart."}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <DataTable
                  columns={["Kriterium", "Hur många saknar detta", "Vad admin bör göra nu"]}
                  rows={candidateTeamReadinessSummary.blockerEntries.map((item) => [
                    <span key={`${item.key}-label`} className="font-medium text-foreground">{item.label}</span>,
                    <span key={`${item.key}-count`}>{formatWholeNumber(item.count)}</span>,
                    <span key={`${item.key}-step`} className="max-w-[420px] text-sm text-subtle">{item.nextStep}</span>,
                  ])}
                  emptyState="Alla tydliga kandidatkriterier är uppfyllda just nu."
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Redo men ej onboardade</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(leadsReadyButNotOnboarded.length)}</p>
                  <p className="mt-2 text-sm text-subtle">Allt är bekräftat, men portalåtkomst är ännu inte skapad.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Längst väntan</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">
                    {leadsReadyButNotOnboarded[0] ? formatElapsedDays(leadsReadyButNotOnboarded[0].updated_at || leadsReadyButNotOnboarded[0].created_at) : "-"}
                  </p>
                  <p className="mt-2 text-sm text-subtle">Tid sedan leaden senast uppdaterades eller först kom in.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fokus nu</p>
                  <p className="mt-3 text-sm leading-6 text-foreground/85">
                    Skapa teammedlem snabbt när allt redan är verifierat, så att onboarding startar medan relationen fortfarande är varm.
                  </p>
                </div>
              </div>

              <DataTable
                columns={["Sökande", "Kontakt", "Redo sedan", "Nästa steg", "Åtgärd"]}
                rows={leadsReadyButNotOnboarded.map((lead) => [
                  <div key={`${lead.id}-ready-name`}>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-subtle">{lead.email}</p>
                  </div>,
                  <span key={`${lead.id}-ready-contact`} className="max-w-[220px] text-sm text-subtle">
                    {getLeadContactMethod(lead)}
                  </span>,
                  <span key={`${lead.id}-ready-since`}>
                    {formatElapsedDays(lead.updated_at || lead.created_at)}
                  </span>,
                  <span key={`${lead.id}-ready-next`} className="max-w-[280px] text-sm text-subtle">
                    {getLeadFollowUpRecommendation(lead)}
                  </span>,
                  <Button
                    key={`${lead.id}-ready-open`}
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={isDemo}
                    onClick={() => {
                      setSelectedLead(lead);
                      setProvisionedPartner(null);
                      setProvisionError(null);
                      setZinzinoVerified(false);
                    }}
                  >
                    Öppna ansökan
                  </Button>,
                ])}
                emptyState="Ingen lead är klar men ännu inte onboardad just nu."
              />
            </div>

            {partnerFunnelInsights ? (
              <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">Funnel till onboarding</p>
                  <DataTable
                    columns={["Steg", "Antal", "Från föregående", "Tapp", "Fokus nu"]}
                    rows={partnerFunnelInsights.applicationStages.map((stage) => [
                      <div key={`${stage.key}-label`}>
                        <p className="font-medium text-foreground">{stage.label}</p>
                        <p className="mt-1 max-w-[280px] text-xs leading-5 text-subtle">{stage.description}</p>
                      </div>,
                      <span key={`${stage.key}-count`} className="font-medium text-foreground">{formatWholeNumber(stage.count)}</span>,
                      <span key={`${stage.key}-conversion`}>{formatFunnelDelta(stage.conversionFromPrevious)}</span>,
                      <span key={`${stage.key}-drop`}>{stage.dropFromPrevious === null ? "-" : formatWholeNumber(stage.dropFromPrevious)}</span>,
                      <span key={`${stage.key}-focus`} className="max-w-[260px] text-sm text-subtle">{stage.focus}</span>,
                    ])}
                    emptyState="Ingen funneldata för onboarding än."
                  />
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">Det som fastnar före portalstart</p>
                  <div className="space-y-3">
                    {partnerFunnelInsights.blockers.slice(0, 2).map((blocker) => (
                      <div key={blocker.key} className="rounded-2xl border border-border/70 bg-white/95 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{blocker.label}</p>
                          <Badge variant={blocker.count > 0 ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                            {formatWholeNumber(blocker.count)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-subtle">{blocker.description}</p>
                        <p className="mt-3 text-sm leading-6 text-foreground/80">{blocker.nextAction}</p>
                        <p className="mt-3 text-xs text-subtle">
                          Exempel: {blocker.samples.length ? blocker.samples.join(", ") : "Inga tydliga namn just nu."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mb-6 rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta dessa först</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Den korta arbetskön för i dag. Här visas bara poster som faktiskt bör tas nu eller mycket snart.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {formatWholeNumber(topApplicationFocusList.length)} poster
                </Badge>
              </div>

              <div className="mt-6">
                <DataTable
                  columns={["Sökande", "Nu-läge", "Varför först", "Nästa steg", "Åtgärd"]}
                  rows={topApplicationFocusList.map((item) => [
                    <div key={`${item.lead.id}-focus-name`}>
                      <p className="font-medium text-foreground">{item.lead.name}</p>
                      <p className="text-xs text-subtle">{item.lead.email}</p>
                    </div>,
                    <Badge
                      key={`${item.lead.id}-focus-urgency`}
                      variant={getLeadUrgencyVariant(item.lead)}
                      className="rounded-full px-3 py-1"
                    >
                      {item.urgency}
                    </Badge>,
                    <span key={`${item.lead.id}-focus-reason`} className="max-w-[280px] text-sm text-subtle">
                      {item.reason}
                    </span>,
                    <span key={`${item.lead.id}-focus-next`} className="max-w-[320px] text-sm text-subtle">
                      {item.nextStep}
                    </span>,
                    <Button
                      key={`${item.lead.id}-focus-open`}
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      disabled={isDemo}
                      onClick={() => {
                        setSelectedLead(item.lead);
                        setProvisionedPartner(null);
                        setProvisionError(null);
                        setZinzinoVerified(false);
                      }}
                    >
                      Öppna
                    </Button>,
                  ])}
                  emptyState="Inga akuta eller nära uppföljningar sticker ut just nu."
                />
              </div>
            </div>

            <DataTable
              columns={["Sökande", "Portalsteg", "Prioritera nu", "Redo", "Källsida", "Referral", "Prioritet", "Mottagen", "Åtgärd"]}
              rows={sortedPartnerApplications.map((lead) => [
                <div key={`${lead.id}-applicant`}>
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-subtle">{lead.email}</p>
                </div>,
                <div key={`${lead.id}-portal-stage`}>
                  <Badge
                    variant={getPortalStageVariant(lead)}
                    className="rounded-full px-3 py-1"
                  >
                    {getPortalStageLabel(lead)}
                  </Badge>
                  <p className="mt-2 max-w-[220px] text-xs leading-5 text-subtle">
                    {getPortalStageDescription(lead)}
                  </p>
                </div>,
                <div key={`${lead.id}-urgency`} className="max-w-[220px]">
                  <Badge
                    variant={getLeadUrgencyVariant(lead)}
                    className="rounded-full px-3 py-1"
                  >
                    {getLeadUrgencyLabel(lead)}
                  </Badge>
                  <p className="mt-2 text-xs leading-5 text-subtle">
                    {getLeadUrgencyReason(lead)}
                  </p>
                </div>,
                <div key={`${lead.id}-readiness`} className="max-w-[220px]">
                  <Badge
                    variant={lead.status === "active" || getLeadReviewReady(lead) ? "default" : "outline"}
                    className="rounded-full px-3 py-1"
                  >
                    {getLeadReadinessLabel(lead)}
                  </Badge>
                  <p className="mt-2 text-xs leading-5 text-subtle">
                    {getLeadReadinessDescription(lead)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-foreground/85">
                    Kontaktform: {getLeadContactMethod(lead)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-foreground/75">
                    Nästa: {getLeadFollowUpRecommendation(lead)}
                  </p>
                </div>,
                <span key={`${lead.id}-source`}>{lead.source_page || "-"}</span>,
                <div key={`${lead.id}-code`} className="space-y-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    {lead.referral_code || "Direkt"}
                  </Badge>
                  {getLeadAttribution(lead)?.firstTouch || getLeadAttribution(lead)?.lastTouch ? (
                    <p className="max-w-[220px] text-xs leading-5 text-subtle">
                      FT {getLeadAttribution(lead)?.firstTouch?.landingPage || "-"} / LT {getLeadAttribution(lead)?.lastTouch.landingPage || "-"}
                    </p>
                  ) : null}
                </div>,
                getPartnerPriorityLabel(getLeadPartnerPriority(lead)) ? (
                  <Badge
                    key={`${lead.id}-priority`}
                    variant={getPartnerPriorityVariant(getLeadPartnerPriority(lead))}
                    className="rounded-full px-3 py-1"
                  >
                    {getPartnerPriorityLabel(getLeadPartnerPriority(lead))}
                  </Badge>
                ) : (
                  <span key={`${lead.id}-priority`} className="text-subtle">-</span>
                ),
                <span key={`${lead.id}-date`}>{formatDate(lead.created_at)}</span>,
                <Button
                  key={`${lead.id}-action`}
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={isDemo}
                  onClick={() => {
                    setSelectedLead(lead);
                    setProvisionedPartner(null);
                    setProvisionError(null);
                    setZinzinoVerified(false);
                  }}
                >
                  Öppna ansökan
                </Button>,
              ])}
              emptyState="Inga partneransökningar ännu."
            />
          </DashboardSection> : null}

          {showPartners && partnerFunnelInsights ? <DashboardSection
            title="Aktivering efter onboarding"
            description="Här ser ni vad som händer efter att partnern fått portalåtkomst: setup, första aktivitet och verklig duplication."
          >
            <DataTruthBadges isDemo={isDemo} interpretive />
            <div className="mb-6 rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Viktigaste läget nu</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {activationDecisionSummary.actionQueue[0]?.label || "-"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    {activationDecisionSummary.actionQueue[0]
                      ? `${formatWholeNumber(activationDecisionSummary.actionQueue[0].count)} partnerposter ligger här just nu.`
                      : "Ingen tydlig aktiveringskö sticker ut just nu."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Starkast partner nu</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {activationDecisionSummary.strongestPartner?.partnerName || "-"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    {activationDecisionSummary.strongestPartner
                      ? `${formatStatusLabel(activationDecisionSummary.strongestPartner.status)} med ${formatWholeNumber(activationDecisionSummary.strongestPartner.score)} i intern poäng.`
                      : "Ingen partner sticker ut tydligt än."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fokus denna rytm</p>
                  <p className="mt-3 text-sm leading-6 text-foreground/85">
                    Hjälp varje partner vidare till nästa konkreta steg: få länkar klara, skapa första aktivitet och skydda de första dupliceringssignalerna.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <DataTable
                  columns={["Kö", "Antal", "Äldst väntan", "Nästa steg"]}
                  rows={activationDecisionSummary.actionQueue.map((item) => [
                    <span key={`${item.key}-label`} className="font-medium text-foreground">{item.label}</span>,
                    <span key={`${item.key}-count`}>{formatWholeNumber(item.count)}</span>,
                    <span key={`${item.key}-oldest`}>{formatElapsedDays(item.oldest)}</span>,
                    <span key={`${item.key}-next`} className="max-w-[320px] text-sm text-subtle">{item.nextStep}</span>,
                  ])}
                  emptyState="Inga aktiveringsköer sticker ut just nu."
                />
              </div>
            </div>

            <div className="mb-6 rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta dessa först efter onboarding</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Den korta arbetskön för partners som behöver setup, första aktivitet eller tätare stöd för att hålla dupliceringsrörelsen levande.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {formatWholeNumber(topPartnerActivationList.length)} poster
                </Badge>
              </div>

              <div className="mt-6">
                <DataTable
                  columns={["Partner", "Nu-läge", "Varför först", "Nästa steg", "Åtgärd"]}
                  rows={topPartnerActivationList.map((item) => [
                    <div key={`${item.key}-name`}>
                      <p className="font-medium text-foreground">{item.partnerName}</p>
                      <p className="text-xs text-subtle">{item.email}</p>
                    </div>,
                    <Badge
                      key={`${item.key}-urgency`}
                      variant={item.urgencyVariant}
                      className="rounded-full px-3 py-1"
                    >
                      {item.urgency}
                    </Badge>,
                    <span key={`${item.key}-reason`} className="max-w-[280px] text-sm text-subtle">
                      {item.reason}
                    </span>,
                    <span key={`${item.key}-next`} className="max-w-[320px] text-sm text-subtle">
                      {item.nextStep}
                    </span>,
                    <Button
                      key={`${item.key}-open`}
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setSelectedGrowthCompassPartnerId(item.partnerId)}
                    >
                      Fokusera
                    </Button>,
                  ])}
                  emptyState="Ingen partner behöver särskild aktiveringsprioritet just nu."
                />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div>
                <DataTable
                  columns={["Steg", "Antal", "Från föregående", "Tapp", "Fokus nu"]}
                  rows={partnerFunnelInsights.activationStages.map((stage) => [
                    <div key={`${stage.key}-label`}>
                      <p className="font-medium text-foreground">{stage.label}</p>
                      <p className="mt-1 max-w-[280px] text-xs leading-5 text-subtle">{stage.description}</p>
                    </div>,
                    <span key={`${stage.key}-count`} className="font-medium text-foreground">{formatWholeNumber(stage.count)}</span>,
                    <span key={`${stage.key}-conversion`}>{formatFunnelDelta(stage.conversionFromPrevious)}</span>,
                    <span key={`${stage.key}-drop`}>{stage.dropFromPrevious === null ? "-" : formatWholeNumber(stage.dropFromPrevious)}</span>,
                    <span key={`${stage.key}-focus`} className="max-w-[260px] text-sm text-subtle">{stage.focus}</span>,
                  ])}
                  emptyState="Ingen aktiveringsdata än."
                />
              </div>

              <div className="space-y-3">
                {partnerFunnelInsights.blockers.slice(2).map((blocker) => (
                  <div key={blocker.key} className="rounded-2xl border border-border/70 bg-white/95 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{blocker.label}</p>
                      <Badge variant={blocker.count > 0 ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                        {formatWholeNumber(blocker.count)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-subtle">{blocker.description}</p>
                    <p className="mt-3 text-sm leading-6 text-foreground/80">{blocker.nextAction}</p>
                    <p className="mt-3 text-xs text-subtle">
                      Exempel: {blocker.samples.length ? blocker.samples.join(", ") : "Inga tydliga namn just nu."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </DashboardSection> : null}

          {showPartners ? <DashboardSection
            title="På väg mot duplicering"
            description="Partners som redan visar first-line-rörelse eller partnergenererade signaler och därför bör följas extra nära just nu."
          >
            <div className="mb-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">I rörelse nu</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(partnersMovingTowardDuplication.length)}</p>
                <p className="mt-2 text-sm text-subtle">Partners som är över rent solo-läge och visar tidiga dupliceringssignaler.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Starkast just nu</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">
                  {partnersMovingTowardDuplication[0]?.row ? formatStatusLabel(partnersMovingTowardDuplication[0].row.status) : "-"}
                </p>
                <p className="mt-2 text-sm text-subtle">Högst utvecklade läget bland partners som redan rör sig mot duplication.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fokus nu</p>
                <p className="mt-3 text-sm leading-6 text-foreground/85">
                  Skydda rytmen hos dem som redan fått rörelse i first line innan energin sprids för brett eller stannar av.
                </p>
              </div>
            </div>

            <DataTable
              columns={["Partner", "Status", "Signal", "Saknas nu", "Nästa steg", "Visa"]}
              rows={partnersMovingTowardDuplication.map(({ row, partner }) => [
                <div key={`${row.partnerId}-name`}>
                  <p className="font-medium text-foreground">{row.partnerName}</p>
                  <p className="text-xs text-subtle">{partner?.email || row.email}</p>
                </div>,
                <Badge
                  key={`${row.partnerId}-status`}
                  variant={getGrowthCompassVariant(row.status)}
                  className="rounded-full px-3 py-1"
                >
                  {getGrowthCompassLabel(row.status)}
                </Badge>,
                <span key={`${row.partnerId}-signal`} className="max-w-[240px] text-sm text-subtle">
                  {[
                    `${formatWholeNumber(row.inputs.activeFirstLinePartners30d)} aktiv first line`,
                    `${formatWholeNumber(row.inputs.partnerGeneratedLeads30d)} partnerleads`,
                    `${formatWholeNumber(row.inputs.partnerGeneratedCustomers30d)} partnerkunder`,
                  ].join(" • ")}
                </span>,
                <span key={`${row.partnerId}-missing`} className="max-w-[220px] text-sm text-subtle">
                  {row.missingToNext.length ? row.missingToNext.join(", ") : "Behåll rytmen"}
                </span>,
                <span key={`${row.partnerId}-next`} className="max-w-[260px] text-sm text-subtle">
                  {row.nextBestAction}
                </span>,
                <Button
                  key={`${row.partnerId}-open`}
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setSelectedGrowthCompassPartnerId(row.partnerId);
                    setGrowthCompassDialogOpen(true);
                  }}
                >
                  Öppna kompass
                </Button>,
              ])}
              emptyState="Ingen partner visar ännu tydliga dupliceringssignaler."
            />
          </DashboardSection> : null}

          {showPartners ? <DashboardSection
            title="Setup klar men ingen aktivitet"
            description="Partners som har alla tre ZZ-länkar på plats men ännu saknar första aktiva signal i Tillväxtkompassen."
          >
            <div className="mb-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Behöver aktivering nu</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{formatWholeNumber(partnersWithSetupNoActivity.length)}</p>
                <p className="mt-2 text-sm text-subtle">Komplett setup finns, men första verkliga signal saknas fortfarande.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Äldsta väntan</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {partnersWithSetupNoActivity[0] ? formatElapsedDays(partnersWithSetupNoActivity[0].partner.verifiedAt || partnersWithSetupNoActivity[0].partner.createdAt) : "-"}
                </p>
                <p className="mt-2 text-sm text-subtle">Tid sedan länkarna var klara eller partnern lades till i portalen.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fokus nu</p>
                <p className="mt-3 text-sm leading-6 text-foreground/85">
                  Följ upp första inloggning, första delade länk och första verkliga kund- eller partnerdialog innan setup bara blir passiv.
                </p>
              </div>
            </div>

            <DataTable
              columns={["Partner", "Sponsor", "Länkar klara", "Väntat", "Nästa steg", "Åtgärd"]}
              rows={partnersWithSetupNoActivity.map(({ partner }) => [
                <div key={`${partner.partnerId}-name`}>
                  <p className="font-medium text-foreground">{partner.partnerName}</p>
                  <p className="text-xs text-subtle">{partner.email}</p>
                </div>,
                <span key={`${partner.partnerId}-sponsor`}>{partner.sponsorName || "Direkt"}</span>,
                <span key={`${partner.partnerId}-verified`}>{formatDate(partner.verifiedAt || partner.createdAt)}</span>,
                <span key={`${partner.partnerId}-waiting`}>{formatElapsedDays(partner.verifiedAt || partner.createdAt)}</span>,
                <span key={`${partner.partnerId}-action`} className="max-w-[280px] text-sm text-subtle">
                  Säkerställ ett konkret första steg: inloggning, delad länk eller bokad uppföljning denna vecka.
                </span>,
                <Button
                  key={`${partner.partnerId}-open-links`}
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setSelectedPartnerForLinks(partner)}
                >
                  Öppna länkar
                </Button>,
              ])}
              emptyState="Ingen partner med komplett setup står still just nu."
            />
          </DashboardSection> : null}

          {showPartners ? <DashboardSection title="Partners" description="Aktiva partners med referral-kod, sponsor, enkel pipelinebild och signal om ZZ-länkarna är klara.">
            <DataTable
              columns={["Partner", "Kod", "ZZ-länkar", "Sponsor", "Direkta kontakter", "Leads", "Kunder", "Tillagd", "Åtgärd"]}
              rows={data.partners.map((partner) => [
                <div key={`${partner.partnerId}-name`}>
                  <p className="font-medium text-foreground">{partner.partnerName}</p>
                  <p className="text-xs text-subtle">{partner.email}</p>
                </div>,
                <Badge key={`${partner.partnerId}-code`} variant="secondary" className="rounded-full px-3 py-1">
                  {partner.referralCode}
                </Badge>,
                <Badge
                  key={`${partner.partnerId}-zz-links`}
                  variant={partner.zzLinksReady ? "default" : "outline"}
                  className="rounded-full px-3 py-1"
                >
                  {partner.zzLinksReady ? "Klara" : "Saknas"}
                </Badge>,
                <span key={`${partner.partnerId}-sponsor`}>{partner.sponsorName || "Direkt"}</span>,
                <span key={`${partner.partnerId}-direct`}>{partner.directPartners}</span>,
                <span key={`${partner.partnerId}-leads`}>{partner.leads}</span>,
                <span key={`${partner.partnerId}-customers`}>{partner.customers}</span>,
                <span key={`${partner.partnerId}-joined`}>{formatDate(partner.createdAt)}</span>,
                <Button
                  key={`${partner.partnerId}-edit-links`}
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setSelectedPartnerForLinks(partner)}
                >
                  Redigera länkar
                </Button>,
              ])}
              emptyState="Inga partners skapade ännu."
            />
          </DashboardSection> : null}
        </div>
      )}

      <Dialog open={growthCompassDialogOpen} onOpenChange={setGrowthCompassDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
          <DialogHeader>
            <DialogTitle>Tillväxtkompass</DialogTitle>
            <DialogDescription>
              Intern kompass för partnerutveckling, nästa steg och datatillit. Detta är vägledning, inte officiell Zinzino-status.
            </DialogDescription>
          </DialogHeader>

          {selectedGrowthCompassRow ? <GrowthCompassCard row={selectedGrowthCompassRow} /> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={projectionDialogOpen} onOpenChange={setProjectionDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
          <DialogHeader>
            <DialogTitle>Tillväxtprognos</DialogTitle>
            <DialogDescription>
              Intern scenarioöverblick. Detta är riktning och arbetsunderlag, inte officiell Zinzino-payout.
            </DialogDescription>
          </DialogHeader>

          {selectedProjectionSummary ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-secondary/40 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Scenario</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {selectedProjectionSummary.name === "low" ? "Låg" : selectedProjectionSummary.name === "mid" ? "Mellan" : "Hög"}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedProjectionSummary.name === "high"
                      ? "default"
                      : selectedProjectionSummary.name === "mid"
                        ? "secondary"
                        : "outline"
                  }
                  className="rounded-full px-3 py-1"
                >
                  {selectedProjectionSummary.name}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {selectedProjectionSummary.checkpoints.map((checkpoint) => (
                  <div key={`${selectedProjectionSummary.name}-${checkpoint.month}`} className="rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-semibold text-foreground">{checkpoint.month} månader</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {formatWholeNumber(checkpoint.projectedVisitors)} besökare/mån
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-subtle">
                      <p>Leads: {formatWholeNumber(checkpoint.projectedLeads)}</p>
                      <p>Kunder: {formatWholeNumber(checkpoint.projectedCustomerBase)}</p>
                      <p>Team totalt: {formatWholeNumber(checkpoint.projectedTotalTeamMembers)}</p>
                      <p>Aktiva: {formatWholeNumber(checkpoint.projectedActiveTeamMembers)}</p>
                      <p>Nya via systemet: {formatWholeNumber(checkpoint.projectedSystemTeamMembersThisMonth)}</p>
                      <p>Nya externt: {formatWholeNumber(checkpoint.projectedExternalTeamMembersThisMonth)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedPartnerForLinks)} onOpenChange={(open) => !open && closeZzLinksDialog()}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
          <DialogHeader>
            <DialogTitle>ZZ-länkar för partner</DialogTitle>
            <DialogDescription>
              Här lägger du in partnerns riktiga Zinzino-länkar. Just nu använder vi test-, shop- och partnerlänken bakom Omega-länken.
            </DialogDescription>
          </DialogHeader>

          {selectedPartnerForLinks ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4 text-sm">
                <p className="font-medium text-foreground">{selectedPartnerForLinks.partnerName}</p>
                <p className="text-subtle">{selectedPartnerForLinks.email}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Referral-kod: {selectedPartnerForLinks.referralCode}
                </p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zz-test-url">Testlänk</Label>
                  <Input
                    id="zz-test-url"
                    value={zzTestUrl}
                    onChange={(event) => setZzTestUrl(event.target.value)}
                    placeholder="https://..."
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="zz-shop-url">Shoplänk</Label>
                  <Input
                    id="zz-shop-url"
                    value={zzShopUrl}
                    onChange={(event) => setZzShopUrl(event.target.value)}
                    placeholder="https://..."
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="zz-partner-url">Partnerlänk</Label>
                  <Input
                    id="zz-partner-url"
                    value={zzPartnerUrl}
                    onChange={(event) => setZzPartnerUrl(event.target.value)}
                    placeholder="https://..."
                    className="rounded-xl"
                  />
                </div>

              </div>
            </div>
          ) : null}

          <DialogFooter className="mt-2 flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm text-subtle">
              {zzLinkStatus ? zzLinkStatus : "Omega-länken delas externt. ZZ-länkarna används i bakgrunden."}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={closeZzLinksDialog}>
                Stäng
              </Button>
              <Button type="button" onClick={() => zzLinksMutation.mutate()} disabled={zzLinksMutation.isPending || !selectedPartnerForLinks}>
                {zzLinksMutation.isPending ? "Sparar..." : "Spara länkar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedLead)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
          <DialogHeader>
            <DialogTitle>Partneransökan</DialogTitle>
            <DialogDescription>
              Läs svaren, bedöm matchningen och skapa portalåtkomst först när personen både är aktiv partner i Zinzino och tydligt ska bygga med er.
            </DialogDescription>
          </DialogHeader>

          {selectedLead ? (
            <div className="space-y-4 text-sm">
              {selectedLead.status === "active" ? (
                <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-emerald-950">
                  Den här ansökan har redan ett aktivt partnerkonto i portalen.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Kontakt</p>
                  <div className="mt-3 space-y-2">
                    <p><span className="font-medium text-foreground">Namn:</span> {selectedLead.name}</p>
                    <p><span className="font-medium text-foreground">Email:</span> {selectedLead.email}</p>
                    <p><span className="font-medium text-foreground">Telefon:</span> {selectedLead.phone || "-"}</p>
                    <p><span className="font-medium text-foreground">Företag:</span> {getLeadDetailValue(selectedLead, "company")}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sammanhang</p>
                  <div className="mt-3 space-y-2">
                    <p><span className="font-medium text-foreground">Källsida:</span> {selectedLead.source_page || "-"}</p>
                    <p><span className="font-medium text-foreground">Referral:</span> {selectedLead.referral_code || "Direkt"}</p>
                    <p><span className="font-medium text-foreground">Mottagen:</span> {formatDate(selectedLead.created_at)}</p>
                    <p><span className="font-medium text-foreground">Portalsteg:</span> {getPortalStageLabel(selectedLead)}</p>
                    <p className="text-xs leading-5 text-subtle">{getPortalStageDescription(selectedLead)}</p>
                  </div>
                </div>
              </div>

              {selectedLeadAttribution ? (
                <div className="rounded-2xl border border-border/70 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Attribution</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                      <p className="font-medium text-foreground">Översikt</p>
                      <div className="mt-3 space-y-2 text-sm leading-6 text-foreground/85">
                        <p><span className="font-medium text-foreground">Ägare:</span> {selectedLeadAttribution.referredByUserId ? (partnerNameById.get(selectedLeadAttribution.referredByUserId) || selectedLeadAttribution.referredByUserId) : "Direkt / okänd"}</p>
                        <p><span className="font-medium text-foreground">Referral:</span> {selectedLeadAttribution.referralCode || "Direkt"}</p>
                        <p><span className="font-medium text-foreground">Första landning:</span> {selectedLeadAttribution.landingPage}</p>
                        <p><span className="font-medium text-foreground">Session:</span> <span className="break-all text-xs">{selectedLeadAttribution.sessionId}</span></p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                      <p className="font-medium text-foreground">First touch</p>
                      <div className="mt-3 space-y-2 text-sm leading-6 text-foreground/85">
                        <p><span className="font-medium text-foreground">Sida:</span> {selectedLeadAttribution.firstTouch?.landingPage || "-"}</p>
                        <p><span className="font-medium text-foreground">Tid:</span> {selectedLeadAttribution.firstTouch?.capturedAt ? formatDate(selectedLeadAttribution.firstTouch.capturedAt) : "-"}</p>
                        <p><span className="font-medium text-foreground">Kanal:</span> {getTouchpointChannels(selectedLeadAttribution.firstTouch)}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                      <p className="font-medium text-foreground">Last touch</p>
                      <div className="mt-3 space-y-2 text-sm leading-6 text-foreground/85">
                        <p><span className="font-medium text-foreground">Sida:</span> {selectedLeadAttribution.lastTouch.landingPage}</p>
                        <p><span className="font-medium text-foreground">Tid:</span> {selectedLeadAttribution.lastTouch.capturedAt ? formatDate(selectedLeadAttribution.lastTouch.capturedAt) : "-"}</p>
                        <p><span className="font-medium text-foreground">Kanal:</span> {getTouchpointChannels(selectedLeadAttribution.lastTouch)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-border/70 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Svar</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                    <p className="font-medium text-foreground">Intresse</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/85">{getLeadDetailValue(selectedLead, "interest")}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                    <p className="font-medium text-foreground">Beredskap</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/85">{getLeadDetailValue(selectedLead, "readiness")}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                    <p className="font-medium text-foreground">Bakgrund</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/85">{getLeadDetailValue(selectedLead, "background")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Vägen vidare</p>
                <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-sm font-medium text-foreground">Från partnerlead till teammedlem</p>
                  <div className="mt-4 space-y-3">
                    {buildCandidatePathSteps(selectedLead).map((step) => (
                      <div key={step.label} className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-white/85 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{step.label}</p>
                          <p className="mt-1 text-xs leading-5 text-subtle">{step.description}</p>
                        </div>
                        <Badge
                          variant={step.done ? "default" : step.current ? "secondary" : "outline"}
                          className="rounded-full px-3 py-1"
                        >
                          {step.done ? "Klar" : step.current ? "Nu" : "Senare"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                    <p className="text-sm font-medium text-foreground">Nuvarande beslutsläge</p>
                    <Badge
                      variant={getPartnerApplicationStatusVariant(selectedLead.status)}
                      className="mt-3 rounded-full px-3 py-1"
                    >
                      {getPortalStageDecisionLabel(selectedLead.status)}
                    </Badge>
                    <p className="mt-3 text-sm leading-6 text-subtle">
                      {getPortalStageNextAction(selectedLead)}
                    </p>
                    <div className="mt-4 rounded-2xl border border-border/70 bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Nästa kontakt</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/85">
                        {getLeadFollowUpRecommendation(selectedLead)}
                      </p>
                      <div className="mt-3 rounded-2xl border border-border/70 bg-secondary/15 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Rekommenderad kontaktform</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{getLeadContactMethod(selectedLead)}</p>
                        <p className="mt-2 text-sm leading-6 text-subtle">{getLeadContactMethodDescription(selectedLead)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                    <p className="text-sm font-medium text-foreground">Tre saker före teammedlem</p>
                    <div className="mt-3 space-y-3 text-sm text-subtle">
                      <div className="flex items-start justify-between gap-4">
                        <span>Intern bedömning är satt</span>
                        <Badge variant={partnerPriority !== "none" || adminNote.trim() ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                          {partnerPriority !== "none" || adminNote.trim() ? "Ja" : "Ej satt"}
                        </Badge>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span>Aktiv ZZ-join är verifierad</span>
                        <Badge variant={zinzinoVerified || selectedLead.status === "active" ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                          {zinzinoVerified || selectedLead.status === "active" ? "Ja" : "Ej verifierad"}
                        </Badge>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span>Vill bygga med oss bekräftat</span>
                        <Badge variant={teamIntentConfirmed || selectedLead.status === "active" ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                          {teamIntentConfirmed || selectedLead.status === "active" ? "Ja" : "Ej bekräftat"}
                        </Badge>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span>Redo att bli teammedlem</span>
                        <Badge
                          variant={selectedLeadReadyForPortal ? "default" : "outline"}
                          className="rounded-full px-3 py-1"
                        >
                          {selectedLead.status === "active" ? "Klar" : selectedLeadReadyForPortal ? "Redo" : "Ej redo"}
                        </Badge>
                      </div>
                    </div>
                    {!selectedLeadReadyForPortal ? (
                      <div className="mt-4 rounded-2xl border border-border/70 bg-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Blockerar just nu</p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-subtle">
                          {selectedLeadBlockers.map((blocker) => (
                            <li key={blocker}>{blocker}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-emerald-300/70 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-950">
                        Allt som behövs är bekräftat. Du kan nu skapa teammedlem och ge portalåtkomst.
                      </div>
                    )}
                    {selectedLeadCoreReadiness ? (
                      <div className="mt-4 rounded-2xl border border-border/70 bg-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Efter teammedlem</p>
                        <div className="mt-3 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">{selectedLeadCoreReadiness.label}</p>
                            <p className="mt-1 text-sm leading-6 text-subtle">{selectedLeadCoreReadiness.description}</p>
                          </div>
                          <Badge variant={selectedLeadCoreReadiness.ready ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                            {selectedLeadCoreReadiness.ready ? "Kärna möjlig" : "Avvakta"}
                          </Badge>
                        </div>
                        {selectedLeadCoreSupportPlan ? (
                          <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/15 p-4">
                            <p className="text-sm font-medium text-foreground">{selectedLeadCoreSupportPlan.title}</p>
                            <ul className="mt-3 space-y-2 text-sm leading-6 text-subtle">
                              {selectedLeadCoreSupportPlan.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Intern granskning</p>
                <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Prioritet</p>
                    <Select value={partnerPriority} onValueChange={(value) => setPartnerPriority(value as PartnerLeadPriority | "none")}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Välj prioritet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ingen prioritet</SelectItem>
                        <SelectItem value="hot">Het</SelectItem>
                        <SelectItem value="follow_up">Följ upp</SelectItem>
                        <SelectItem value="not_now">Inte nu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Adminnotering</p>
                    <Textarea
                      value={adminNote}
                      onChange={(event) => setAdminNote(event.target.value)}
                      className="min-h-[104px] rounded-xl"
                      placeholder="Intern notering om uppföljning, matchning, timing eller nästa steg..."
                    />
                  </div>
                </div>
                <label className="mt-4 flex items-start gap-3 rounded-2xl border border-border/70 bg-secondary/25 p-4 text-sm leading-6 text-foreground/85">
                  <input
                    type="checkbox"
                    checked={teamIntentConfirmed}
                    onChange={(event) => setTeamIntentConfirmed(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border"
                  />
                  <span>Jag har bekräftat att personen vill bygga med oss och ska in i vårt teamlager efter sin ZZ-join.</span>
                </label>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={!selectedLead || reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate()}
                  >
                    {reviewMutation.isPending ? "Sparar..." : "Spara granskning"}
                  </Button>
                  {reviewStatus ? <p className="text-xs text-subtle">{reviewStatus}</p> : null}
                </div>
              </div>

              {!provisionedPartner && selectedLead.status !== "active" ? (
                <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm leading-6 text-foreground/85">
                  <input
                    type="checkbox"
                    checked={zinzinoVerified}
                    onChange={(event) => setZinzinoVerified(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border"
                  />
                  <span>Jag har verifierat att personen aktivt har joinat Zinzino och är redo att räknas som teammedlem hos oss.</span>
                </label>
              ) : null}

              {provisionedPartner ? (
                <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-emerald-950">
                  <p className="font-medium">Partnerkonto skapat.</p>
                  <p className="mt-2"><span className="font-medium">Email:</span> {provisionedPartner.email}</p>
                  <p><span className="font-medium">Referral-kod:</span> {provisionedPartner.referral_code}</p>
                  <p><span className="font-medium">Lösenord:</span> {provisionedPartner.temporary_password || "Befintligt konto återanvändes"}</p>
                  <p className="mt-2 text-xs">Dela inloggningsuppgifterna säkert med partnern.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" className="rounded-xl bg-white" onClick={() => void copyProvisioningDetails()}>
                      <Copy className="mr-2 h-4 w-4" />
                      Kopiera inloggningsuppgifter
                    </Button>
                    {copyStatus ? <p className="text-xs">{copyStatus}</p> : null}
                  </div>
                  <div className="mt-4 rounded-2xl border border-emerald-300/70 bg-white/80 p-4 text-xs leading-6">
                    <p className="font-medium text-foreground">Nästa steg</p>
                    <p>Teammedlemmen loggar in på <span className="font-medium">/dashboard/login</span> med sin e-postadress och lösenordet ovan.</p>
                  </div>
                </div>
              ) : null}

              {provisionError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                  {provisionError}
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Stäng
            </Button>
            <Button
              type="button"
              disabled={
                !selectedLead ||
                onboardMutation.isPending ||
                Boolean(provisionedPartner) ||
                selectedLead.status === "active" ||
                !zinzinoVerified ||
                !teamIntentConfirmed
              }
              onClick={() => selectedLead && onboardMutation.mutate(selectedLead.id)}
            >
              {onboardMutation.isPending
                ? "Skapar..."
                : selectedLead?.status === "active"
                  ? "Teammedlem finns redan"
                  : provisionedPartner
                    ? "Skapat"
                    : "Skapa teammedlem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default AdminDashboardPage;

