import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { trackFunnelEvent as postFunnelEvent } from "@/lib/api";
import { defaultLang, isSupportedLang } from "@/lib/i18n";
import type { FunnelEventName, TrackFunnelEventRequest } from "@/lib/omega-types";

const PENDING_FUNNEL_EVENTS_KEY = "omega:pending-funnel-events";
const MAX_PENDING_FUNNEL_EVENTS = 25;
const RESERVED_SEGMENTS = new Set(["integritet", "villkor", "kontakt", "dashboard", "partners"]);
const REFERRAL_STORAGE_KEY = "omega:referral-context";
const REFERRAL_COOKIE_KEY = "omega_referral_code";
const SESSION_STORAGE_KEY = "omega:session-id";
const SESSION_COOKIE_KEY = "omega_session_id";

type TrackFunnelEventOptions = {
  pathname?: string;
  search?: string;
  referralCode?: string | null;
  sessionId?: string;
  details?: Record<string, unknown>;
};

let flushPromise: Promise<void> | null = null;

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

function readCookieValue(key: string) {
  if (!canUseBrowserStorage()) {
    return null;
  }

  return (
    document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${key}=`))
      ?.split("=")[1] || null
  );
}

function readStoredSessionId() {
  if (!canUseBrowserStorage()) {
    return null;
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY) || readCookieValue(SESSION_COOKIE_KEY);
}

function persistSessionId(sessionId: string) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  document.cookie = `${SESSION_COOKIE_KEY}=${sessionId}; path=/; max-age=${60 * 60 * 24 * 30}`;
}

function getOrCreateTrackedSessionId() {
  if (!canUseBrowserStorage()) {
    return "server-session";
  }

  const existing = readStoredSessionId();
  if (existing) {
    return existing;
  }

  const next = window.crypto?.randomUUID?.() || `session-${Date.now()}`;
  persistSessionId(next);
  return next;
}

function normalizeReferralCode(value?: string | null) {
  return value?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "") || null;
}

function getStoredReferralCode() {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { referralCode?: string };
      if (parsed?.referralCode) {
        return parsed.referralCode;
      }
    } catch {
      // Ignore malformed storage and fall back to cookie.
    }
  }

  return readCookieValue(REFERRAL_COOKIE_KEY);
}

function getReferralCandidate(pathname: string, search: string) {
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

function getActiveTrackedReferralCode(pathname: string, search: string) {
  return getReferralCandidate(pathname, search) || getStoredReferralCode() || null;
}

function readPendingEvents() {
  if (!canUseBrowserStorage()) {
    return [] as TrackFunnelEventRequest[];
  }

  const raw = window.localStorage.getItem(PENDING_FUNNEL_EVENTS_KEY);
  if (!raw) {
    return [] as TrackFunnelEventRequest[];
  }

  try {
    const parsed = JSON.parse(raw) as TrackFunnelEventRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePendingEvents(events: TrackFunnelEventRequest[]) {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (!events.length) {
    window.localStorage.removeItem(PENDING_FUNNEL_EVENTS_KEY);
    return;
  }

  window.localStorage.setItem(PENDING_FUNNEL_EVENTS_KEY, JSON.stringify(events.slice(-MAX_PENDING_FUNNEL_EVENTS)));
}

function enqueuePendingEvent(payload: TrackFunnelEventRequest) {
  const nextQueue = [...readPendingEvents(), payload];
  writePendingEvents(nextQueue);
}

function buildPayload(name: FunnelEventName, options: TrackFunnelEventOptions = {}): TrackFunnelEventRequest {
  const pathname = options.pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const search = options.search ?? (typeof window !== "undefined" ? window.location.search : "");
  const params = new URLSearchParams(search);

  return {
    name,
    session_id: options.sessionId ?? getOrCreateTrackedSessionId(),
    ref: options.referralCode ?? getActiveTrackedReferralCode(pathname, search),
    page_path: pathname,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent || null : null,
    details: options.details ?? {},
  };
}

export async function flushPendingFunnelEvents() {
  if (!canUseBrowserStorage() || !isSupabaseConfigured) {
    return;
  }

  if (flushPromise) {
    return flushPromise;
  }

  flushPromise = (async () => {
    const queue = readPendingEvents();
    if (!queue.length) {
      return;
    }

    const remaining = [...queue];

    while (remaining.length) {
      const nextEvent = remaining[0];

      try {
        const response = await postFunnelEvent(nextEvent);
        if (!response.ok) {
          break;
        }
        remaining.shift();
      } catch {
        break;
      }
    }

    writePendingEvents(remaining);
  })().finally(() => {
    flushPromise = null;
  });

  return flushPromise;
}

export async function logFunnelEvent(name: FunnelEventName, options: TrackFunnelEventOptions = {}) {
  const payload = buildPayload(name, options);

  if (!isSupabaseConfigured) {
    return { ok: false as const, skipped: true as const };
  }

  try {
    await flushPendingFunnelEvents();
    const response = await postFunnelEvent(payload);

    if (!response.ok) {
      throw new Error("tracking-failed");
    }

    return response;
  } catch {
    enqueuePendingEvent(payload);
    return { ok: false as const, queued: true as const };
  }
}
