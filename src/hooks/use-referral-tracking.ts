import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logFunnelEvent } from "@/lib/funnel-events";
import { captureReferralVisit, getActiveReferralCode, getOrCreateSessionId } from "@/lib/referral";

const PAGE_VIEW_CACHE_KEY = "omega_page_view_cache";
const PAGE_VIEW_DEDUP_WINDOW_MS = 1000 * 30;

function shouldTrackPageView(pathname: string) {
  return !pathname.startsWith("/dashboard") && !pathname.startsWith("/auth/");
}

function shouldLogPageView(pathname: string, search: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const cacheKey = `${pathname}${search}`;
  const now = Date.now();

  try {
    const raw = window.sessionStorage.getItem(PAGE_VIEW_CACHE_KEY);
    if (!raw) {
      window.sessionStorage.setItem(PAGE_VIEW_CACHE_KEY, JSON.stringify({ key: cacheKey, timestamp: now }));
      return true;
    }

    const parsed = JSON.parse(raw) as { key?: string; timestamp?: number };
    if (parsed.key === cacheKey && typeof parsed.timestamp === "number" && now - parsed.timestamp < PAGE_VIEW_DEDUP_WINDOW_MS) {
      return false;
    }
  } catch {
    // Ignore malformed cache and overwrite below.
  }

  window.sessionStorage.setItem(PAGE_VIEW_CACHE_KEY, JSON.stringify({ key: cacheKey, timestamp: now }));
  return true;
}

export function useReferralTracking() {
  const location = useLocation();

  useEffect(() => {
    void captureReferralVisit(location.pathname, location.search);

    if (!shouldTrackPageView(location.pathname) || !shouldLogPageView(location.pathname, location.search)) {
      return;
    }

    void logFunnelEvent("page_viewed", {
      pathname: location.pathname,
      search: location.search,
      referralCode: getActiveReferralCode(location.pathname, location.search),
      sessionId: getOrCreateSessionId(),
      details: {
        pageType: location.pathname.includes("/partners") ? "partner" : "customer",
      },
    });
  }, [location.pathname, location.search]);
}
