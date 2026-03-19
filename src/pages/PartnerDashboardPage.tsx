import { useMemo } from "react";
import { Copy, Link2, MousePointerClick, UserPlus2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSection, DashboardShell, dashboardIcons } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { getMockRevenueForPartner, getPartnerDashboardData, signOutPortalUser } from "@/lib/omega-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

const PartnerDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("partnerId") || undefined;
  const isDemo = searchParams.get("demo") === "partner" || !isSupabaseConfigured;
  const partnerQuery = useQuery({
    queryKey: ["partner-dashboard", partnerId],
    queryFn: () => getPartnerDashboardData(partnerId),
  });

  const navigation = useMemo(
    () => [
      { label: "Overview", href: "/dashboard/partner", icon: dashboardIcons.dashboard },
      { label: "Leads", href: "/dashboard/partner", icon: dashboardIcons.leads },
      { label: "Network", href: "/dashboard/partner", icon: dashboardIcons.network },
    ],
    [],
  );

  if (!isDemo && !isSupabaseConfigured) {
    return <Navigate to="/dashboard/login" replace />;
  }

  const data = partnerQuery.data;

  return (
    <DashboardShell
      title="Partner dashboard"
      subtitle="Din egen vy över referral-länk, klick, leads, kunder och team. Bara det som hör till dig visas här."
      roleLabel={isDemo ? "Partner demo" : "Partner"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      {!data ? (
        <div className="rounded-[1.75rem] border border-border/70 bg-white/90 p-8 shadow-card">Loading dashboard...</div>
      ) : (
        <div className="space-y-8">
          <DashboardSection
            title="Min referral-länk"
            description="Dela samma webbplats med din unika kod. Tracking fångas både via ?ref=CODE och via /CODE."
          >
            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-secondary/40 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Share link</p>
                <p className="mt-2 break-all font-medium text-foreground">{`${window.location.origin}/?ref=${data.partner.referral_code}`}</p>
                <p className="mt-2 text-sm text-subtle">Slug-alternativ: {`${window.location.origin}/${data.partner.referral_code}`}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?ref=${data.partner.referral_code}`)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Kopiera länk
              </Button>
            </div>
          </DashboardSection>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Clicks" value={data.metrics.clicks} helper="Besök som kommit in via din code." icon={<MousePointerClick className="h-5 w-5" />} />
            <MetricCard label="My leads" value={data.metrics.leads} helper="Alla leads där du är attributed partner." icon={<Link2 className="h-5 w-5" />} />
            <MetricCard label="My customers" value={data.metrics.customers} helper="Kunder som hittills kopplats till dig." icon={<Users className="h-5 w-5" />} />
            <MetricCard label="Partner leads" value={data.metrics.partnerLeads} helper="Nya intresseanmälningar för partnerskap." icon={<UserPlus2 className="h-5 w-5" />} />
            <MetricCard label="Direct partners" value={data.metrics.directPartners} helper="Direkt sponsrade partners i ditt team." icon={<Users className="h-5 w-5" />} />
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <DashboardSection title="Mina leads" description="Både kundleads och partnerleads sparas med din attribution.">
              <DataTable
                columns={["Name", "Type", "Status", "Created"]}
                rows={data.leads.map((lead) => [
                  <div key={`${lead.id}-lead`}>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-subtle">{lead.email}</p>
                  </div>,
                  <Badge key={`${lead.id}-type`} variant="outline" className="rounded-full">
                    {lead.type === "partner_lead" ? "Partner" : "Customer"}
                  </Badge>,
                  <span key={`${lead.id}-status`} className="capitalize">{lead.status}</span>,
                  <span key={`${lead.id}-created`}>{formatDate(lead.created_at)}</span>,
                ])}
                emptyState="No attributed leads yet."
              />
            </DashboardSection>

            <DashboardSection title="Kunder och MVP-värde" description="Provision logik är inte aktiverad ännu, men relationerna finns klara för nästa steg.">
              <div className="rounded-[1.5rem] border border-border/70 bg-accent/50 p-5">
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Attributed revenue snapshot</p>
                <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground">
                  {new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(
                    getMockRevenueForPartner(data.partner.id),
                  )}
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">
                  Visas bara som signalvärde i demo/MVP. Utbetalning och bonusmotor byggs separat senare.
                </p>
              </div>

              <div className="mt-5">
                <DataTable
                  columns={["Customer", "Status", "Created"]}
                  rows={data.customers.map((customer) => [
                    <div key={`${customer.id}-name`}>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-xs text-subtle">{customer.email}</p>
                    </div>,
                    <span key={`${customer.id}-status`} className="capitalize">{customer.status}</span>,
                    <span key={`${customer.id}-created`}>{formatDate(customer.created_at)}</span>,
                  ])}
                  emptyState="No customers attributed yet."
                />
              </div>
            </DashboardSection>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <DashboardSection title="Mina partnerleads" description="Lead-typen gör det enkelt att skilja partnerintresse från vanliga kundleads.">
              <DataTable
                columns={["Applicant", "Source", "Status", "Received"]}
                rows={data.partnerLeads.map((lead) => [
                  <div key={`${lead.id}-partner`}>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-subtle">{lead.email}</p>
                  </div>,
                  <span key={`${lead.id}-source`}>{lead.source_page || "-"}</span>,
                  <span key={`${lead.id}-status`} className="capitalize">{lead.status}</span>,
                  <span key={`${lead.id}-received`}>{formatDate(lead.created_at)}</span>,
                ])}
                emptyState="No partner applications from your link yet."
              />
            </DashboardSection>

            <DashboardSection title="Mitt team" description="Direkta partners och enkel nivåindikering för framtida nätverksvy.">
              <DataTable
                columns={["Partner", "Level", "Joined"]}
                rows={data.team.map((member) => [
                  <div key={`${member.partnerId}-member`}>
                    <p className="font-medium text-foreground">{member.partnerName}</p>
                    <p className="text-xs text-subtle">{member.email}</p>
                  </div>,
                  <Badge key={`${member.partnerId}-level`} variant="secondary" className="rounded-full px-3 py-1">
                    Level {member.level}
                  </Badge>,
                  <span key={`${member.partnerId}-joined`}>{formatDate(member.createdAt)}</span>,
                ])}
                emptyState="No direct partners yet."
              />
            </DashboardSection>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default PartnerDashboardPage;
