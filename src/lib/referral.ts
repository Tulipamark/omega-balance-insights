import { defaultLang, isSupportedLang } from "@/lib/i18n";
import { createReferralVisit, resolveUserByReferralCode } from "@/lib/omega-data";
import { ReferralAttribution } from "@/lib/omega-types";

const REFERRAL_STORAGE_KEY = "omega:referral-context";
const REFERRAL_COOKIE_KEY = "omega_referral_code";
const VISITOR_STORAGE_KEY = "omega:visitor-id";
const VISIT_CACHE_KEY = "omega:last-visit";
const RESERVED_SEGMENTS = new Set(["integritet", "villkor", "kontakt", "dashboard"]);

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

export function getOrCreateVisitorId() {
  if (typeof window === "undefined") {
    return "server";
  }

  const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next = window.crypto?.randomUUID?.() || `visitor-${Date.now()}`;
  window.localStorage.setItem(VISITOR_STORAGE_KEY, next);
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

export async function captureReferralVisit(pathname: string, search: string) {
  if (typeof window === "undefined") {
    return;
  }

  const referralCode = getReferralCandidate(pathname, search) || getStoredReferral()?.referralCode;
  if (!referralCode) {
    return;
  }

  persistReferralCode(referralCode, pathname);

  const cacheKey = `${referralCode}:${pathname}:${search}`;
  if (window.sessionStorage.getItem(VISIT_CACHE_KEY) === cacheKey) {
    return;
  }

  const params = new URLSearchParams(search);
  await createReferralVisit({
    referral_code: referralCode,
    landing_page: pathname,
    visitor_id: getOrCreateVisitorId(),
    utm_source: params.get("utm_source"),
    utm_campaign: params.get("utm_campaign"),
  });

  window.sessionStorage.setItem(VISIT_CACHE_KEY, cacheKey);
}
