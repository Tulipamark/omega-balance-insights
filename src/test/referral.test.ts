import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getReferralCandidate,
  getOrCreateSessionId,
  getStoredReferral,
  getStoredSessionId,
  normalizeReferralCode,
  persistReferralCode,
  shouldTrackReferralLanding,
} from "@/lib/referral";

describe("referral utilities", () => {
  beforeEach(() => {
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
});
