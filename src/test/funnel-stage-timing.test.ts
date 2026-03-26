import { describe, expect, it } from "vitest";
import { buildFunnelStageTimingInsights } from "@/lib/funnel-stage-timing";
import type { FunnelEvent } from "@/lib/omega-types";

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
    expect(insights.headline.title).toContain("Storst tidsfriktion");
    expect(insights.headline.summary).toContain("0 av 1");
  });

  it("returns an empty-state headline when there are no usable sessions", () => {
    const insights = buildFunnelStageTimingInsights([]);

    expect(insights.sessionsAnalyzed).toBe(0);
    expect(insights.headline.title).toBe("Ingen ledtidsdata an");
  });
});
