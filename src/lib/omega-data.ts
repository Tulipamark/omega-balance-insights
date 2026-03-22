import { supabase } from "@/integrations/supabase/client";
import {
  AdminDashboardData,
  AdminPartnerRow,
  AppUser,
  CreatePartnerInput,
  Customer,
  Lead,
  LeadSubmissionInput,
  Order,
  PartnerDashboardData,
  PartnerRelationship,
  PortalAccessState,
  ReferralVisit,
  TeamRow,
} from "@/lib/omega-types";

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

  await requireSupabase().auth.signOut();
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
    };
  }

  const client = requireSupabase();
  const [{ data: users }, { data: leads }, { data: customers }, { data: relationships }, { data: visits }] = await Promise.all([
    client.from("users").select("*"),
    client.from("leads").select("*"),
    client.from("customers").select("*"),
    client.from("partner_relationships").select("*"),
    client.from("referral_visits").select("*"),
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
