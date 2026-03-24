import { useMemo, useState } from "react";
import { Copy, Link2, MousePointerClick, UserPlus2, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { getPartnerDashboardData, getPortalAccessState, signOutPortalUser, updatePartnerZzLinks } from "@/lib/omega-data";
import type { Lead, PartnerDashboardData } from "@/lib/omega-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getLeadStatusLabel(status: Lead["status"]) {
  switch (status) {
    case "new":
      return "Behöver kontakt";
    case "qualified":
      return "Följ upp nu";
    case "active":
      return "Aktiv dialog";
    case "inactive":
      return "Vilande";
    case "won":
      return "Klart";
    case "lost":
      return "Avslutad";
    default:
      return status;
  }
}

function getLeadPriorityScore(lead: Lead) {
  switch (lead.status) {
    case "won":
      return 5;
    case "active":
      return 4;
    case "qualified":
      return 3;
    case "new":
      return 2;
    case "inactive":
      return 1;
    case "lost":
      return 0;
    default:
      return 0;
  }
}

function getLeadNextAction(lead: Lead) {
  switch (lead.status) {
    case "new":
      return "Ta första kontakt i dag.";
    case "qualified":
      return "Följ upp medan signalen fortfarande är varm.";
    case "active":
      return lead.type === "partner_lead"
        ? "Håll dialogen levande och försök boka nästa steg."
        : "För dialogen vidare mot test, order eller tydligt beslut.";
    case "inactive":
      return "Parkera tillfälligt och ta ny kontakt vid rätt läge.";
    case "won":
      return "Bygg vidare på det som fungerade och skapa nästa resultat.";
    case "lost":
      return "Lägg ingen energi här just nu.";
    default:
      return "Bestäm nästa tydliga steg.";
  }
}

function getLeadStatusVariant(status: Lead["status"]) {
  switch (status) {
    case "qualified":
    case "active":
      return "secondary" as const;
    case "won":
      return "default" as const;
    default:
      return "outline" as const;
  }
}

function getFirstResultProgress(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const hasLead = allLeads.length > 0;
  const hasResponse = allLeads.some(
    (lead) => lead.status === "qualified" || lead.status === "active" || lead.status === "won",
  );
  const hasResult = data.customers.length > 0 || data.metrics.directPartners > 0;

  return [
    {
      label: "Första aktivitet",
      description: "Ett lead eller en första signal har skapats.",
      done: hasLead,
      current: !hasLead,
    },
    {
      label: "Respons",
      description: "Någon har svarat eller blivit varm nog för uppföljning.",
      done: hasResponse,
      current: hasLead && !hasResponse,
    },
    {
      label: "Första resultat",
      description: "En kundsignal eller tydlig partnerreaktion finns.",
      done: hasResult,
      current: hasResponse && !hasResult,
    },
    {
      label: "Nästa fas",
      description: "Du kan nu börja bygga vidare på det som redan fungerar.",
      done: hasResult,
      current: false,
    },
  ];
}

