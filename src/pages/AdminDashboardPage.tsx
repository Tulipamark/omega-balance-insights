import { Activity, ArrowRightLeft, BadgeCheck, Copy, MousePointerClick, Network, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAdminDashboardData, signOutPortalUser } from "@/lib/omega-data";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { ConfidenceLevel, Lead, OnboardPartnerFromLeadResponse, PartnerLeadPriority } from "@/lib/omega-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
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
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
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

  useEffect(() => {
    if (!selectedLead) {
      return;
    }

    setPartnerPriority(getLeadPartnerPriority(selectedLead) ?? "none");
    setAdminNote(getLeadAdminNote(selectedLead));
    setReviewStatus(null);
  }, [selectedLead]);

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
  const showOverview = currentSection === "overview";
  const showApplications = currentSection === "applications";
  const showPartners = currentSection === "partners";
  const showTraffic = currentSection === "traffic";
  const showGuide = currentSection === "guide";
  const showLegacyGuide = false;

  const closeDialog = () => {
    setSelectedLead(null);
    setProvisionedPartner(null);
    setProvisionError(null);
    setCopyStatus(null);
    setZinzinoVerified(false);
    setPartnerPriority("none");
    setAdminNote("");
    setReviewStatus(null);
  };

  const copyProvisioningDetails = async () => {
    if (!provisionedPartner?.email) {
      return;
    }

    const lines = [
      `Email: ${provisionedPartner.email}`,
      `Referral code: ${provisionedPartner.referral_code || "-"}`,
      `Password: ${provisionedPartner.temporary_password || "Existing auth account reused"}`,
      "Login URL: /dashboard/login",
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopyStatus("Copied account details.");
    } catch {
      setCopyStatus("Could not copy automatically. Copy the details manually.");
    }
  };

  return (
    <DashboardShell
      title={sectionMeta.title}
      subtitle={sectionMeta.subtitle}
      roleLabel={isDemo ? "Admin demo" : "Admin"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      {!data ? (
        <div className="rounded-[1.75rem] border border-border/70 bg-white/90 p-8 shadow-card">Laddar adminvy...</div>
      ) : (
        <div className="space-y-8">
          {showLegacyGuide && showGuide ? (
            <DashboardSection
              title="Hur man läser adminytan"
              description="Det här är en kort guide till vad siffrorna betyder just nu och hur de ska användas. Vi håller den medvetet enkel så att den blir lätt att översätta senare."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-sm font-medium text-foreground">Oversikt</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Använd oversikten för att snabbt se inflode, partnerlage och om något sticker ut som behöver uppföljning.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-sm font-medium text-foreground">Ansokningar</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Här granskar ni partnerintresse, sätter prioritet och avgör vem som ska följas upp eller onboardas.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-sm font-medium text-foreground">Partners</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Här används Tillvaxtkompassen. Den visar inte officiell ZZ-status utan en intern tolkning av aktivitet, first line och duplication.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                  <p className="text-sm font-medium text-foreground">Trafik</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Trafikvyn handlar om attribution: besok, klick och kallor. Den ska inte lasas som payout, revenue eller full affarssanning.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-white p-4">
                  <p className="text-sm font-medium text-foreground">Hur man laser Tillvaxtkompassen</p>
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
                    <li>Kund betyder inte besok. Vi raknar hellre konservativt an for brett.</li>
                    <li>Aktiv partner betyder observerbart beteende i systemet, inte bara att nagon finns registrerad.</li>
                    <li>Partnergenererat betyder aktivitet fran first line eller nedstroms, inte partnerns egen trafik.</li>
                    <li>Growth Compass ar ett planeringslager ovanpa source of truth, inte officiell Zinzino-logik.</li>
                  </ul>
                </div>
              </div>
            </DashboardSection>
          ) : null}

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
                  title="Duplicering"
                  description="Vilka partners som faktiskt börjar skapa eget attribuerat inflöde och kända resultat."
                >
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
                <div className="mb-6 grid gap-4 xl:grid-cols-3">
                  {(data.growthCompass || []).slice(0, 3).map((row) => (
                    <GrowthCompassCard key={`${row.partnerId}-card`} row={row} />
                  ))}
                </div>
                <DataTable
                  columns={["Partner", "Status", "Poäng", "Senaste 30 dagar", "Nästa milstolpe", "Nästa bästa steg"]}
                  rows={(data.growthCompass || []).slice(0, 8).map((row) => [
                    <div key={`${row.partnerId}-partner`}>
                      <p className="font-medium text-foreground">{row.partnerName}</p>
                      <p className="text-xs text-subtle">{row.email}</p>
                    </div>,
                    <Badge
                      key={`${row.partnerId}-status`}
                      variant={getGrowthCompassVariant(row.status)}
                      className="rounded-full px-3 py-1 capitalize"
                    >
                      {getGrowthCompassLabel(row.status)}
                    </Badge>,
                    <span key={`${row.partnerId}-score`} className="font-medium text-foreground">{row.score}</span>,
                    <div key={`${row.partnerId}-inputs`} className="space-y-1 text-xs text-subtle">
                      <p>Kunder: {row.inputs.personalCustomers30d}</p>
                      <p>Rekryteringar: {row.inputs.recruitedPartners30d}</p>
                      <p>Aktiv first line: {row.inputs.activeFirstLinePartners30d}</p>
                      <p>Partnerleads: {row.inputs.partnerGeneratedLeads30d}</p>
                      <p>Partnerkunder: {row.inputs.partnerGeneratedCustomers30d}</p>
                    </div>,
                    <div key={`${row.partnerId}-milestone`} className="max-w-[220px] text-sm text-foreground/85">
                      {row.nextMilestone}
                      {row.missingToNext.length ? (
                        <p className="mt-2 text-xs text-subtle">Saknas: {row.missingToNext.join(", ")}</p>
                      ) : null}
                    </div>,
                    <div key={`${row.partnerId}-action`} className="max-w-[260px] text-sm text-subtle">
                      {row.nextBestAction}
                    </div>,
                  ])}
                  emptyState="Ingen tillväxtdata än."
                />
              </DashboardSection> : null}
            </>
          ) : null}

          {showPartners ? <div className="grid gap-8 xl:grid-cols-2">
            <DashboardSection title="Leads per partner" description="Quick snapshot of who is driving inflow right now.">
              <DataTable
                columns={["Partner", "Code", "Clicks", "Leads", "Customers"]}
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
                emptyState="No partner performance data yet."
              />
            </DashboardSection>

            <DashboardSection title="Customers per partner" description="The MVP view focuses on attribution and relationships, not payouts.">
              <DataTable
                columns={["Partner", "Customers", "Leads", "Clicks"]}
                rows={data.customersPerPartner.map((row) => [
                  <span key={`${row.partnerId}-name`} className="font-medium text-foreground">{row.partnerName}</span>,
                  <span key={`${row.partnerId}-customers`}>{row.customers}</span>,
                  <span key={`${row.partnerId}-leads`}>{row.leads}</span>,
                  <span key={`${row.partnerId}-clicks`}>{row.clicks}</span>,
                ])}
                emptyState="No customer attribution yet."
              />
            </DashboardSection>
          </div> : null}

          {showPartners || showApplications ? <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            {showPartners ? <DashboardSection title="Simple network overview" description="Direct sponsor relationships are stored separately so levels and network views can grow later.">
              <div className="space-y-3">
                {data.networkOverview.length ? (
                  data.networkOverview.map((member) => (
                    <div key={member.partnerId} className="flex items-center justify-between rounded-2xl border border-border/70 bg-secondary/40 px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{member.partnerName}</p>
                        <p className="text-sm text-subtle">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Level {member.level}</p>
                        <p className="text-sm text-subtle">{formatDate(member.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-subtle">No team relationships yet.</p>
                )}
              </div>
            </DashboardSection> : null}

            {showApplications ? <DashboardSection title="Latest leads" description="Latest captured leads from the whole site.">
              <DataTable
                columns={["Name", "Type", "Referral", "Status", "Created"]}
                rows={data.recentLeads.map((lead) => [
                  <div key={`${lead.id}-name`}>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-subtle">{lead.email}</p>
                  </div>,
                  <Badge key={`${lead.id}-type`} variant="outline" className="rounded-full capitalize">
                    {lead.type === "partner_lead" ? "Partner lead" : "Customer lead"}
                  </Badge>,
                  <span key={`${lead.id}-ref`}>{lead.referral_code || "-"}</span>,
                  <span key={`${lead.id}-status`} className="capitalize">{lead.status}</span>,
                  <span key={`${lead.id}-created`}>{formatDate(lead.created_at)}</span>,
                ])}
                emptyState="No leads captured yet."
              />
            </DashboardSection> : null}
          </div> : null}

          {showApplications ? <DashboardSection title="Latest partner applications" description="Review interest first. Create an account only after the person is verified as a partner with Zinzino.">
            <DataTable
              columns={["Applicant", "Source page", "Referral", "Status", "Priority", "Received", "Action"]}
              rows={data.recentPartnerApplications.map((lead) => [
                <div key={`${lead.id}-applicant`}>
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-subtle">{lead.email}</p>
                </div>,
                <span key={`${lead.id}-source`}>{lead.source_page || "-"}</span>,
                <Badge key={`${lead.id}-code`} variant="secondary" className="rounded-full px-3 py-1">
                  {lead.referral_code || "Direct"}
                </Badge>,
                <Badge
                  key={`${lead.id}-status`}
                  variant={getPartnerApplicationStatusVariant(lead.status)}
                  className="rounded-full px-3 py-1"
                >
                  {getPartnerApplicationStatusLabel(lead.status)}
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
                  Open application
                </Button>,
              ])}
              emptyState="No partner applications yet."
            />
          </DashboardSection> : null}

          {showPartners ? <DashboardSection title="Partners" description="Active partners with referral code, sponsor and a quick pipeline view.">
            <DataTable
              columns={["Partner", "Code", "Sponsor", "Direct partners", "Leads", "Customers", "Joined"]}
              rows={data.partners.map((partner) => [
                <div key={`${partner.partnerId}-name`}>
                  <p className="font-medium text-foreground">{partner.partnerName}</p>
                  <p className="text-xs text-subtle">{partner.email}</p>
                </div>,
                <Badge key={`${partner.partnerId}-code`} variant="secondary" className="rounded-full px-3 py-1">
                  {partner.referralCode}
                </Badge>,
                <span key={`${partner.partnerId}-sponsor`}>{partner.sponsorName || "Direct"}</span>,
                <span key={`${partner.partnerId}-direct`}>{partner.directPartners}</span>,
                <span key={`${partner.partnerId}-leads`}>{partner.leads}</span>,
                <span key={`${partner.partnerId}-customers`}>{partner.customers}</span>,
                <span key={`${partner.partnerId}-joined`}>{formatDate(partner.createdAt)}</span>,
              ])}
              emptyState="No partners created yet."
            />
          </DashboardSection> : null}
        </div>
      )}

      <Dialog open={Boolean(selectedLead)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
          <DialogHeader>
            <DialogTitle>Partner application</DialogTitle>
            <DialogDescription>
              Read the answers, assess the fit, and only create an account after the person is verified as a partner with Zinzino.
            </DialogDescription>
          </DialogHeader>

          {selectedLead ? (
            <div className="space-y-4 text-sm">
              {selectedLead.status === "active" ? (
                <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-emerald-950">
                  This application already has an active partner account.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contact</p>
                  <div className="mt-3 space-y-2">
                    <p><span className="font-medium text-foreground">Name:</span> {selectedLead.name}</p>
                    <p><span className="font-medium text-foreground">Email:</span> {selectedLead.email}</p>
                    <p><span className="font-medium text-foreground">Phone:</span> {selectedLead.phone || "-"}</p>
                    <p><span className="font-medium text-foreground">Company:</span> {getLeadDetailValue(selectedLead, "company")}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Context</p>
                  <div className="mt-3 space-y-2">
                    <p><span className="font-medium text-foreground">Source page:</span> {selectedLead.source_page || "-"}</p>
                    <p><span className="font-medium text-foreground">Referral:</span> {selectedLead.referral_code || "Direct"}</p>
                    <p><span className="font-medium text-foreground">Received:</span> {formatDate(selectedLead.created_at)}</p>
                    <p><span className="font-medium text-foreground">Current status:</span> {getPartnerApplicationStatusLabel(selectedLead.status)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Answers</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                    <p className="font-medium text-foreground">Interest</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/85">{getLeadDetailValue(selectedLead, "interest")}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                    <p className="font-medium text-foreground">Readiness</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/85">{getLeadDetailValue(selectedLead, "readiness")}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                    <p className="font-medium text-foreground">Background</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/85">{getLeadDetailValue(selectedLead, "background")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Internal review</p>
                <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Priority</p>
                    <Select value={partnerPriority} onValueChange={(value) => setPartnerPriority(value as PartnerLeadPriority | "none")}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No priority</SelectItem>
                        <SelectItem value="hot">Hot</SelectItem>
                        <SelectItem value="follow_up">Follow up</SelectItem>
                        <SelectItem value="not_now">Not now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Admin note</p>
                    <Textarea
                      value={adminNote}
                      onChange={(event) => setAdminNote(event.target.value)}
                      className="min-h-[104px] rounded-xl"
                      placeholder="Internal note for follow-up, fit, timing, or next step..."
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={!selectedLead || reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate()}
                  >
                    {reviewMutation.isPending ? "Saving..." : "Save review"}
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
                  <span>Jag har verifierat att personen redan är partner hos Zinzino.</span>
                </label>
              ) : null}

              {provisionedPartner ? (
                <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-emerald-950">
                  <p className="font-medium">Partner account created.</p>
                  <p className="mt-2"><span className="font-medium">Email:</span> {provisionedPartner.email}</p>
                  <p><span className="font-medium">Referral code:</span> {provisionedPartner.referral_code}</p>
                  <p><span className="font-medium">Password:</span> {provisionedPartner.temporary_password || "Existing auth account reused"}</p>
                  <p className="mt-2 text-xs">Share these login details securely with the partner.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" className="rounded-xl bg-white" onClick={() => void copyProvisioningDetails()}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy login details
                    </Button>
                    {copyStatus ? <p className="text-xs">{copyStatus}</p> : null}
                  </div>
                  <div className="mt-4 rounded-2xl border border-emerald-300/70 bg-white/80 p-4 text-xs leading-6">
                    <p className="font-medium text-foreground">What happens next</p>
                    <p>The partner logs in at <span className="font-medium">/dashboard/login</span> with their email address and the password above.</p>
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
              Close
            </Button>
            <Button
              type="button"
              disabled={
                !selectedLead ||
                onboardMutation.isPending ||
                Boolean(provisionedPartner) ||
                selectedLead.status === "active" ||
                !zinzinoVerified
              }
              onClick={() => selectedLead && onboardMutation.mutate(selectedLead.id)}
            >
              {onboardMutation.isPending
                ? "Creating..."
                : selectedLead?.status === "active"
                  ? "Account already created"
                  : provisionedPartner
                    ? "Created"
                    : "Create verified account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default AdminDashboardPage;
