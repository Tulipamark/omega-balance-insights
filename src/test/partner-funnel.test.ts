import { describe, expect, it } from "vitest";
import { buildPartnerFunnelInsights } from "@/lib/partner-funnel";
import type { AdminDashboardData, GrowthCompassRow, Lead } from "@/lib/omega-types";

function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: overrides.id || "lead-1",
    name: overrides.name || "Test Lead",
    email: overrides.email || "lead@example.com",
    phone: overrides.phone || null,
    type: "partner_lead",
    lead_source: overrides.lead_source || "partner_form",
    source_page: overrides.source_page || "/partner",
    referred_by_user_id: overrides.referred_by_user_id || null,
    referral_code: overrides.referral_code || null,
    session_id: overrides.session_id || null,
    status: overrides.status || "new",
    details: overrides.details || {},
    created_at: overrides.created_at || "2026-03-26T08:00:00.000Z",
    updated_at: overrides.updated_at || null,
  };
}

function makeGrowthRow(overrides: Partial<GrowthCompassRow>): GrowthCompassRow {
  return {
    partnerId: overrides.partnerId || "partner-1",
    partnerName: overrides.partnerName || "Partner One",
    email: overrides.email || "partner1@example.com",
    referralCode: overrides.referralCode || "P1",
    status: overrides.status || "inactive",
    score: overrides.score || 0,
    nextMilestone: overrides.nextMilestone || "Start",
    nextBestAction: overrides.nextBestAction || "Next action",
    explanation: overrides.explanation || "Explanation",
    flags: overrides.flags || [],
    missingToNext: overrides.missingToNext || [],
    confidence: overrides.confidence || {
      overall: "medium",
      metrics: {
        personalCustomers30d: { level: "medium", reasons: [] },
        recruitedPartners30d: { level: "medium", reasons: [] },
        activeFirstLinePartners30d: { level: "medium", reasons: [] },
        partnerGeneratedLeads30d: { level: "medium", reasons: [] },
        partnerGeneratedCustomers30d: { level: "medium", reasons: [] },
      },
    },
    inputs: overrides.inputs || {
      personalCustomers30d: 0,
      recruitedPartners30d: 0,
      activeFirstLinePartners30d: 0,
      partnerGeneratedLeads30d: 0,
      partnerGeneratedCustomers30d: 0,
    },
  };
}

function makeDashboardData(overrides?: Partial<Pick<AdminDashboardData, "partnerApplications" | "partners" | "growthCompass">>) {
  return {
    partnerApplications: overrides?.partnerApplications || [],
    partners: overrides?.partners || [],
    growthCompass: overrides?.growthCompass || [],
  };
}

describe("buildPartnerFunnelInsights", () => {
  it("maps applications through candidate, ready and onboarded steps", () => {
    const insights = buildPartnerFunnelInsights(
      makeDashboardData({
        partnerApplications: [
          makeLead({ id: "lead-new", name: "Ny" }),
          makeLead({
            id: "lead-candidate",
            name: "Kandidat",
            details: { partner_priority: "follow_up" },
          }),
          makeLead({
            id: "lead-ready",
            name: "Redo",
            details: { partner_priority: "hot", zinzino_verified: true, team_intent_confirmed: true },
          }),
          makeLead({
            id: "lead-active",
            name: "Aktiv",
            status: "active",
          }),
        ],
      }),
    );

    expect(insights.applicationStages.map((stage) => stage.count)).toEqual([4, 3, 2, 1]);
    expect(insights.blockers[0].label).toBe("Ogranskade partnerleads");
    expect(insights.blockers[0].count).toBe(1);
  });

  it("tracks activation friction after onboarding", () => {
    const insights = buildPartnerFunnelInsights(
      makeDashboardData({
        partners: [
          {
            partnerId: "partner-1",
            partnerName: "Elin",
            email: "elin@example.com",
            referralCode: "ELIN",
            sponsorName: null,
            directPartners: 0,
            leads: 0,
            customers: 0,
            zzLinksReady: false,
            zzLinks: { test: null, shop: null, partner: null, consultation: null },
            createdAt: "2026-03-26T08:00:00.000Z",
          },
          {
            partnerId: "partner-2",
            partnerName: "Saga",
            email: "saga@example.com",
            referralCode: "SAGA",
            sponsorName: null,
            directPartners: 0,
            leads: 0,
            customers: 0,
            zzLinksReady: true,
            zzLinks: {
              test: "https://example.com/test",
              shop: "https://example.com/shop",
              partner: "https://example.com/partner",
              consultation: "https://example.com/consultation",
            },
            createdAt: "2026-03-26T08:00:00.000Z",
          },
        ],
        growthCompass: [
          makeGrowthRow({ partnerId: "partner-1", partnerName: "Elin", status: "inactive" }),
          makeGrowthRow({ partnerId: "partner-2", partnerName: "Saga", status: "duplicating" }),
        ],
      }),
    );

    expect(insights.activationStages.map((stage) => stage.count)).toEqual([2, 1, 1, 1]);
    expect(insights.blockers.find((blocker) => blocker.key === "missing-links")?.count).toBe(1);
    expect(insights.headline.title).toContain("Portalpartners utan 3 länkar");
  });
});
