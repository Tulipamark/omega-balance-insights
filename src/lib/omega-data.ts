import { supabase } from "@/integrations/supabase/client";
import {
  AdminDashboardData,
  AdminPartnerRow,
  AppUser,
  CreatePartnerInput,
  Customer,
  GrowthCompassRow,
  KpiDuplicationRow,
  KpiFunnelDay,
  KpiPartnerPipeline,
  KpiSourceMixRow,
  Lead,
  LeadSubmissionInput,
  Order,
  PartnerDashboardData,
  PartnerRelationship,
  PortalAccessState,
  ReferralVisit,
  TeamRow,
} from "@/lib/omega-types";
import { evaluateGrowthCompass } from "@/lib/growth-compass";
import { mapPartnerDataToGrowthCompassInput, type OutboundClickSignal } from "@/lib/map-partner-data-to-growth-compass";

const now = new Date();

const mockUsers: AppUser[] = [
  {
    id: "user-admin",
    auth_user_id: "auth-admin",
    name: "Omega Admin",
    email: "admin@omegabalance.se",
    role: "admin",
    referral_code: "OMEGAHQ",
    parent_partner_id: null,
    created_at: now.toISOString(),
  },
  {
    id: "user-elin",
    auth_user_id: "auth-elin",
    name: "Elin Berg",
    email: "elin@omegabalance.se",
    role: "partner",
    referral_code: "ELIN2026",
    parent_partner_id: null,
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: "user-mikael",
    auth_user_id: "auth-mikael",
    name: "Mikael Nord",
    email: "mikael@omegabalance.se",
    role: "partner",
    referral_code: "MIKAEL88",
    parent_partner_id: "user-elin",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: "user-saga",
    auth_user_id: "auth-saga",
    name: "Saga Lind",
    email: "saga@omegabalance.se",
    role: "partner",
    referral_code: "SAGA444",
    parent_partner_id: "user-elin",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
];

const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Anna Holm",
    email: "anna@example.com",
    phone: "0701234567",
    type: "customer_lead",
    source_page: "/sv",
    referral_code: "ELIN2026",
    referred_by_user_id: "user-elin",
    status: "qualified",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "lead-2",
    name: "Jonas Ek",
    email: "jonas@example.com",
    phone: "0707654321",
    type: "partner_lead",
    source_page: "/sv/partners",
    referral_code: "ELIN2026",
    referred_by_user_id: "user-elin",
    status: "new",
    details: { interest: "Build a business" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "lead-3",
    name: "Lina Varg",
    email: "lina@example.com",
    phone: "0735551122",
    type: "customer_lead",
    source_page: "/sv",
    referral_code: "MIKAEL88",
    referred_by_user_id: "user-mikael",
    status: "new",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: "lead-4",
    name: "David Frost",
    email: "david@example.com",
    phone: "0725551122",
    type: "partner_lead",
    source_page: "/sv/partners",
    referral_code: "SAGA444",
    referred_by_user_id: "user-saga",
    status: "qualified",
    details: { interest: "Extra income" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const mockCustomers: Customer[] = [
  {
    id: "customer-1",
    name: "Anna Holm",
    email: "anna@example.com",
    referred_by_user_id: "user-elin",
    referral_code: "ELIN2026",
    status: "active",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "customer-2",
    name: "Lina Varg",
    email: "lina@example.com",
    referred_by_user_id: "user-mikael",
    referral_code: "MIKAEL88",
    status: "active",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

const mockOrders: Order[] = [
  {
    id: "order-1",
    customer_id: "customer-1",
    referred_by_user_id: "user-elin",
    amount: 1299,
    status: "paid",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: "order-2",
    customer_id: "customer-2",
    referred_by_user_id: "user-mikael",
    amount: 1299,
    status: "paid",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const mockRelationships: PartnerRelationship[] = [
  {
    id: "rel-1",
    sponsor_user_id: "user-elin",
    partner_user_id: "user-mikael",
    level: 1,
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: "rel-2",
    sponsor_user_id: "user-elin",
    partner_user_id: "user-saga",
    level: 1,
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
];

const mockPartnerRecords = mockUsers
  .filter((user) => user.role === "partner")
  .map((user) => ({
    id: `partner-record-${user.id}`,
    user_id: user.id,
    referral_code: user.referral_code,
    status: "verified",
    created_at: user.created_at,
  }));

const mockOutboundClicks: OutboundClickSignal[] = [];

const mockVisits: ReferralVisit[] = [
  {
    id: "visit-1",
    referral_code: "ELIN2026",
    landing_page: "/sv",
    visitor_id: "v-1",
    utm_source: "instagram",
    utm_campaign: "spring-launch",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "visit-2",
    referral_code: "ELIN2026",
    landing_page: "/sv/partners",
    visitor_id: "v-2",
    utm_source: "story",
    utm_campaign: "partner-push",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "visit-3",
    referral_code: "MIKAEL88",
    landing_page: "/sv",
    visitor_id: "v-3",
    utm_source: "email",
    utm_campaign: "march-follow-up",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
  },
];

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and either VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return supabase;
}

function sortNewest<T extends { created_at: string }>(rows: T[]) {
  return [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function toDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function roundPercent(numerator: number, denominator: number) {
  if (!denominator) {
    return 0;
  }

  return Math.round((numerator / denominator) * 10000) / 100;
}

function buildMockKpiFunnelDaily(
  visits: ReferralVisit[],
  leads: Lead[],
  customers: Customer[],
  orders: Order[],
): KpiFunnelDay[] {
  const clicksByDay = new Map<string, number>();
  const visitDays = new Set<string>();

  visits.forEach((visit) => {
    visitDays.add(toDayKey(visit.created_at));
  });

  const customerLeads = leads.filter((lead) => lead.lead_type === "customer" || lead.type === "customer_lead");
  const days = new Set<string>([
    ...visitDays,
    ...customerLeads.map((lead) => toDayKey(lead.created_at)),
    ...customers.map((customer) => toDayKey(customer.created_at)),
    ...orders.filter((order) => order.status === "paid").map((order) => toDayKey(order.created_at)),
  ]);

  return [...days]
    .sort((a, b) => (a < b ? 1 : -1))
    .map((day) => {
      const dayVisits = visits.filter((visit) => toDayKey(visit.created_at) === day).length;
      const dayClicks = clicksByDay.get(day) || 0;
      const dayCustomerLeads = customerLeads.filter((lead) => toDayKey(lead.created_at) === day).length;
      const dayCustomers = customers.filter((customer) => toDayKey(customer.created_at) === day).length;
      const dayPaidOrders = orders.filter((order) => order.status === "paid" && toDayKey(order.created_at) === day);
      const paidRevenue = dayPaidOrders.reduce((sum, order) => sum + order.amount, 0);

      return {
        day: `${day}T00:00:00.000Z`,
        visits: dayVisits,
        outbound_clicks: dayClicks,
        customer_leads: dayCustomerLeads,
        customers: dayCustomers,
        paid_orders: dayPaidOrders.length,
        paid_revenue: paidRevenue,
        visit_to_click_pct: roundPercent(dayClicks, dayVisits),
        click_to_lead_pct: roundPercent(dayCustomerLeads, dayClicks),
        lead_to_customer_pct: roundPercent(dayCustomers, dayCustomerLeads),
        customer_to_paid_order_pct: roundPercent(dayPaidOrders.length, dayCustomers),
        visit_to_paid_order_pct: roundPercent(dayPaidOrders.length, dayVisits),
      };
    });
}

function buildMockKpiPartnerPipeline(leads: Lead[], users: AppUser[]): KpiPartnerPipeline {
  const partnerApplications = leads.filter((lead) => lead.lead_type === "partner" || lead.type === "partner_lead");

  return {
    applications: partnerApplications.length,
    new_candidates: partnerApplications.filter((lead) => lead.status === "new").length,
    verified_candidates: partnerApplications.filter((lead) => lead.status === "qualified").length,
    active_partner_accounts: partnerApplications.filter((lead) => lead.status === "active").length,
    inactive_or_lost: partnerApplications.filter((lead) => lead.status === "inactive" || lead.status === "lost").length,
    partner_records: users.filter((user) => user.role === "partner").length,
    portal_partner_users: users.filter((user) => user.role === "partner").length,
    application_to_verified_pct: roundPercent(
      partnerApplications.filter((lead) => lead.status === "qualified").length,
      partnerApplications.length,
    ),
    verified_to_active_pct: roundPercent(
      partnerApplications.filter((lead) => lead.status === "active").length,
      partnerApplications.filter((lead) => lead.status === "qualified").length,
    ),
  };
}

function buildMockKpiDuplication(
  users: AppUser[],
  leads: Lead[],
  customers: Customer[],
  orders: Order[],
  visits: ReferralVisit[],
): KpiDuplicationRow[] {
  return users
    .filter((user) => user.role === "partner")
    .map((partner) => {
      const partnerVisits = visits.filter((visit) => visit.referral_code === partner.referral_code);
      const partnerLeads = leads.filter((lead) => lead.referred_by_user_id === partner.id);
      const partnerCustomers = customers.filter((customer) => customer.referred_by_user_id === partner.id);
      const partnerOrders = orders.filter((order) => order.referred_by_user_id === partner.id && order.status === "paid");

      return {
        partner_id: partner.id,
        user_id: partner.id,
        partner_name: partner.name,
        email: partner.email,
        referral_code: partner.referral_code,
        portal_role: partner.role,
        partner_record_status: "verified",
        market_code: null,
        created_at: partner.created_at,
        verified_at: null,
        visits: partnerVisits.length,
        outbound_clicks: 0,
        total_leads: partnerLeads.length,
        customer_leads: partnerLeads.filter((lead) => lead.type === "customer_lead").length,
        partner_leads: partnerLeads.filter((lead) => lead.type === "partner_lead").length,
        customers: partnerCustomers.length,
        paid_orders: partnerOrders.length,
        paid_revenue: partnerOrders.reduce((sum, order) => sum + order.amount, 0),
        has_generated_leads: partnerLeads.length > 0,
        has_generated_customers: partnerCustomers.length > 0,
        has_generated_paid_orders: partnerOrders.length > 0,
      };
    })
    .sort((a, b) => b.paid_orders - a.paid_orders || b.customers - a.customers || b.total_leads - a.total_leads);
}

function buildMockKpiSourceMixDaily(visits: ReferralVisit[]): KpiSourceMixRow[] {
  const buckets = new Map<string, KpiSourceMixRow>();

  visits.forEach((visit) => {
    const day = `${toDayKey(visit.created_at)}T00:00:00.000Z`;
    const source = visit.utm_source || "unknown";
    const medium = visit.utm_medium || "unknown";
    const campaign = visit.utm_campaign || "unknown";
    const landingPage = visit.landing_page || "unknown";
    const key = [day, source, medium, campaign, landingPage].join("|");

    const existing = buckets.get(key);
    if (existing) {
      existing.visits += 1;
      return;
    }

    buckets.set(key, {
      day,
      source,
      medium,
      campaign,
      landing_page: landingPage,
      market_code: "unknown",
      visits: 1,
    });
  });

  return [...buckets.values()].sort((a, b) => (a.day < b.day ? 1 : b.visits - a.visits));
}

function buildTeamRows(users: AppUser[], relationships: PartnerRelationship[]): TeamRow[] {
  return relationships
    .map((relationship) => {
      const partner = users.find((user) => user.id === relationship.partner_user_id);
      if (!partner) {
        return null;
      }

      return {
        partnerId: partner.id,
        partnerName: partner.name,
        email: partner.email,
        level: relationship.level,
        createdAt: relationship.created_at,
      };
    })
    .filter(Boolean) as TeamRow[];
}

function buildPartnerPerformance(users: AppUser[], leads: Lead[], customers: Customer[], visits: ReferralVisit[]) {
  return users
    .filter((user) => user.role === "partner")
    .map((partner) => ({
      partnerId: partner.id,
      partnerName: partner.name,
      referralCode: partner.referral_code,
      leads: leads.filter((lead) => lead.referred_by_user_id === partner.id).length,
      customers: customers.filter((customer) => customer.referred_by_user_id === partner.id).length,
      clicks: visits.filter((visit) => visit.referral_code === partner.referral_code).length,
    }))
    .sort((a, b) => b.leads - a.leads || b.customers - a.customers);
}

function buildAdminPartnerRows(
  users: AppUser[],
  performance: ReturnType<typeof buildPartnerPerformance>,
  relationships: PartnerRelationship[],
): AdminPartnerRow[] {
  return users
    .filter((user) => user.role === "partner")
    .map((partner) => {
      const sponsor = partner.parent_partner_id ? users.find((user) => user.id === partner.parent_partner_id) : null;
      const totals = performance.find((row) => row.partnerId === partner.id);

      return {
        partnerId: partner.id,
        partnerName: partner.name,
        email: partner.email,
        referralCode: partner.referral_code,
        sponsorName: sponsor?.name || null,
        directPartners: relationships.filter((relationship) => relationship.sponsor_user_id === partner.id).length,
        leads: totals?.leads || 0,
        customers: totals?.customers || 0,
        createdAt: partner.created_at,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildGrowthCompassRows(
  users: AppUser[],
  leads: Lead[],
  customers: Customer[],
  relationships: PartnerRelationship[],
  partnerRecords: Array<{ id: string; user_id: string; referral_code?: string | null; status?: string | null; created_at: string }>,
  visits: ReferralVisit[],
  outboundClicks: OutboundClickSignal[],
): GrowthCompassRow[] {
  const partnerUsers = users.filter((user) => user.role === "partner");

  return partnerUsers
    .map((partner) => {
      const mapped = mapPartnerDataToGrowthCompassInput({
        partnerId: partner.id,
        users,
        partnerRecords,
        leads,
        customers,
        partnerRelationships: relationships,
        referralVisits: visits,
        outboundClicks,
      });
      const result = evaluateGrowthCompass(mapped.input);

      return {
        partnerId: partner.id,
        partnerName: partner.name,
        email: partner.email,
        referralCode: partner.referral_code,
        status: result.status,
        score: result.score,
        nextMilestone: result.nextMilestone,
        nextBestAction: result.nextBestAction,
        explanation: result.explanation,
        flags: result.flags,
        missingToNext: result.missingToNext,
        confidence: mapped.confidence,
        inputs: mapped.input,
      } satisfies GrowthCompassRow;
    })
    .sort((a, b) => b.score - a.score || a.partnerName.localeCompare(b.partnerName));
}

export async function resolveUserByReferralCode(referralCode: string) {
  if (!supabase) {
    return mockUsers.find((user) => user.referral_code === referralCode) || null;
  }

  const { data, error } = await requireSupabase()
    .from("users")
    .select("*")
    .eq("referral_code", referralCode)
    .maybeSingle<AppUser>();

  if (error) {
    console.error("Failed to resolve referral code", error);
    return null;
  }

  return data;
}

export async function createReferralVisit(visit: Omit<ReferralVisit, "id" | "created_at">) {
  if (!supabase) {
    return { data: null, mocked: true };
  }

  const { data, error } = await requireSupabase()
    .from("referral_visits")
    .insert(visit)
    .select()
    .maybeSingle<ReferralVisit>();

  if (error) {
    console.error("Failed to create referral visit", error);
  }

  return { data, mocked: false };
}

export async function submitLead(input: LeadSubmissionInput & { referralCode?: string | null; referredByUserId?: string | null }) {
  const payload = {
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    type: input.type,
    source_page: input.sourcePage,
    referral_code: input.referralCode || null,
    referred_by_user_id: input.referredByUserId || null,
    status: input.status || "new",
    details: input.details || {},
  };

  if (!supabase) {
    console.info("Lead submission stored in demo mode", payload);
    return { data: payload, mocked: true };
  }

  const { data, error } = await requireSupabase().from("leads").insert(payload).select().maybeSingle<Lead>();
  if (error) {
    throw error;
  }

  return { data, mocked: false };
}

export async function createPartnerProfile(input: CreatePartnerInput) {
  const sponsor = input.sponsorReferralCode ? await resolveUserByReferralCode(input.sponsorReferralCode) : null;

  const { data, error } = await requireSupabase()
    .from("users")
    .insert({
      auth_user_id: input.authUserId,
      name: input.name,
      email: input.email,
      role: "partner",
      parent_partner_id: sponsor?.id || null,
    })
    .select()
    .single<AppUser>();

  if (error) {
    throw error;
  }

  return data;
}

export async function onboardPartnerFromLead(leadId: string, authUserId: string) {
  if (!supabase) {
    const lead = mockLeads.find((row) => row.id === leadId && row.type === "partner_lead");
    if (!lead) {
      throw new Error("Partner application not found.");
    }

    return {
      mocked: true,
      partner: {
        id: `mock-partner-${lead.id}`,
        auth_user_id: authUserId,
        name: lead.name,
        email: lead.email,
        role: "partner" as const,
        referral_code: lead.referral_code || `PARTNER-${lead.id}`,
        parent_partner_id: lead.referred_by_user_id || null,
        created_at: new Date().toISOString(),
      },
    };
  }

  const client = requireSupabase();
  const { data: lead, error } = await client
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("type", "partner_lead")
    .single<Lead>();

  if (error || !lead) {
    throw error || new Error("Partner application not found.");
  }

  const partner = await createPartnerProfile({
    authUserId,
    name: lead.name,
    email: lead.email,
    sponsorReferralCode: lead.referral_code || null,
  });

  return { mocked: false, partner };
}

export async function getCurrentPortalUser() {
  if (!supabase) {
    return null;
  }

  const client = requireSupabase();
  const { data: sessionData } = await client.auth.getSession();
  const authUserId = sessionData.session?.user?.id;

  if (!authUserId) {
    return null;
  }

  const { data, error } = await client.from("users").select("*").eq("auth_user_id", authUserId).maybeSingle<AppUser>();
  if (error) {
    console.error("Failed to load portal user", error);
    return null;
  }

  return data;
}

export async function getPortalAccessState(): Promise<PortalAccessState> {
  if (!supabase) {
    return { authUser: null, portalUser: null };
  }

  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) {
    console.error("Failed to load auth user", userError);
    return { authUser: null, portalUser: null };
  }

  const authUser = userData.user
    ? {
        id: userData.user.id,
        email: userData.user.email ?? null,
      }
    : null;

  if (!authUser) {
    return { authUser: null, portalUser: null };
  }

  const { data: portalUser, error: portalError } = await client
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle<AppUser>();

  if (portalError) {
    console.error("Failed to load portal profile", portalError);
    return { authUser, portalUser: null };
  }

  return { authUser, portalUser };
}

export async function sendMagicLink(email: string) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signInWithPassword(email: string, password: string) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signOutPortalUser() {
  if (!supabase) {
    return;
  }

  const client = requireSupabase();
  await client.auth.signOut({ scope: "global" });
  window.location.assign("/dashboard/login");
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!supabase) {
    const performance = buildPartnerPerformance(mockUsers, mockLeads, mockCustomers, mockVisits);
    return {
      metrics: {
        totalLeads: mockLeads.length,
        totalCustomers: mockCustomers.length,
        totalPartnerLeads: mockLeads.filter((lead) => lead.type === "partner_lead").length,
        totalActivePartners: mockUsers.filter((user) => user.role === "partner").length,
      },
      leadsPerPartner: performance,
      customersPerPartner: [...performance].sort((a, b) => b.customers - a.customers),
      partners: buildAdminPartnerRows(mockUsers, performance, mockRelationships),
      networkOverview: buildTeamRows(mockUsers, mockRelationships),
      recentLeads: sortNewest(mockLeads).slice(0, 6),
      recentPartnerApplications: sortNewest(mockLeads.filter((lead) => lead.type === "partner_lead")).slice(0, 6),
      growthCompass: buildGrowthCompassRows(
        mockUsers,
        mockLeads,
        mockCustomers,
        mockRelationships,
        mockPartnerRecords,
        mockVisits,
        mockOutboundClicks,
      ),
      kpis: {
        funnelDaily: buildMockKpiFunnelDaily(mockVisits, mockLeads, mockCustomers, mockOrders),
        partnerPipeline: buildMockKpiPartnerPipeline(mockLeads, mockUsers),
        duplication: buildMockKpiDuplication(mockUsers, mockLeads, mockCustomers, mockOrders, mockVisits),
        sourceMixDaily: buildMockKpiSourceMixDaily(mockVisits),
      },
    };
  }

  const client = requireSupabase();
  const [
    { data: users },
    { data: leads },
    { data: customers },
    { data: relationships },
    { data: visits },
    { data: partnerRecords },
    { data: outboundClicks },
    funnelResponse,
    pipelineResponse,
    duplicationResponse,
    sourceMixResponse,
  ] = await Promise.all([
    client.from("users").select("*"),
    client.from("leads").select("*"),
    client.from("customers").select("*"),
    client.from("partner_relationships").select("*"),
    client.from("referral_visits").select("*"),
    client.from("partners").select("id, user_id, referral_code, status, created_at"),
    client.from("outbound_clicks").select("id, partner_id, referral_code, session_id, destination_type, created_at"),
    client.from("kpi_funnel_daily").select("*").limit(14),
    client.from("kpi_partner_pipeline").select("*").maybeSingle(),
    client.from("kpi_duplication").select("*").limit(12),
    client.from("kpi_source_mix_daily").select("*").limit(20),
  ]);

  const performance = buildPartnerPerformance(users || [], leads || [], customers || [], visits || []);

  return {
    metrics: {
      totalLeads: (leads || []).length,
      totalCustomers: (customers || []).length,
      totalPartnerLeads: (leads || []).filter((lead) => lead.type === "partner_lead").length,
      totalActivePartners: (users || []).filter((user) => user.role === "partner").length,
    },
    leadsPerPartner: performance,
    customersPerPartner: [...performance].sort((a, b) => b.customers - a.customers),
    partners: buildAdminPartnerRows(users || [], performance, relationships || []),
    networkOverview: buildTeamRows(users || [], relationships || []),
    recentLeads: sortNewest(leads || []).slice(0, 6),
    recentPartnerApplications: sortNewest((leads || []).filter((lead) => lead.type === "partner_lead")).slice(0, 6),
    growthCompass: buildGrowthCompassRows(
      users || [],
      leads || [],
      customers || [],
      relationships || [],
      ((partnerRecords as Array<{ id: string; user_id: string; referral_code?: string | null; status?: string | null; created_at: string }> | null) || []),
      visits || [],
      ((outboundClicks as OutboundClickSignal[] | null) || []),
    ),
    kpis: {
      funnelDaily: (funnelResponse.data as KpiFunnelDay[] | null) || [],
      partnerPipeline: (pipelineResponse.data as KpiPartnerPipeline | null) || null,
      duplication: (duplicationResponse.data as KpiDuplicationRow[] | null) || [],
      sourceMixDaily: (sourceMixResponse.data as KpiSourceMixRow[] | null) || [],
    },
  };
}

export async function getPartnerDashboardData(partnerId?: string): Promise<PartnerDashboardData> {
  if (!supabase) {
    const partner = mockUsers.find((user) => user.id === (partnerId || "user-elin")) || mockUsers[1];
    const leads = sortNewest(mockLeads.filter((lead) => lead.referred_by_user_id === partner.id));
    const customers = sortNewest(mockCustomers.filter((customer) => customer.referred_by_user_id === partner.id));
    const partnerLeads = leads.filter((lead) => lead.type === "partner_lead");
    const team = buildTeamRows(
      mockUsers,
      mockRelationships.filter((relationship) => relationship.sponsor_user_id === partner.id),
    );

    return {
      partner,
      metrics: {
        clicks: mockVisits.filter((visit) => visit.referral_code === partner.referral_code).length,
        leads: leads.length,
        customers: customers.length,
        partnerLeads: partnerLeads.length,
        directPartners: team.length,
      },
      leads,
      customers,
      partnerLeads,
      team,
    };
  }

  const client = requireSupabase();
  const partnerResponse = partnerId ? await client.from("users").select("*").eq("id", partnerId).single<AppUser>() : null;
  const profile = partnerResponse?.data || (await getCurrentPortalUser());

  if (!profile) {
    throw new Error("No partner profile found for the current session.");
  }

  const [{ data: leads }, { data: customers }, { data: relationships }, { data: visits }] = await Promise.all([
    client.from("leads").select("*").eq("referred_by_user_id", profile.id),
    client.from("customers").select("*").eq("referred_by_user_id", profile.id),
    client.from("partner_relationships").select("*").eq("sponsor_user_id", profile.id),
    client.from("referral_visits").select("*").eq("referral_code", profile.referral_code),
  ]);

  const teamUserIds = (relationships || []).map((relationship) => relationship.partner_user_id);
  const teamUsers = teamUserIds.length
    ? ((await client.from("users").select("*").in("id", teamUserIds)).data as AppUser[] | null)
    : [];

  const team = (relationships || []).map((relationship) => {
    const member = (teamUsers || []).find((user) => user.id === relationship.partner_user_id);
    return {
      partnerId: relationship.partner_user_id,
      partnerName: member?.name || "Unknown partner",
      email: member?.email || "-",
      level: relationship.level,
      createdAt: relationship.created_at,
    };
  });

  const sortedLeads = sortNewest(leads || []);

  return {
    partner: profile,
    metrics: {
      clicks: (visits || []).length,
      leads: (leads || []).length,
      customers: (customers || []).length,
      partnerLeads: (leads || []).filter((lead) => lead.type === "partner_lead").length,
      directPartners: (relationships || []).length,
    },
    leads: sortedLeads,
    customers: sortNewest(customers || []),
    partnerLeads: sortedLeads.filter((lead) => lead.type === "partner_lead"),
    team,
  };
}

export function getDemoPartnerOptions() {
  return mockUsers.filter((user) => user.role === "partner");
}

export function getMockRevenueForPartner(partnerId: string) {
  return mockOrders.filter((order) => order.referred_by_user_id === partnerId).reduce((sum, order) => sum + order.amount, 0);
}