function buildPartnerFirst30Days(data: PartnerDashboardData) {
  const customerLeads = data.leads.filter((lead) => lead.type === "customer_lead").length;
  const partnerLeads = data.partnerLeads.length;
  const customers = data.customers.length;
  const directPartners = data.metrics.directPartners;

  const checklist = [
    { label: "Dela din referral-länk", done: data.partner.referral_code.length > 0 },
    { label: "Skapa första kundsignal", done: customerLeads > 0 || customers > 0 },
    { label: "Skapa första partnerintresse", done: partnerLeads > 0 },
    { label: "Få första direkta partnerkontakt", done: directPartners > 0 },
  ];

  if (customers === 0 && customerLeads === 0 && partnerLeads === 0 && directPartners === 0) {
    return {
      stageLabel: "Kom igång",
      summary: "Fokus just nu är att skapa första riktiga rörelsen, inte att göra allt samtidigt.",
      nextMilestone: "Första kundsignal eller första partnerintresse",
      nextBestAction: "Dela din länk och fokusera på att få din första kund eller ditt första partnerlead.",
      checklist,
    };
  }

  if (customers === 0 && customerLeads <= 1 && partnerLeads <= 1 && directPartners === 0) {
    return {
      stageLabel: "Första resultat",
      summary: "Du har börjat röra dig. Nu gäller det att visa att det inte bara var ett enstaka försök.",
      nextMilestone: "Ett andra resultat i samma riktning",
      nextBestAction: "Upprepa det som gav första signalen och håll fokus på samma typ av aktivitet några dagar till.",
      checklist,
    };
  }

  if (directPartners === 0) {
    return {
      stageLabel: "Bygg upprepad aktivitet",
      summary: "Du har flera signaler igång, men allt bygger fortfarande mest på din egen aktivitet.",
      nextMilestone: "Första direkta partnerkontakt eller tydlig first-line-signal",
      nextBestAction: "Fortsätt skapa kund- och partnerintresse, men börja styra fokus mot att få in din första direkta partnerkontakt.",
      checklist,
    };
  }

  if (directPartners > 0 && partnerLeads + customerLeads + customers < 4) {
    return {
      stageLabel: "Aktivera first line",
      summary: "Du är inte längre helt själv i flödet. Nästa steg är att hjälpa första linjen att börja röra sig.",
      nextMilestone: "Första tydliga signalen från first line",
      nextBestAction: "Hjälp din första partner att få sitt första lead eller sin första kundsignal i stället för att bara producera själv.",
      checklist,
    };
  }

  return {
    stageLabel: "Tidig duplicering",
    summary: "Det finns tidiga signaler på att arbetet börjar upprepa sig genom andra. Nu handlar det om stabilitet, inte bara fart.",
    nextMilestone: "Fler återkommande signaler från first line",
    nextBestAction: "Skydda det som fungerar och hjälp fler i första linjen att upprepa samma beteende.",
    checklist,
  };
}

