import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureReferralVisit,
  getReferralCandidate,
  getLeadAttributionContext,
  getOrCreateSessionId,
  getStoredReferral,
  getStoredSessionId,
  normalizeReferralCode,
  persistSessionId,
  persistReferralCode,
  shouldTrackReferralLanding,
  updateStoredReferralTouch,
} from "@/lib/referral";

const trackVisitMock = vi.fn();
const logFunnelEventMock = vi.fn();
const flushPendingFunnelEventsMock = vi.fn();

vi.mock("@/lib/api", () => ({
  trackVisit: (...args: unknown[]) => trackVisitMock(...args),
}));

vi.mock("@/lib/funnel-events", () => ({
  logFunnelEvent: (...args: unknown[]) => logFunnelEventMock(...args),
  flushPendingFunnelEvents: (...args: unknown[]) => flushPendingFunnelEventsMock(...args),
}));

describe("referral utilities", () => {
  beforeEach(() => {
    trackVisitMock.mockReset();
    logFunnelEventMock.mockReset();
    flushPendingFunnelEventsMock.mockReset();
    logFunnelEventMock.mockResolvedValue({ ok: true, event_id: "event-1" });
    flushPendingFunnelEventsMock.mockResolvedValue(undefined);
    window.localStorage.clear();
    window.sessionStorage.clear();
    document.cookie = "omega_referral_code=; path=/; max-age=0";
    document.cookie = "omega_session_id=; path=/; max-age=0";
  });

  it("normalizes referral codes safely", () => {
    expect(normalizeReferralCode(" elin-2026 ")).toBe("ELIN-2026");
    expect(normalizeReferralCode("elin<script>")).toBe("ELINSCRIPT");
    expect(normalizeReferralCode("")).toBeNull();
  });

  it("reads referral code from query string before path slug", () => {
    expect(getReferralCandidate("/sv", "?ref=elin2026")).toBe("ELIN2026");
    expect(getReferralCandidate("/ELIN2026", "?ref=saga444")).toBe("SAGA444");
  });

  it("ignores reserved app routes and language paths", () => {
    expect(getReferralCandidate("/partners", "")).toBeNull();
    expect(getReferralCandidate("/dashboard/login", "")).toBeNull();
    expect(getReferralCandidate("/sv/partners", "")).toBeNull();
    expect(getReferralCandidate("/kontakt", "")).toBeNull();
  });

  it("treats unknown top-level slugs as referral codes", () => {
    expect(getReferralCandidate("/ELIN2026", "")).toBe("ELIN2026");
    expect(getReferralCandidate("/mikael88", "")).toBe("MIKAEL88");
  });

  it("persists and reads stored referral context", () => {
    vi.stubGlobal("location", new URL("https://example.com/sv"));

    persistReferralCode("ELIN2026", "/sv", "?utm_source=instagram&utm_medium=social&utm_campaign=spring");

    expect(getStoredReferral()).toMatchObject({
      referralCode: "ELIN2026",
      landingPage: "/sv",
      firstTouch: {
        landingPage: "/sv",
        utmSource: "instagram",
        utmMedium: "social",
        utmCampaign: "spring",
      },
    });
  });

  it("reuses a persistent session id", () => {
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();

    expect(first).toBeTruthy();
    expect(second).toBe(first);
    expect(getStoredSessionId()).toBe(first);
  });

  it("tracks only referral-aware landing pages", () => {
    expect(shouldTrackReferralLanding("/")).toBe(true);
    expect(shouldTrackReferralLanding("/sv")).toBe(true);
    expect(shouldTrackReferralLanding("/sv/omega-balance")).toBe(true);
    expect(shouldTrackReferralLanding("/sv/gut-balance")).toBe(true);
    expect(shouldTrackReferralLanding("/sv/partners")).toBe(true);
    expect(shouldTrackReferralLanding("/partners")).toBe(true);
    expect(shouldTrackReferralLanding("/dashboard/login")).toBe(false);
    expect(shouldTrackReferralLanding("/kontakt")).toBe(false);
  });

  it("sends the full visit payload when tracking a referral landing", async () => {
    persistSessionId("session-123");
    persistReferralCode("ELIN2026", "/sv");

    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://referrer.example/path",
    });

    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "OmegaTestAgent/1.0",
    });

    await captureReferralVisit("/sv", "?ref=elin2026&utm_source=instagram&utm_medium=social&utm_campaign=spring");

    expect(trackVisitMock).toHaveBeenCalledTimes(1);
    expect(logFunnelEventMock).toHaveBeenCalledWith(
      "landing_viewed",
      expect.objectContaining({
        referralCode: "ELIN2026",
        sessionId: "session-123",
        pathname: "/sv",
      }),
    );
    expect(trackVisitMock).toHaveBeenCalledWith({
      ref: "ELIN2026",
      session_id: "session-123",
      landing_page: "/sv",
      referrer: "https://referrer.example/path",
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "spring",
      user_agent: "OmegaTestAgent/1.0",
    });
  });

  it("does not track the same referral landing twice in the same session", async () => {
    persistSessionId("session-123");

    await captureReferralVisit("/sv", "?ref=elin2026&utm_source=instagram");
    await captureReferralVisit("/sv", "?ref=elin2026&utm_source=instagram");

    expect(trackVisitMock).toHaveBeenCalledTimes(1);
  });

  it("tracks public page visits even without a referral code", async () => {
    persistSessionId("session-123");

    await captureReferralVisit("/sv/omega-balance", "?utm_source=google&utm_medium=organic");

    expect(trackVisitMock).toHaveBeenCalledWith(expect.objectContaining({
      ref: null,
      session_id: "session-123",
      landing_page: "/sv/omega-balance",
      utm_source: "google",
      utm_medium: "organic",
      utm_campaign: null,
      user_agent: navigator.userAgent || null,
    }));
  });

  it("builds lead attribution with first-touch and last-touch context", async () => {
    persistSessionId("session-123");
    persistReferralCode("ELIN2026", "/sv", "?utm_source=instagram&utm_medium=social&utm_campaign=spring");

    const attribution = await getLeadAttributionContext("/sv/partners", "?utm_source=email&utm_medium=crm&utm_campaign=followup");

    expect(attribution).toMatchObject({
      sessionId: "session-123",
      referralCode: "ELIN2026",
      landingPage: "/sv",
      firstTouch: {
        landingPage: "/sv",
        utmSource: "instagram",
        utmMedium: "social",
        utmCampaign: "spring",
      },
      lastTouch: {
        landingPage: "/sv/partners",
        utmSource: "email",
        utmMedium: "crm",
        utmCampaign: "followup",
      },
    });
  });

  it("updates stored last-touch across multi-step navigation without losing original utm context", async () => {
    persistSessionId("session-123");
    persistReferralCode("ELIN2026", "/sv", "?utm_source=instagram&utm_medium=social&utm_campaign=spring");

    updateStoredReferralTouch("/sv/kontakt", "");

    const stored = getStoredReferral();
    expect(stored).toMatchObject({
      referralCode: "ELIN2026",
      landingPage: "/sv",
      firstTouch: {
        landingPage: "/sv",
        utmSource: "instagram",
        utmMedium: "social",
        utmCampaign: "spring",
      },
      lastTouch: {
        landingPage: "/sv/kontakt",
        utmSource: "instagram",
        utmMedium: "social",
        utmCampaign: "spring",
      },
    });

    const attribution = await getLeadAttributionContext("/sv/kontakt", "");
    expect(attribution.lastTouch).toMatchObject({
      landingPage: "/sv/kontakt",
      utmSource: "instagram",
      utmMedium: "social",
      utmCampaign: "spring",
    });
  });
});
