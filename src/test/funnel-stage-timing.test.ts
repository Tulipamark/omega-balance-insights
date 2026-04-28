import { describe, expect, it } from "vitest";
import { buildFunnelStageTimingInsights, buildPartnerLifecycleTimingInsights } from "@/lib/funnel-stage-timing";
import type { AdminPartnerRow, FunnelEvent, GrowthCompassRow, Lead } from "@/lib/omega-types";

function makeEvent(overrides: Partial<FunnelEvent>): FunnelEvent {
  return {
    id: overrides.id || "event-1",
    partner_id: overrides.partner_id || null,
    referral_code: overrides.referral_code || "ELIN2026",
    session_id: overrides.session_id || "session-1",
    event_name: overrides.event_name || "landing_viewed",
    page_path: overrides.page_path || "/sv",
    referrer: overrides.referrer || null,
    utm_source: overrides.utm_source || null,
    utm_medium: overrides.utm_medium || null,
    utm_campaign: overrides.utm_campaign || null,
    user_agent: overrides.user_agent || null,
    details: overrides.details || null,
    created_at: overrides.created_at || "2026-03-26T08:00:00.000Z",
  };
}

function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: overrides.id || "lead-1",
    name: overrides.name || "Demo Lead",
    email: overrides.email || "lead@example.com",
    phone: overrides.phone || null,
    full_name: overrides.full_name || null,
    type: overrides.type || "partner_lead",
    lead_type: overrides.lead_type || "partner",
    lead_source: overrides.lead_source || "partner_form",
    source_page: overrides.source_page || "/sv/partners",
    referral_code: overrides.referral_code || "OMEGATEAM",
    referred_by_user_id: overrides.referred_by_user_id || "user-admin",
    partner_id: overrides.partner_id || null,
    session_id: overrides.session_id || null,
    status: overrides.status || "new",
    details: overrides.details || null,
    created_at: overrides.created_at || "2026-03-26T08:00:00.000Z",
    updated_at: overrides.updated_at || null,
  };
}

function makePartnerRow(overrides: Partial<AdminPartnerRow>): AdminPartnerRow {
  return {
    partnerId: overrides.partnerId || "partner-1",
    partnerName: overrides.partnerName || "Demo Partner",
    email: overrides.email || "partner@example.com",
    referralCode: overrides.referralCode || "OMEGATEAM",
    sponsorName: overrides.sponsorName || null,
    directPartners: overrides.directPartners || 0,
    leads: overrides.leads || 0,
    customers: overrides.customers || 0,
    zzLinksReady: overrides.zzLinksReady || false,
    zzLinks: overrides.zzLinks || { test: null, gutTest: null, shop: null, partner: null, consultation: null },
    createdAt: overrides.createdAt || "2026-03-26T10:00:00.000Z",
    verifiedAt: overrides.verifiedAt || null,
  };
}

function makeGrowthRow(overrides: Partial<GrowthCompassRow>): GrowthCompassRow {
  return {
    partnerId: overrides.partnerId || "partner-1",
    partnerName: overrides.partnerName || "Demo Partner",
    email: overrides.email || "partner@example.com",
    referralCode: overrides.referralCode || "OMEGATEAM",
    status: overrides.status || "inactive",
    score: overrides.score || 0,
    nextMilestone: overrides.nextMilestone || "Nasta steg",
    nextBestAction: overrides.nextBestAction || "Gor nasta steg",
    explanation: overrides.explanation || "Forklaring",
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
    firstActiveSignalAt: overrides.firstActiveSignalAt || null,
    inputs: overrides.inputs || {
      personalCustomers30d: 0,
      recruitedPartners30d: 0,
      activeFirstLinePartners30d: 0,
      partnerGeneratedLeads30d: 0,
      partnerGeneratedCustomers30d: 0,
    },
  };
}

