import { supabase } from "@/integrations/supabase/client";
import {
  AcceptPortalLegalRequest,
  AdminDashboardData,
  AdminPartnerRow,
  AppUser,
  CreatePartnerInput,
  Customer,
  FunnelEvent,
  GrowthCompassRow,
  KpiDuplicationRow,
  KpiFunnelEventDay,
  KpiFunnelDay,
  KpiPartnerPipeline,
  KpiSourceMixRow,
  Lead,
  LeadSubmissionInput,
  Order,
  PartnerDashboardData,
  PartnerRelationship,
  PortalAccessState,
  PartnerZzLinks,
  ReferralVisit,
  TeamRow,
} from "@/lib/omega-types";
import { PORTAL_NOTICE_VERSION, PORTAL_PRIVACY_VERSION, PORTAL_TERMS_VERSION } from "@/lib/portal-legal";
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
    accepted_terms_at: now.toISOString(),
    accepted_privacy_at: now.toISOString(),
    accepted_portal_notice_at: now.toISOString(),
    terms_version: PORTAL_TERMS_VERSION,
    privacy_version: PORTAL_PRIVACY_VERSION,
    portal_notice_version: PORTAL_NOTICE_VERSION,
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
    accepted_terms_at: now.toISOString(),
    accepted_privacy_at: now.toISOString(),
    accepted_portal_notice_at: now.toISOString(),
    terms_version: PORTAL_TERMS_VERSION,
    privacy_version: PORTAL_PRIVACY_VERSION,
    portal_notice_version: PORTAL_NOTICE_VERSION,
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
    accepted_terms_at: now.toISOString(),
    accepted_privacy_at: now.toISOString(),
    accepted_portal_notice_at: now.toISOString(),
    terms_version: PORTAL_TERMS_VERSION,
    privacy_version: PORTAL_PRIVACY_VERSION,
    portal_notice_version: PORTAL_NOTICE_VERSION,
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
    accepted_terms_at: now.toISOString(),
    accepted_privacy_at: now.toISOString(),
    accepted_portal_notice_at: now.toISOString(),
    terms_version: PORTAL_TERMS_VERSION,
    privacy_version: PORTAL_PRIVACY_VERSION,
    portal_notice_version: PORTAL_NOTICE_VERSION,
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
    details: {
      attribution: {
        sessionId: "session-demo-anna",
        referralCode: "ELIN2026",
        referredByUserId: "user-elin",
        landingPage: "/sv",
        firstTouch: {
          capturedAt: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(),
          landingPage: "/sv",
          utmSource: "instagram",
          utmMedium: "social",
          utmCampaign: "spring-launch",
        },
        lastTouch: {
          capturedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
          landingPage: "/sv",
          utmSource: "email",
          utmMedium: "crm",
          utmCampaign: "follow-up",
        },
      },
    },
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
    details: {
      interest: "Build a business",
      attribution: {
        sessionId: "session-demo-jonas",
        referralCode: "ELIN2026",
        referredByUserId: "user-elin",
        landingPage: "/sv",
        firstTouch: {
          capturedAt: new Date(now.getTime() - 1000 * 60 * 60 * 30).toISOString(),
          landingPage: "/sv",
          utmSource: "instagram",
          utmMedium: "social",
          utmCampaign: "partner-story",
        },
        lastTouch: {
          capturedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
          landingPage: "/sv/partners",
          utmSource: "email",
          utmMedium: "crm",
          utmCampaign: "partner-follow-up",
        },
      },
    },
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
    details: {
      interest: "Extra income",
      attribution: {
        sessionId: "session-demo-david",
        referralCode: "SAGA444",
        referredByUserId: "user-saga",
        landingPage: "/sv/partners",
        firstTouch: {
          capturedAt: new Date(now.getTime() - 1000 * 60 * 60 * 52).toISOString(),
          landingPage: "/sv/partners",
          utmSource: "facebook",
          utmMedium: "paid_social",
          utmCampaign: "extra-income",
        },
        lastTouch: {
          capturedAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
          landingPage: "/sv/partners",
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
        },
      },
    },
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
    zinzino_test_url: `https://www.zinzino.com/test/${user.referral_code.toLowerCase()}`,
    zinzino_shop_url: `https://www.zinzino.com/shop/${user.referral_code.toLowerCase()}`,
    zinzino_partner_url: `https://www.zinzino.com/partner/${user.referral_code.toLowerCase()}`,
    consultation_url: `https://www.zinzino.com/consultation/${user.referral_code.toLowerCase()}`,
    status: "verified",
    created_at: user.created_at,
    verified_at: user.created_at,
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

