import { useMemo } from "react";
import { Activity, ArrowRightLeft, BadgeCheck, Network, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { DashboardSection, DashboardShell, dashboardIcons } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { getAdminDashboardData, signOutPortalUser } from "@/lib/omega-data";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

const AdminDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "admin" || !isSupabaseConfigured;
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
  });

  const navigation = useMemo(
    () => [
      { label: "Overview", href: "/dashboard/admin", icon: dashboardIcons.dashboard },
      { label: "Attribution", href: "/dashboard/admin", icon: dashboardIcons.performance },
      { label: "Network", href: "/dashboard/admin", icon: dashboardIcons.network },
    ],
    [],
  );

  if (!isDemo && !isSupabaseConfigured) {
    return <Navigate to="/dashboard/login" replace />;
  }

  const data = dashboardQuery.data;

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Överblick över hela pipen: klick, leads, kunder, partneransökningar och enkel nätverksstruktur utan att gå in i provision eller ranker ännu."
      roleLabel={isDemo ? "Admin demo" : "Admin"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      {!data ? (
        <div className="rounded-[1.75rem] border border-border/70 bg-white/90 p-8 shadow-card">Loading dashboard...</div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total leads" value={data.metrics.totalLeads} helper="Alla kund- och partnerleads i systemet." icon={<Activity className="h-5 w-5" />} />
            <MetricCard label="Total customers" value={data.metrics.totalCustomers} helper="Kunder som blivit attribuerade till någon partner." icon={<BadgeCheck className="h-5 w-5" />} />
            <MetricCard label="Partner leads" value={data.metrics.totalPartnerLeads} helper="Ansökningar och intresseanmälningar för partnerskap." icon={<ArrowRightLeft className="h-5 w-5" />} />
            <MetricCard label="Active partners" value={data.metrics.totalActivePartners} helper="Partners med egen referral code och dashboardåtkomst." icon={<Users className="h-5 w-5" />} />
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <DashboardSection title="Leads per partner" description="Snabb bild av vem som driver inflöde just nu.">
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

            <DashboardSection title="Customers per partner" description="MVP-vyn fokuserar på attribution och relationer, inte utbetalning.">
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
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <DashboardSection title="Simple network overview" description="Direkta sponsorrelationer sparas separat så att nivåer och teamvy kan byggas ut senare.">
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
            </DashboardSection>

            <DashboardSection title="Latest leads" description="Senaste inkomna leads från hela sajten.">
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
            </DashboardSection>
          </div>

          <DashboardSection title="Latest partner applications" description="Partneransökningar separeras via lead type så att onboarding kan börja enkelt men tydligt.">
            <DataTable
              columns={["Applicant", "Source page", "Referral", "Status", "Received"]}
              rows={data.recentPartnerApplications.map((lead) => [
                <div key={`${lead.id}-applicant`}>
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-subtle">{lead.email}</p>
                </div>,
                <span key={`${lead.id}-source`}>{lead.source_page || "-"}</span>,
                <Badge key={`${lead.id}-code`} variant="secondary" className="rounded-full px-3 py-1">
                  {lead.referral_code || "Direct"}
                </Badge>,
                <span key={`${lead.id}-status`} className="capitalize">{lead.status}</span>,
                <span key={`${lead.id}-date`}>{formatDate(lead.created_at)}</span>,
              ])}
              emptyState="No partner applications yet."
            />
          </DashboardSection>

          <DashboardSection title="Partners" description="Active partners with referral code, sponsor and a quick view of their pipeline.">
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
          </DashboardSection>
        </div>
      )}
    </DashboardShell>
  );
};

export default AdminDashboardPage;
