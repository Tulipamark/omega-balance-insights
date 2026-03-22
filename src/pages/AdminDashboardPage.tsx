import { useMemo, useState } from "react";
import { Activity, ArrowRightLeft, BadgeCheck, Copy, Network, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useSearchParams } from "react-router-dom";
import { onboardPartnerFromLead } from "@/lib/api";
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
import { getAdminDashboardData, signOutPortalUser } from "@/lib/omega-data";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { Lead, OnboardPartnerFromLeadResponse } from "@/lib/omega-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

const AdminDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isDemo = searchParams.get("demo") === "admin" || !isSupabaseConfigured;
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [provisionedPartner, setProvisionedPartner] = useState<OnboardPartnerFromLeadResponse | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
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

  const closeDialog = () => {
    setSelectedLead(null);
    setProvisionedPartner(null);
    setProvisionError(null);
    setCopyStatus(null);
  };

  const copyProvisioningDetails = async () => {
    if (!provisionedPartner?.email) {
      return;
    }

    const lines = [
      `Email: ${provisionedPartner.email}`,
      `Referral code: ${provisionedPartner.referral_code || "-"}`,
      `Temporary password: ${provisionedPartner.temporary_password || "Existing auth account reused"}`,
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
      title="Admin dashboard"
      subtitle="Overview of the full pipe: clicks, leads, customers, partner applications and a simple network structure without adding commission logic yet."
      roleLabel={isDemo ? "Admin demo" : "Admin"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      {!data ? (
        <div className="rounded-[1.75rem] border border-border/70 bg-white/90 p-8 shadow-card">Loading dashboard...</div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total leads" value={data.metrics.totalLeads} helper="All customer and partner leads in the system." icon={<Activity className="h-5 w-5" />} />
            <MetricCard label="Total customers" value={data.metrics.totalCustomers} helper="Customers attributed to a partner." icon={<BadgeCheck className="h-5 w-5" />} />
            <MetricCard label="Partner leads" value={data.metrics.totalPartnerLeads} helper="Applications and expressions of interest for partnership." icon={<ArrowRightLeft className="h-5 w-5" />} />
            <MetricCard label="Active partners" value={data.metrics.totalActivePartners} helper="Partners with a referral code and dashboard access." icon={<Users className="h-5 w-5" />} />
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
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
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <DashboardSection title="Simple network overview" description="Direct sponsor relationships are stored separately so levels and network views can grow later.">
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

            <DashboardSection title="Latest leads" description="Latest captured leads from the whole site.">
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

          <DashboardSection title="Latest partner applications" description="Partner applications stay separate via lead type so onboarding can begin clearly.">
            <DataTable
              columns={["Applicant", "Source page", "Referral", "Status", "Received", "Action"]}
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
                <Button
                  key={`${lead.id}-action`}
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={isDemo || lead.status === "qualified" || lead.status === "active"}
                  onClick={() => {
                    setSelectedLead(lead);
                    setProvisionedPartner(null);
                    setProvisionError(null);
                  }}
                >
                  Provision access
                </Button>,
              ])}
              emptyState="No partner applications yet."
            />
          </DashboardSection>

          <DashboardSection title="Partners" description="Active partners with referral code, sponsor and a quick pipeline view.">
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

      <Dialog open={Boolean(selectedLead)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provision partner access</DialogTitle>
            <DialogDescription>
              Create the auth account, connect the portal user, and provision a pending partner profile for the selected application.
            </DialogDescription>
          </DialogHeader>

          {selectedLead ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                <p><span className="font-medium text-foreground">Applicant:</span> {selectedLead.name}</p>
                <p><span className="font-medium text-foreground">Email:</span> {selectedLead.email}</p>
                <p><span className="font-medium text-foreground">Referral:</span> {selectedLead.referral_code || "Direct"}</p>
              </div>

              {provisionedPartner ? (
                <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-emerald-950">
                  <p className="font-medium">Partner account is ready.</p>
                  <p className="mt-2"><span className="font-medium">Email:</span> {provisionedPartner.email}</p>
                  <p><span className="font-medium">Referral code:</span> {provisionedPartner.referral_code}</p>
                  <p><span className="font-medium">Temporary password:</span> {provisionedPartner.temporary_password || "Existing auth account reused"}</p>
                  <p className="mt-2 text-xs">Share the temporary password securely. We can later replace this with a branded password setup email.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" className="rounded-xl bg-white" onClick={() => void copyProvisioningDetails()}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy account details
                    </Button>
                    {copyStatus ? <p className="text-xs">{copyStatus}</p> : null}
                  </div>
                  <div className="mt-4 rounded-2xl border border-emerald-300/70 bg-white/80 p-4 text-xs leading-6">
                    <p className="font-medium text-foreground">Next step</p>
                    <p>Ask the partner to sign in at <span className="font-medium">/dashboard/login</span> with the temporary password and then change it.</p>
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
              disabled={!selectedLead || onboardMutation.isPending || Boolean(provisionedPartner)}
              onClick={() => selectedLead && onboardMutation.mutate(selectedLead.id)}
            >
              {onboardMutation.isPending ? "Provisioning..." : provisionedPartner ? "Provisioned" : "Create account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default AdminDashboardPage;