const mockFunnelEvents: FunnelEvent[] = [
  {
    id: "event-1",
    partner_id: "partner-record-user-elin",
    referral_code: "ELIN2026",
    session_id: "session-el-1",
    event_name: "landing_viewed",
    page_path: "/sv",
    utm_source: "instagram",
    utm_medium: "social",
    utm_campaign: "spring-launch",
    details: { landingType: "customer" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "event-2",
    partner_id: "partner-record-user-elin",
    referral_code: "ELIN2026",
    session_id: "session-el-1",
    event_name: "hero_primary_cta_clicked",
    page_path: "/sv",
    details: { placement: "hero", destinationType: "test" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2 + 1000 * 45).toISOString(),
  },
  {
    id: "event-3",
    partner_id: "partner-record-user-elin",
    referral_code: "ELIN2026",
    session_id: "session-el-1",
    event_name: "lead_form_started",
    page_path: "/sv",
    details: { formType: "consultation" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2 + 1000 * 75).toISOString(),
  },
  {
    id: "event-4",
    partner_id: "partner-record-user-elin",
    referral_code: "ELIN2026",
    session_id: "session-el-1",
    event_name: "lead_form_submitted",
    page_path: "/sv",
    details: { formType: "consultation" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2 + 1000 * 180).toISOString(),
  },
  {
    id: "event-5",
    partner_id: "partner-record-user-mikael",
    referral_code: "MIKAEL88",
    session_id: "session-mi-1",
    event_name: "landing_viewed",
    page_path: "/sv/partners",
    utm_source: "email",
    utm_medium: "crm",
    utm_campaign: "march-follow-up",
    details: { landingType: "partner" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "event-6",
    partner_id: "partner-record-user-mikael",
    referral_code: "MIKAEL88",
    session_id: "session-mi-1",
    event_name: "partner_hero_primary_cta_clicked",
    page_path: "/sv/partners",
    details: { placement: "hero" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 18 + 1000 * 30).toISOString(),
  },
  {
    id: "event-7",
    partner_id: "partner-record-user-mikael",
    referral_code: "MIKAEL88",
    session_id: "session-mi-1",
    event_name: "partner_form_started",
    page_path: "/sv/partners",
    details: { formType: "partner_application" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 18 + 1000 * 75).toISOString(),
  },
  {
    id: "event-8",
    partner_id: "partner-record-user-mikael",
    referral_code: "MIKAEL88",
    session_id: "session-mi-1",
    event_name: "partner_form_submit_failed",
    page_path: "/sv/partners",
    details: { formType: "partner_application", reason: "missing_referral" },
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 18 + 1000 * 120).toISOString(),
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

function buildMockKpiFunnelEventsDaily(events: FunnelEvent[]): KpiFunnelEventDay[] {
  const buckets = new Map<string, KpiFunnelEventDay>();

  events.forEach((event) => {
    const day = `${toDayKey(event.created_at)}T00:00:00.000Z`;
    const key = `${day}|${event.event_name}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.events += 1;
      return;
    }

    buckets.set(key, {
      day,
      event_name: event.event_name,
      events: 1,
    });
  });

  return [...buckets.values()].sort((a, b) => {
    if (a.day !== b.day) {
      return a.day < b.day ? 1 : -1;
    }

    if (a.events !== b.events) {
      return b.events - a.events;
    }

    return a.event_name.localeCompare(b.event_name);
  });
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
  partnerRecords: Array<{
    id: string;
    user_id: string;
    referral_code?: string | null;
    zinzino_test_url?: string | null;
    zinzino_shop_url?: string | null;
    zinzino_partner_url?: string | null;
      consultation_url?: string | null;
      status?: string | null;
      created_at: string;
      verified_at?: string | null;
    }>,
  ): AdminPartnerRow[] {
  return users
    .filter((user) => user.role === "partner")
    .map((partner) => {
      const sponsor = partner.parent_partner_id ? users.find((user) => user.id === partner.parent_partner_id) : null;
      const totals = performance.find((row) => row.partnerId === partner.id);
      const partnerRecord = partnerRecords.find((record) => record.user_id === partner.id);
      const zzLinksReady = Boolean(
        partnerRecord?.zinzino_test_url &&
        partnerRecord?.zinzino_shop_url &&
        partnerRecord?.zinzino_partner_url,
      );

      return {
        partnerId: partner.id,
        partnerName: partner.name,
        email: partner.email,
        referralCode: partner.referral_code,
        sponsorName: sponsor?.name || null,
        directPartners: relationships.filter((relationship) => relationship.sponsor_user_id === partner.id).length,
        leads: totals?.leads || 0,
        customers: totals?.customers || 0,
        zzLinksReady,
          zzLinks: {
            test: partnerRecord?.zinzino_test_url || null,
            shop: partnerRecord?.zinzino_shop_url || null,
            partner: partnerRecord?.zinzino_partner_url || null,
            consultation: partnerRecord?.consultation_url || null,
          },
          createdAt: partner.created_at,
          verifiedAt: partnerRecord?.verified_at || null,
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

  const uniq = <T,>(items: T[]) => [...new Set(items)];

  const getFirstLinePartnerIds = (partnerId: string) =>
    uniq(
      relationships
        .filter((relationship) => relationship.sponsor_user_id === partnerId)
        .map((relationship) => relationship.partner_user_id),
    );

  const getAllDownlinePartnerIds = (partnerId: string) => {
    const result = new Set<string>();
    const queue = [partnerId];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }

      const children = relationships
        .filter((relationship) => relationship.sponsor_user_id === current)
        .map((relationship) => relationship.partner_user_id);

      for (const child of children) {
        if (!result.has(child)) {
          result.add(child);
          queue.push(child);
        }
      }
    }

    result.delete(partnerId);
    return [...result];
  };

  const getPartnerRecordIdsForUser = (userId: string) =>
    partnerRecords
      .filter((record) => record.user_id === userId)
      .map((record) => record.id);

  const getEarliestTimestamp = (values: Array<string | null | undefined>) => {
    const timestamps = values
      .map((value) => (value ? new Date(value).getTime() : Number.NaN))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);

    if (!timestamps.length) {
      return null;
    }

    return new Date(timestamps[0]).toISOString();
  };

  const getFirstObservedActivitySignalAt = (partnerId: string) => {
    const partnerRecordIds = getPartnerRecordIdsForUser(partnerId);
    const firstLineIds = getFirstLinePartnerIds(partnerId);
    const downlineIds = getAllDownlinePartnerIds(partnerId);

    const directSignals = [
      ...leads
        .filter((lead) => lead.referred_by_user_id === partnerId)
        .map((lead) => lead.created_at),
      ...customers
        .filter((customer) => customer.referred_by_user_id === partnerId)
        .map((customer) => customer.created_at),
      ...relationships
        .filter((relationship) => relationship.sponsor_user_id === partnerId)
        .map((relationship) => relationship.created_at),
      ...outboundClicks
        .filter((click) => click.partner_id && partnerRecordIds.includes(click.partner_id))
        .map((click) => click.created_at),
    ];

    const firstLineSignals = [
      ...leads
        .filter((lead) => lead.referred_by_user_id && firstLineIds.includes(lead.referred_by_user_id))
        .map((lead) => lead.created_at),
      ...customers
        .filter((customer) => customer.referred_by_user_id && firstLineIds.includes(customer.referred_by_user_id))
        .map((customer) => customer.created_at),
      ...visits
        .filter((visit) => visit.partner_id && firstLineIds.includes(visit.partner_id))
        .map((visit) => visit.created_at),
      ...relationships
        .filter((relationship) => relationship.sponsor_user_id && firstLineIds.includes(relationship.sponsor_user_id))
        .map((relationship) => relationship.created_at),
      ...outboundClicks
        .filter((click) => {
          if (!click.partner_id) {
            return false;
          }

          return firstLineIds.some((firstLineId) => getPartnerRecordIdsForUser(firstLineId).includes(click.partner_id!));
        })
        .map((click) => click.created_at),
    ];

    const downlineSignals = [
      ...leads
        .filter((lead) => lead.referred_by_user_id && downlineIds.includes(lead.referred_by_user_id))
        .map((lead) => lead.created_at),
      ...customers
        .filter((customer) => customer.referred_by_user_id && downlineIds.includes(customer.referred_by_user_id))
        .map((customer) => customer.created_at),
    ];

    return getEarliestTimestamp([...directSignals, ...firstLineSignals, ...downlineSignals]);
  };

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
          firstActiveSignalAt: result.status === "inactive" ? null : getFirstObservedActivitySignalAt(partner.id),
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

export async function acceptPortalLegal(payload: AcceptPortalLegalRequest) {
  if (!supabase) {
    const demoPartner = mockUsers.find((user) => user.role === "partner");
    if (demoPartner) {
      demoPartner.accepted_terms_at = payload.accepted_terms_at;
      demoPartner.accepted_privacy_at = payload.accepted_privacy_at;
      demoPartner.accepted_portal_notice_at = payload.accepted_portal_notice_at;
      demoPartner.terms_version = payload.terms_version;
      demoPartner.privacy_version = payload.privacy_version;
      demoPartner.portal_notice_version = payload.portal_notice_version;
      demoPartner.legal_acceptance_user_agent = payload.legal_acceptance_user_agent || null;
    }

    return { ok: true as const };
  }

  const client = requireSupabase();
  const { data: sessionData } = await client.auth.getSession();
  const authUserId = sessionData.session?.user?.id;

  if (!authUserId) {
    throw new Error("Du måste vara inloggad för att godkänna villkoren.");
  }

  const { error } = await client
    .from("users")
    .update({
      accepted_terms_at: payload.accepted_terms_at,
      accepted_privacy_at: payload.accepted_privacy_at,
      accepted_portal_notice_at: payload.accepted_portal_notice_at,
      terms_version: payload.terms_version,
      privacy_version: payload.privacy_version,
      portal_notice_version: payload.portal_notice_version,
      legal_acceptance_user_agent: payload.legal_acceptance_user_agent || null,
    })
    .eq("auth_user_id", authUserId);

  if (error) {
    throw error;
  }

  return { ok: true as const };
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
      partnerApplications: sortNewest(mockLeads.filter((lead) => lead.type === "partner_lead")),
      partners: buildAdminPartnerRows(mockUsers, performance, mockRelationships, mockPartnerRecords),
      networkOverview: buildTeamRows(mockUsers, mockRelationships),
      recentLeads: sortNewest(mockLeads).slice(0, 6),
      recentPartnerApplications: sortNewest(mockLeads.filter((lead) => lead.type === "partner_lead")).slice(0, 6),
      recentFunnelEvents: sortNewest(mockFunnelEvents).slice(0, 12),
      funnelEventTimeline: sortNewest(mockFunnelEvents),
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
        funnelEventsDaily: buildMockKpiFunnelEventsDaily(mockFunnelEvents),
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
    funnelEventsResponse,
    funnelEventsDailyResponse,
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
      client.from("partners").select("id, user_id, referral_code, zinzino_test_url, zinzino_shop_url, zinzino_partner_url, consultation_url, status, created_at, verified_at"),
    client.from("outbound_clicks").select("id, partner_id, referral_code, session_id, destination_type, created_at"),
    client.from("funnel_events").select("*").order("created_at", { ascending: false }).limit(500),
    client.from("kpi_funnel_events_daily").select("*").order("day", { ascending: false }).limit(50),
    client.from("kpi_funnel_daily").select("*").order("day", { ascending: false }).limit(14),
    client.from("kpi_partner_pipeline").select("*").maybeSingle(),
    client.from("kpi_duplication").select("*").limit(12),
    client.from("kpi_source_mix_daily").select("*").order("day", { ascending: false }).limit(20),
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
    partnerApplications: sortNewest((leads || []).filter((lead) => lead.type === "partner_lead")),
    partners: buildAdminPartnerRows(
      users || [],
      performance,
      relationships || [],
      ((partnerRecords as Array<{
        id: string;
        user_id: string;
        referral_code?: string | null;
        zinzino_test_url?: string | null;
        zinzino_shop_url?: string | null;
        zinzino_partner_url?: string | null;
          consultation_url?: string | null;
          status?: string | null;
          created_at: string;
          verified_at?: string | null;
        }> | null) || []),
    ),
    networkOverview: buildTeamRows(users || [], relationships || []),
    recentLeads: sortNewest(leads || []).slice(0, 6),
    recentPartnerApplications: sortNewest((leads || []).filter((lead) => lead.type === "partner_lead")).slice(0, 6),
    recentFunnelEvents: ((funnelEventsResponse.data as FunnelEvent[] | null) || []).slice(0, 12),
    funnelEventTimeline: (funnelEventsResponse.data as FunnelEvent[] | null) || [],
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
      funnelEventsDaily: (funnelEventsDailyResponse.data as KpiFunnelEventDay[] | null) || [],
      partnerPipeline: (pipelineResponse.data as KpiPartnerPipeline | null) || null,
      duplication: (duplicationResponse.data as KpiDuplicationRow[] | null) || [],
      sourceMixDaily: (sourceMixResponse.data as KpiSourceMixRow[] | null) || [],
    },
  };
}

export async function getPartnerDashboardData(partnerId?: string): Promise<PartnerDashboardData> {
  if (!supabase) {
    const partner = mockUsers.find((user) => user.id === (partnerId || "user-elin")) || mockUsers[1];
    const sponsor = partner.parent_partner_id ? mockUsers.find((user) => user.id === partner.parent_partner_id) || null : null;
    const leads = sortNewest(mockLeads.filter((lead) => lead.referred_by_user_id === partner.id));
    const customers = sortNewest(mockCustomers.filter((customer) => customer.referred_by_user_id === partner.id));
    const partnerLeads = leads.filter((lead) => lead.type === "partner_lead");
    const team = buildTeamRows(
      mockUsers,
      mockRelationships.filter((relationship) => relationship.sponsor_user_id === partner.id),
    );

    return {
      partner,
      sponsor: sponsor
        ? {
            id: sponsor.id,
            name: sponsor.name,
            email: sponsor.email,
          }
        : null,
      zzLinks: {
        test: mockPartnerRecords.find((record) => record.user_id === partner.id)?.zinzino_test_url || null,
        shop: mockPartnerRecords.find((record) => record.user_id === partner.id)?.zinzino_shop_url || null,
        partner: mockPartnerRecords.find((record) => record.user_id === partner.id)?.zinzino_partner_url || null,
        consultation: mockPartnerRecords.find((record) => record.user_id === partner.id)?.consultation_url || null,
      },
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

  const [{ data: leads }, { data: customers }, { data: relationships }, { data: visits }, { data: partnerRecord }] = await Promise.all([
    client.from("leads").select("*").eq("referred_by_user_id", profile.id),
    client.from("customers").select("*").eq("referred_by_user_id", profile.id),
    client.from("partner_relationships").select("*").eq("sponsor_user_id", profile.id),
    client.from("referral_visits").select("*").eq("referral_code", profile.referral_code),
    client
      .from("partners")
      .select("zinzino_test_url, zinzino_shop_url, zinzino_partner_url, consultation_url")
      .eq("user_id", profile.id)
      .maybeSingle(),
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
  const sponsor = profile.parent_partner_id
    ? ((await client.from("users").select("id, name, email").eq("id", profile.parent_partner_id).maybeSingle()).data as Pick<AppUser, "id" | "name" | "email"> | null)
    : null;

  return {
    partner: profile,
    sponsor: sponsor
      ? {
          id: sponsor.id,
          name: sponsor.name,
          email: sponsor.email,
        }
      : null,
    zzLinks: {
      test: partnerRecord?.zinzino_test_url || null,
      shop: partnerRecord?.zinzino_shop_url || null,
      partner: partnerRecord?.zinzino_partner_url || null,
      consultation: partnerRecord?.consultation_url || null,
    },
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

function normalizeHttpsUrl(value: string | null | undefined, label: string) {
  const trimmed = value?.trim() || "";

  if (!trimmed) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${label} måste vara en giltig URL.`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`${label} måste börja med https://`);
  }

  return parsed.toString();
}

function hasCompletePartnerZzLinks(links: {
  zinzino_test_url: string | null;
  zinzino_shop_url: string | null;
  zinzino_partner_url: string | null;
  consultation_url: string | null;
}) {
  return Boolean(
    links.zinzino_test_url &&
    links.zinzino_shop_url &&
    links.zinzino_partner_url,
  );
}

function derivePartnerRecordState(
  links: {
    zinzino_test_url: string | null;
    zinzino_shop_url: string | null;
    zinzino_partner_url: string | null;
    consultation_url: string | null;
  },
  existingStatus?: string | null,
  existingVerifiedAt?: string | null,
) {
  if (existingStatus === "rejected") {
    return {
      status: "rejected",
      verified_at: existingVerifiedAt ?? null,
    };
  }

  if (hasCompletePartnerZzLinks(links)) {
    return {
      status: "verified",
      verified_at: existingVerifiedAt ?? new Date().toISOString(),
    };
  }

  return {
    status: "pending",
    verified_at: null,
  };
}

export async function updatePartnerZzLinks(partnerId: string, zzLinks: PartnerZzLinks) {
  const normalizedLinks = {
    zinzino_test_url: normalizeHttpsUrl(zzLinks.test, "Testlänk"),
    zinzino_shop_url: normalizeHttpsUrl(zzLinks.shop, "Shoplänk"),
    zinzino_partner_url: normalizeHttpsUrl(zzLinks.partner, "Partnerlänk"),
    consultation_url: normalizeHttpsUrl(zzLinks.consultation, "Konsultationslänk"),
  };

  if (!supabase) {
    const existingRecord = mockPartnerRecords.find((record) => record.user_id === partnerId);

    if (existingRecord) {
      const nextState = derivePartnerRecordState(normalizedLinks, existingRecord.status, existingRecord.verified_at);

      existingRecord.zinzino_test_url = normalizedLinks.zinzino_test_url;
      existingRecord.zinzino_shop_url = normalizedLinks.zinzino_shop_url;
      existingRecord.zinzino_partner_url = normalizedLinks.zinzino_partner_url;
      existingRecord.consultation_url = normalizedLinks.consultation_url;
      existingRecord.status = nextState.status;
      existingRecord.verified_at = nextState.verified_at;
    } else {
      const partnerUser = mockUsers.find((user) => user.id === partnerId);

      if (!partnerUser) {
        throw new Error("Partnern kunde inte hittas.");
      }

      const nextState = derivePartnerRecordState(normalizedLinks);

      mockPartnerRecords.push({
        id: `partner-record-${partnerId}`,
        user_id: partnerId,
        referral_code: partnerUser.referral_code,
        status: nextState.status,
        created_at: new Date().toISOString(),
        verified_at: nextState.verified_at,
        ...normalizedLinks,
      });
    }

    return { ok: true };
  }

  const client = requireSupabase();
  const { data: partnerRecord, error: fetchError } = await client
    .from("partners")
    .select("id, status, verified_at")
    .eq("user_id", partnerId)
    .maybeSingle<{ id: string; status?: string | null; verified_at?: string | null }>();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (partnerRecord?.id) {
    const nextState = derivePartnerRecordState(normalizedLinks, partnerRecord.status, partnerRecord.verified_at);
    const { error: updateError } = await client
      .from("partners")
      .update({
        ...normalizedLinks,
        ...nextState,
      })
      .eq("id", partnerRecord.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { ok: true };
  }

  const { data: partnerUser, error: partnerUserError } = await client
    .from("users")
    .select("referral_code")
    .eq("id", partnerId)
    .maybeSingle<{ referral_code?: string | null }>();

  if (partnerUserError) {
    throw new Error(partnerUserError.message);
  }

  const nextState = derivePartnerRecordState(normalizedLinks);
  const { error: insertError } = await client.from("partners").insert({
    user_id: partnerId,
    referral_code: partnerUser?.referral_code || null,
    ...nextState,
    ...normalizedLinks,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { ok: true };
}

export function getDemoPartnerOptions() {
  return mockUsers.filter((user) => user.role === "partner");
}

export function getMockRevenueForPartner(partnerId: string) {
  return mockOrders.filter((order) => order.referred_by_user_id === partnerId).reduce((sum, order) => sum + order.amount, 0);
}
