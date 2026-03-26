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
import { buildPartnerFunnelInsights } from "@/lib/partner-funnel";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { AdminPartnerRow, ConfidenceLevel, Lead, OnboardPartnerFromLeadResponse, PartnerLeadPriority } from "@/lib/omega-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value);
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
      description: "Kärnan blir relevant först efter att personen blivit teammedlem.",
      ready: false,
    };
  }

  if (priority === "hot" && hasBuildIntent && (readiness.includes("nu") || readiness.includes("redo"))) {
    return {
      label: "Möjlig kärna",
      description: "Personen ser ut att kunna vara aktuell för tätare rytm, calls och närmare stöd.",
      ready: true,
    };
  }

  return {
    label: "Vanlig teammedlem",
    description: "Låt personen först visa stabil aktivitet innan kärnan blir relevant.",
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
      title: "Nästa steg i kärnan",
      items: [
        "Bjud in personen till närmare rytm med privata calls eller tätare Zoom.",
        "Lägg till personen i kärnans närmaste kommunikation, till exempel privat grupp.",
        "Sätt ett konkret fokus för veckan så kärnaccessen direkt leder till rörelse.",
      ],
    };
  }

  return {
    title: "Nästa steg före kärnan",
    items: [
      "Låt personen först visa stabil aktivitet i vardagen.",
      "Följ upp om första resultat börjar bli upprepade, inte bara enstaka.",
      "När rytmen sitter kan kärnan bli relevant som stödlager.",
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
      setProvisionError(error instanceof Error ? error.message : "Could not provision the partner account.");
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
      setReviewStatus(error instanceof Error ? error.message : "Could not update review.");
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

  if (!isDemo && !isSupabaseConfigured) {
    return <Navigate to="/dashboard/login" replace />;
  }

  if (!currentSection) {
    return <Navigate to="/dashboard/admin/overview" replace />;
  }

  const data = dashboardQuery.data;
  const latestFunnelDay = data?.kpis?.funnelDaily?.[0] || null;
  const pipeline = data?.kpis?.partnerPipeline || null;
  const producingPartners = data?.kpis?.duplication?.filter((row) => row.has_generated_leads).length || 0;
  const latestKnownCustomers = latestFunnelDay?.customers ?? 0;
  const growthCompassRows = data?.growthCompass || [];
  const partnerFunnelInsights = useMemo(() => (data ? buildPartnerFunnelInsights(data) : null), [data]);
  const funnelEventRows = data?.kpis?.funnelEventsDaily || [];
  const recentFunnelEvents = data?.recentFunnelEvents || [];
  const funnelEventSummary = useMemo(() => {
    const countFor = (eventNames: string[]) =>
      funnelEventRows
        .filter((row) => eventNames.includes(row.event_name))
        .reduce((sum, row) => sum + row.events, 0);

    return {
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
    };
  }, [funnelEventRows]);
  const selectedGrowthCompassRow =
    growthCompassRows.find((row) => row.partnerId === selectedGrowthCompassPartnerId) || growthCompassRows[0] || null;
  const showOverview = currentSection === "overview";
  const showApplications = currentSection === "applications";
  const showPartners = currentSection === "partners";
  const showTraffic = currentSection === "traffic";
  const showGuide = currentSection === "guide";
  const selectedLeadCoreReadiness = selectedLead ? getCoreReadiness(selectedLead) : null;
  const selectedLeadCoreSupportPlan = selectedLead ? getCoreSupportPlan(selectedLead) : null;
  const sortedPartnerApplications = data
    ? [...data.partnerApplications].sort((a, b) => {
        const scoreDiff = getApplicationQueueScore(b) - getApplicationQueueScore(a);
        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
    : [];
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
                title="Partnerfunnel just nu"
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
                    label="Submit-fel"
                    value={funnelEventSummary.submitFailures}
                    helper="Formförsök som stannade innan lead kunde drivas vidare."
                    icon={<ArrowRightLeft className="h-5 w-5" />}
                  />
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
                        {event.details && Object.keys(event.details).length ? JSON.stringify(event.details) : "-"}
                      </span>,
                    ])}
                    emptyState="Inga funnel-events loggade än."
                  />
                </DashboardSection>
              </div> : null}

              {showTraffic ? <div className="grid gap-8 xl:grid-cols-2">
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

            <DataTable
              columns={["Sökande", "Portalsteg", "Redo", "Källsida", "Referral", "Prioritet", "Mottagen", "Åtgärd"]}
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
                <Badge key={`${lead.id}-code`} variant="secondary" className="rounded-full px-3 py-1">
                  {lead.referral_code || "Direkt"}
                </Badge>,
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
              Här lägger du in partnerns riktiga Zinzino-länkar. Just nu använder vi test-, shop-, partner- och konsultationslänken bakom Omega-länken.
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

                <div className="grid gap-2">
                  <Label htmlFor="zz-consultation-url">Konsultationslänk</Label>
                  <Input
                    id="zz-consultation-url"
                    value={zzConsultationUrl}
                    onChange={(event) => setZzConsultationUrl(event.target.value)}
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

