import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureReferralVisit,
  getReferralCandidate,
  getOrCreateSessionId,
  getStoredReferral,
  getStoredSessionId,
  normalizeReferralCode,
  persistSessionId,
  persistReferralCode,
  shouldTrackReferralLanding,
} from "@/lib/referral";

const trackVisitMock = vi.fn();

vi.mock("@/lib/api", () => ({
  trackVisit: (...args: unknown[]) => trackVisitMock(...args),
}));

describe("referral utilities", () => {
  beforeEach(() => {
    trackVisitMock.mockReset();
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

    persistReferralCode("ELIN2026", "/sv");

    expect(getStoredReferral()).toMatchObject({
      referralCode: "ELIN2026",
      landingPage: "/sv",
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
});