const PartnerDashboardPage = () => {
  const { section } = useParams<{ section?: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const partnerId = searchParams.get("partnerId") || undefined;
  const isDemo = searchParams.get("demo") === "partner" || !isSupabaseConfigured;
  const [zzLinksOpen, setZzLinksOpen] = useState(false);
  const [zzTestUrl, setZzTestUrl] = useState("");
  const [zzShopUrl, setZzShopUrl] = useState("");
  const [zzPartnerUrl, setZzPartnerUrl] = useState("");
  const [zzConsultationUrl, setZzConsultationUrl] = useState("");
  const [zzLinkStatus, setZzLinkStatus] = useState<string | null>(null);
  const partnerQuery = useQuery({
    queryKey: ["partner-dashboard", partnerId],
    queryFn: () => getPartnerDashboardData(partnerId),
  });
  const accessQuery = useQuery({
    queryKey: ["portal-access", "partner-view"],
    queryFn: getPortalAccessState,
    enabled: isSupabaseConfigured && !isDemo,
  });
  const zzLinksMutation = useMutation({
    mutationFn: () =>
      data
        ? updatePartnerZzLinks(data.partner.id, {
            test: zzTestUrl,
            shop: zzShopUrl,
            partner: zzPartnerUrl,
            consultation: zzConsultationUrl,
          })
        : Promise.reject(new Error("Ingen partnerdata hittades.")),
    onSuccess: async () => {
      setZzLinkStatus("Dina ZZ-länkar är sparade.");
      await queryClient.invalidateQueries({ queryKey: ["partner-dashboard", partnerId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      setZzLinkStatus(error instanceof Error ? error.message : "Kunde inte spara dina ZZ-länkar.");
    },
  });

  const currentSection =
    section === "leads" || section === "network" || section === "overview"
      ? section
      : section
        ? null
        : "overview";

  const navigation = useMemo(
    () => [
      { label: "Översikt", href: "/dashboard/partner/overview", icon: dashboardIcons.dashboard },
      { label: "Leads", href: "/dashboard/partner/leads", icon: dashboardIcons.leads },
      { label: "Kontakter", href: "/dashboard/partner/network", icon: dashboardIcons.network },
    ],
    [],
  );

  if (!isDemo && !isSupabaseConfigured) {
    return <Navigate to="/dashboard/login" replace />;
  }

  if (!currentSection) {
    return <Navigate to="/dashboard/partner/overview" replace />;
  }

  const data = partnerQuery.data;
  const journey = data ? buildPartnerFirst30Days(data) : null;
  const viewingAsAdmin = accessQuery.data?.portalUser?.role === "admin";
  const showOverview = currentSection === "overview";
  const showLeads = currentSection === "leads";
  const showNetwork = currentSection === "network";
  const partnerLink = data ? `${window.location.origin}/?ref=${data.partner.referral_code}` : "";
  const firstResultProgress = data ? getFirstResultProgress(data) : [];
  const prioritizedLeads = data
    ? [...data.leads, ...data.partnerLeads]
        .sort((a, b) => {
          const scoreDiff = getLeadPriorityScore(b) - getLeadPriorityScore(a);
          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        })
        .slice(0, 3)
    : [];

  const openZzLinksDialog = () => {
    if (!data) {
      return;
    }

    setZzTestUrl(data.zzLinks.test || "");
    setZzShopUrl(data.zzLinks.shop || "");
    setZzPartnerUrl(data.zzLinks.partner || "");
    setZzConsultationUrl(data.zzLinks.consultation || "");
    setZzLinkStatus(null);
    setZzLinksOpen(true);
  };

  return (
    <DashboardShell
      title="Partnerdashboard"
      subtitle="Din egen vy över referral-länk, leads, kunder och direkta partnerkontakter. Bara det som hör till dig visas här."
      roleLabel={isDemo ? "Partnerdemo" : "Partner"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      <Dialog open={zzLinksOpen} onOpenChange={setZzLinksOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
          <DialogHeader>
            <DialogTitle>Mina ZZ-länkar</DialogTitle>
            <DialogDescription>
              Lägg in dina riktiga Zinzino-länkar här. Omega-länken delas utåt, men de här länkarna används som destinationer i bakgrunden.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="partner-zz-test">Testlänk</Label>
              <Input
                id="partner-zz-test"
                value={zzTestUrl}
                onChange={(event) => setZzTestUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partner-zz-shop">Shoplänk</Label>
              <Input
                id="partner-zz-shop"
                value={zzShopUrl}
                onChange={(event) => setZzShopUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partner-zz-partner">Partnerlänk</Label>
              <Input
                id="partner-zz-partner"
                value={zzPartnerUrl}
                onChange={(event) => setZzPartnerUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partner-zz-consultation">Konsultationslänk</Label>
              <Input
                id="partner-zz-consultation"
                value={zzConsultationUrl}
                onChange={(event) => setZzConsultationUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="mt-3 flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm text-subtle">
              {zzLinkStatus ? zzLinkStatus : "Du kan uppdatera länkarna själv när dina Zinzino-destinationer ändras."}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setZzLinksOpen(false)}>
                Stäng
              </Button>
              <Button type="button" onClick={() => zzLinksMutation.mutate()} disabled={zzLinksMutation.isPending}>
                {zzLinksMutation.isPending ? "Sparar..." : "Spara länkar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!data ? (
        <div className="rounded-[1.75rem] border border-border/70 bg-white/90 p-8 shadow-card">Laddar partnervy...</div>
      ) : (
        <div className="space-y-8">
          {viewingAsAdmin ? (
            <div className="rounded-[1.5rem] border border-amber-300/70 bg-amber-50 px-5 py-4 text-sm text-amber-950 shadow-card">
              Du tittar på partnervyn som admin. Den här sidan används för att granska partnerupplevelsen, inte för att ändra adminbehörighet.
            </div>
          ) : null}

          {showOverview && journey ? (
            <DashboardSection
              title="Dina första 30 dagar"
              description="En enkel kompass för vad som är viktigast just nu. Det här är inte ZZ-rank eller payout, utan din nästa tydliga riktning."
            >
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-border/70 bg-secondary/30 p-5">
                  <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Nuvarande läge</p>
                  <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">{journey.stageLabel}</p>
                  <p className="mt-3 text-sm leading-6 text-subtle">{journey.summary}</p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nästa milstolpe</p>
                      <p className="mt-2 text-sm text-foreground">{journey.nextMilestone}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nästa bästa steg</p>
                      <p className="mt-2 text-sm text-foreground">{journey.nextBestAction}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-border/70 bg-white p-5">
                    <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Progress mot första resultat</p>
                    <div className="mt-4 space-y-3">
                      {firstResultProgress.map((step) => (
                        <div key={step.label} className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                          <div className="flex items-center justify-between gap-4">
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
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/70 bg-white p-5">
                    <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Enkel checklista</p>
                    <div className="mt-4 space-y-3">
                      {journey.checklist.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3"
                        >
                          <p className="text-sm text-foreground">{item.label}</p>
                          <Badge variant={item.done ? "default" : "outline"} className="rounded-full px-3 py-1">
                            {item.done ? "Klar" : "Kvar"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? (
            <DashboardSection
              title="Min Omega-länk"
              description="Det här är länken du normalt delar vidare."
            >
              <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-secondary/40 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Länken du delar</p>
                  <p className="mt-2 break-all font-medium text-foreground">{partnerLink}</p>
                  <p className="mt-3 text-sm leading-6 text-subtle">
                    Använd den här länken i första hand. Vi skickar sedan vidare till rätt Zinzino-länk i bakgrunden.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => navigator.clipboard.writeText(partnerLink)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Kopiera länk
                </Button>
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? (
            <DashboardSection
              title="Mina ZZ-länkar"
              description="Här finns dina personliga destinationslänkar till Zinzino."
            >
              <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.25rem] border border-border/70 bg-secondary/30 p-4">
                <p className="text-sm leading-6 text-subtle">
                  Lägg in och uppdatera dina egna Zinzino-länkar här. Då slipper allt gå via admin när du behöver ändra något.
                </p>
                <Button type="button" variant="outline" className="rounded-xl" onClick={openZzLinksDialog}>
                  Redigera mina länkar
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Testlänk", value: data.zzLinks.test },
                  { label: "Shoplänk", value: data.zzLinks.shop },
                  { label: "Partnerlänk", value: data.zzLinks.partner },
                  { label: "Konsultationslänk", value: data.zzLinks.consultation },
                ].map((linkItem) => (
                  <div key={linkItem.label} className="rounded-[1.5rem] border border-border/70 bg-white/95 p-5 shadow-card">
                    <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">{linkItem.label}</p>
                  {linkItem.value ? (
                      <>
                        <p className="mt-3 break-all text-sm text-foreground">{linkItem.value}</p>
                        <p className="mt-2 text-xs leading-5 text-subtle">
                          Detta är din bakomliggande Zinzino-länk. Dela normalt din Omega-länk ovan och använd dessa när du behöver gå direkt.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 rounded-xl"
                          onClick={() => navigator.clipboard.writeText(linkItem.value as string)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Kopiera länk
                        </Button>
                      </>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-subtle">
                        Ingen länk sparad ännu. Lägg in den via knappen ovan så blir den tillgänglig här.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Klick" value={data.metrics.clicks} helper="Besök som kommit in via din kod." icon={<MousePointerClick className="h-5 w-5" />} />
              <MetricCard label="Mina leads" value={data.metrics.leads} helper="Alla leads där du är attribuerad partner." icon={<Link2 className="h-5 w-5" />} />
              <MetricCard label="Mina kunder" value={data.metrics.customers} helper="Kunder som hittills kopplats till dig." icon={<Users className="h-5 w-5" />} />
              <MetricCard label="Partnerleads" value={data.metrics.partnerLeads} helper="Nya intresseanmälningar för partnerskap." icon={<UserPlus2 className="h-5 w-5" />} />
              <MetricCard label="Direkta kontakter" value={data.metrics.directPartners} helper="Direkta partnerkontakter som kommit in via dig." icon={<Users className="h-5 w-5" />} />
            </div>
          ) : null}

          {showOverview || showLeads ? (
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <DashboardSection title="Mina leads" description="Både kundleads och partnerleads sparas med din attribution.">
                <DataTable
                  columns={["Namn", "Typ", "Status", "Nästa steg", "Senast aktiv"]}
                  rows={data.leads.map((lead) => [
                    <div key={`${lead.id}-lead`}>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-subtle">{lead.email}</p>
                    </div>,
                    <Badge key={`${lead.id}-type`} variant="outline" className="rounded-full">
                      {lead.type === "partner_lead" ? "Partner" : "Kund"}
                    </Badge>,
                    <Badge key={`${lead.id}-status`} variant={getLeadStatusVariant(lead.status)} className="rounded-full px-3 py-1">
                      {getLeadStatusLabel(lead.status)}
                    </Badge>,
                    <div key={`${lead.id}-action`} className="max-w-[260px] text-sm text-subtle">
                      {getLeadNextAction(lead)}
                    </div>,
                    <span key={`${lead.id}-created`}>{formatDate(lead.updated_at || lead.created_at)}</span>,
                  ])}
                  emptyState="Inga attribuerade leads ännu."
                />
              </DashboardSection>

              {showOverview ? (
                <DashboardSection title="Först att följa upp" description="Systemet lyfter de leads som just nu är mest relevanta för att få första rörelse eller första resultat.">
                  <div className="rounded-[1.5rem] border border-border/70 bg-accent/50 p-5">
                    <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Prioriterade leads</p>
                    <div className="mt-4 space-y-3">
                      {prioritizedLeads.length ? (
                        prioritizedLeads.map((lead) => (
                          <div key={lead.id} className="rounded-2xl border border-border/70 bg-white/85 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium text-foreground">{lead.name}</p>
                                <p className="text-xs text-subtle">{lead.email}</p>
                              </div>
                              <Badge
                                variant={getLeadStatusVariant(lead.status)}
                                className="rounded-full px-3 py-1"
                              >
                                {getLeadStatusLabel(lead.status)}
                              </Badge>
                            </div>
                            <p className="mt-3 text-sm text-foreground">{getLeadNextAction(lead)}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
                              <span>{lead.type === "partner_lead" ? "Partnerlead" : "Kundlead"}</span>
                              <span>•</span>
                              <span>{formatDate(lead.updated_at || lead.created_at)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-subtle">Inga prioriterade leads ännu. Fokusera först på att skapa din första signal.</p>
                      )}
                    </div>
                  </div>
                </DashboardSection>
              ) : null}
            </div>
          ) : null}

          {showOverview ? (
            <DashboardSection title="Kundsignaler" description="Här ser du vilka kundrelationer som hittills kopplats till dig via systemet. Detta är inte officiell ZZ-utbetalning eller kompensation.">
              <div className="rounded-[1.5rem] border border-border/70 bg-accent/50 p-5">
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Attribuerade kunder</p>
                <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground">
                  {new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(data.customers.length)}
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">
                  Kundsidan visar tidiga kommersiella signaler och relationer runt ditt flöde, inte payout eller bonus.
                </p>
              </div>

              <div className="mt-5">
                <DataTable
                  columns={["Kund", "Status", "Skapad"]}
                  rows={data.customers.map((customer) => [
                    <div key={`${customer.id}-name`}>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-xs text-subtle">{customer.email}</p>
                    </div>,
                    <span key={`${customer.id}-status`} className="capitalize">{customer.status}</span>,
                    <span key={`${customer.id}-created`}>{formatDate(customer.created_at)}</span>,
                  ])}
                  emptyState="Inga attribuerade kunder ännu."
                />
              </div>
            </DashboardSection>
          ) : null}

          {showLeads || showNetwork ? (
            <div className="grid gap-8 xl:grid-cols-2">
              {showLeads ? (
                <DashboardSection title="Mina partnerleads" description="Här ser du partnerintresse och vad du bör göra härnäst för varje kontakt.">
                  <DataTable
                    columns={["Sökande", "Källa", "Status", "Nästa steg", "Senast aktiv"]}
                    rows={data.partnerLeads.map((lead) => [
                      <div key={`${lead.id}-partner`}>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-xs text-subtle">{lead.email}</p>
                      </div>,
                      <span key={`${lead.id}-source`}>{lead.source_page || "-"}</span>,
                      <Badge key={`${lead.id}-status`} variant={getLeadStatusVariant(lead.status)} className="rounded-full px-3 py-1">
                        {getLeadStatusLabel(lead.status)}
                      </Badge>,
                      <div key={`${lead.id}-action`} className="max-w-[260px] text-sm text-subtle">
                        {getLeadNextAction(lead)}
                      </div>,
                      <span key={`${lead.id}-received`}>{formatDate(lead.updated_at || lead.created_at)}</span>,
                    ])}
                    emptyState="Inga partneransökningar från din länk ännu."
                  />
                </DashboardSection>
              ) : null}

              {showNetwork ? (
                <DashboardSection title="Direkta partnerkontakter" description="Personer du har bjudit in eller fått in i ditt närmaste partnerled. Själva placeringen och ranken hanteras i Zinzino.">
                  <DataTable
                    columns={["Partner", "Nivå", "Tillagd"]}
                    rows={data.team.map((member) => [
                      <div key={`${member.partnerId}-member`}>
                        <p className="font-medium text-foreground">{member.partnerName}</p>
                        <p className="text-xs text-subtle">{member.email}</p>
                      </div>,
                      <Badge key={`${member.partnerId}-level`} variant="secondary" className="rounded-full px-3 py-1">
                        Nivå {member.level}
                      </Badge>,
                      <span key={`${member.partnerId}-joined`}>{formatDate(member.createdAt)}</span>,
                    ])}
                    emptyState="Inga direkta partnerkontakter ännu."
                  />
                </DashboardSection>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </DashboardShell>
  );
};

export default PartnerDashboardPage;