describe("buildFunnelStageTimingInsights", () => {
  it("measures median and completion across the session funnel", () => {
    const insights = buildFunnelStageTimingInsights([
      makeEvent({ id: "a1", session_id: "session-a", event_name: "landing_viewed", created_at: "2026-03-26T08:00:00.000Z" }),
      makeEvent({ id: "a2", session_id: "session-a", event_name: "hero_primary_cta_clicked", created_at: "2026-03-26T08:00:30.000Z" }),
      makeEvent({ id: "a3", session_id: "session-a", event_name: "lead_form_started", created_at: "2026-03-26T08:01:30.000Z" }),
      makeEvent({ id: "a4", session_id: "session-a", event_name: "lead_form_submitted", created_at: "2026-03-26T08:03:00.000Z" }),
      makeEvent({ id: "b1", session_id: "session-b", event_name: "landing_viewed", created_at: "2026-03-26T09:00:00.000Z" }),
      makeEvent({ id: "b2", session_id: "session-b", event_name: "sticky_cta_clicked", created_at: "2026-03-26T09:01:00.000Z" }),
      makeEvent({ id: "c1", session_id: "session-c", event_name: "landing_viewed", created_at: "2026-03-26T10:00:00.000Z" }),
      makeEvent({ id: "d1", session_id: "session-d", page_path: "/sv/partners", event_name: "landing_viewed", created_at: "2026-03-26T11:00:00.000Z" }),
      makeEvent({ id: "d2", session_id: "session-d", page_path: "/sv/partners", event_name: "partner_hero_primary_cta_clicked", created_at: "2026-03-26T11:00:20.000Z" }),
      makeEvent({ id: "d3", session_id: "session-d", page_path: "/sv/partners", event_name: "partner_form_started", created_at: "2026-03-26T11:00:40.000Z" }),
      makeEvent({ id: "d4", session_id: "session-d", page_path: "/sv/partners", event_name: "partner_form_submitted", created_at: "2026-03-26T11:01:10.000Z" }),
    ]);

    expect(insights.sessionsAnalyzed).toBe(4);
    expect(insights.steps.map((step) => step.completionCount)).toEqual([3, 2, 2]);
    expect(insights.steps.map((step) => step.fromCount)).toEqual([4, 3, 2]);
    expect(insights.steps[0].medianSeconds).toBe(30);
    expect(insights.steps[1].medianSeconds).toBe(40);
    expect(insights.steps[2].medianSeconds).toBe(60);
    expect(insights.headline.title).toContain("CTA-klick till formstart");
  });

  it("surfaces friction even when a step has zero completions", () => {
    const insights = buildFunnelStageTimingInsights([
      makeEvent({ id: "solo", session_id: "session-solo", event_name: "landing_viewed" }),
    ]);

    expect(insights.steps[0].fromCount).toBe(1);
    expect(insights.steps[0].completionCount).toBe(0);
    expect(insights.headline.title).toContain("Störst tidsfriktion");
    expect(insights.headline.summary).toContain("0 av 1");
  });

  it("returns an empty-state headline when there are no usable sessions", () => {
    const insights = buildFunnelStageTimingInsights([]);

    expect(insights.sessionsAnalyzed).toBe(0);
    expect(insights.headline.title).toBe("Ingen ledtidsdata än");
  });
});

describe("buildPartnerLifecycleTimingInsights", () => {
  it("measures partner lifecycle timing from lead to setup", () => {
    const insights = buildPartnerLifecycleTimingInsights({
      partnerApplications: [
        makeLead({
          id: "lead-a",
          created_at: "2026-03-26T08:00:00.000Z",
          updated_at: "2026-03-26T08:15:00.000Z",
          details: {
            partner_priority: "hot",
            admin_note: "Ring idag",
            review_updated_at: "2026-03-26T08:10:00.000Z",
            zinzino_verified: true,
            team_intent_confirmed: true,
          },
        }),
        makeLead({
          id: "lead-b",
          created_at: "2026-03-26T09:00:00.000Z",
          updated_at: "2026-03-26T09:20:00.000Z",
          status: "qualified",
          details: {
            partner_priority: "follow_up",
            review_updated_at: "2026-03-26T09:05:00.000Z",
          },
        }),
      ],
      partners: [
        makePartnerRow({
          partnerId: "partner-a",
          createdAt: "2026-03-26T10:00:00.000Z",
          zzLinksReady: true,
          verifiedAt: "2026-03-26T10:30:00.000Z",
          zzLinks: {
            test: "https://example.com/test",
            shop: "https://example.com/shop",
            partner: "https://example.com/partner",
            consultation: null,
          },
        }),
        makePartnerRow({
          partnerId: "partner-b",
          createdAt: "2026-03-26T11:00:00.000Z",
        }),
      ],
      growthCompass: [
        makeGrowthRow({
          partnerId: "partner-a",
          status: "active",
          firstActiveSignalAt: "2026-03-26T11:00:00.000Z",
        }),
        makeGrowthRow({
          partnerId: "partner-b",
          status: "inactive",
        }),
      ],
    });

    expect(insights.recordsAnalyzed).toBe(2);
    expect(insights.steps.map((step) => step.fromCount)).toEqual([2, 2, 2, 1]);
    expect(insights.steps.map((step) => step.completionCount)).toEqual([2, 1, 1, 1]);
    expect(insights.steps[0].medianSeconds).toBe(450);
    expect(insights.steps[1].medianSeconds).toBe(0);
    expect(insights.steps[2].medianSeconds).toBe(1800);
    expect(insights.steps[3].medianSeconds).toBe(1800);
    expect(insights.headline.title).toContain("Portalpartner till 3 länkar klara");
  });
});
