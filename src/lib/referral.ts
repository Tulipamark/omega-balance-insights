import { defaultLang, isSupportedLang } from "@/lib/i18n";
import { logFunnelEvent, flushPendingFunnelEvents } from "@/lib/funnel-events";
import { resolveUserByReferralCode } from "@/lib/omega-data";
import { trackVisit } from "@/lib/api";
import type { ReferralAttribution, TrackVisitRequest } from "@/lib/omega-types";

const REFERRAL_STORAGE_KEY = "omega:referral-context";
const REFERRAL_COOKIE_KEY = "omega_referral_code";
const SESSION_STORAGE_KEY = "omega:session-id";
const SESSION_COOKIE_KEY = "omega_session_id";
const VISIT_CACHE_KEY = "omega:last-visit";
const RESERVED_SEGMENTS = new Set(["integritet", "villkor", "kontakt", "dashboard", "partners"]);

type StoredReferral = {
  referralCode: string;
  landingPage: string;
  capturedAt: string;
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function normalizeReferralCode(value?: string | null) {
  return value?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "") || null;
}

export function getReferralCandidate(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  const queryCode = normalizeReferralCode(params.get("ref"));
  if (queryCode) {
    return queryCode;
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment) {
    return null;
  }

  if (isSupportedLang(firstSegment) || firstSegment === defaultLang || RESERVED_SEGMENTS.has(firstSegment)) {
    return null;
  }

  return normalizeReferralCode(firstSegment);
}

export function persistReferralCode(referralCode: string, landingPage: string) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredReferral = {
    referralCode,
    landingPage,
    capturedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(payload));
  document.cookie = `${REFERRAL_COOKIE_KEY}=${referralCode}; path=/; max-age=${60 * 60 * 24 * 30}`;
}

export function getStoredReferral() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = readJson<StoredReferral>(REFERRAL_STORAGE_KEY);
  if (stored?.referralCode) {
    return stored;
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${REFERRAL_COOKIE_KEY}=`))
    ?.split("=")[1];

  if (!cookieValue) {
    return null;
  }

  return {
    referralCode: cookieValue,
    landingPage: window.location.pathname,
    capturedAt: new Date().toISOString(),
  };
}

export function getActiveReferralCode(pathname: string, search: string) {
  return getReferralCandidate(pathname, search) || getStoredReferral()?.referralCode || null;
}

export function persistSessionId(sessionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  document.cookie = `${SESSION_COOKIE_KEY}=${sessionId}; path=/; max-age=${60 * 60 * 24 * 30}`;
}

export function getStoredSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  return (
    document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${SESSION_COOKIE_KEY}=`))
      ?.split("=")[1] || null
  );
}

export function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = getStoredSessionId();
  if (existing) {
    return existing;
  }

  const next = window.crypto?.randomUUID?.() || `session-${Date.now()}`;
  persistSessionId(next);
  return next;
}

export async function getReferralAttribution(pathname: string): Promise<ReferralAttribution> {
  const stored = getStoredReferral();

  if (!stored?.referralCode) {
    return {
      referralCode: null,
      referredByUserId: null,
      landingPage: pathname,
    };
  }

  const owner = await resolveUserByReferralCode(stored.referralCode);

  return {
    referralCode: stored.referralCode,
    referredByUserId: owner?.id || null,
    landingPage: stored.landingPage || pathname,
  };
}

export function shouldTrackReferralLanding(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return true;
  }

  if (segments.length === 1 && isSupportedLang(segments[0])) {
    return true;
  }

  if (
    segments.length === 2 &&
    isSupportedLang(segments[0]) &&
    segments[1] === "partners"
  ) {
    return true;
  }

  if (segments.length === 1 && segments[0] === "partners") {
    return true;
  }

  return false;
}

export async function captureReferralVisit(pathname: string, search: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (!shouldTrackReferralLanding(pathname)) {
    return;
  }

  const referralCode = getReferralCandidate(pathname, search) || getStoredReferral()?.referralCode;
  if (!referralCode) {
    return;
  }

  persistReferralCode(referralCode, pathname);
  const sessionId = getOrCreateSessionId();

  const cacheKey = `${referralCode}:${pathname}:${search}`;
  if (window.sessionStorage.getItem(VISIT_CACHE_KEY) === cacheKey) {
    return;
  }

  const params = new URLSearchParams(search);
  const payload: TrackVisitRequest = {
    ref: referralCode,
    session_id: sessionId,
    landing_page: pathname,
    referrer: document.referrer || null,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    user_agent: navigator.userAgent || null,
  };

  void flushPendingFunnelEvents();
  await trackVisit(payload);
  void logFunnelEvent("landing_viewed", {
    pathname,
    search,
    referralCode,
    sessionId,
    details: {
      landingType: pathname.includes("/partners") ? "partner" : "customer",
    },
  });

  window.sessionStorage.setItem(VISIT_CACHE_KEY, cacheKey);
}
