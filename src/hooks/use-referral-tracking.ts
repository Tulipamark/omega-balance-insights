import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logFunnelEvent } from "@/lib/funnel-events";
import { captureReferralVisit, getActiveReferralCode, getOrCreateSessionId } from "@/lib/referral";

function shouldTrackPageView(pathname: string) {
  return !pathname.startsWith("/dashboard") && !pathname.startsWith("/auth/");
}

export function useReferralTracking() {
  const location = useLocation();

  useEffect(() => {
    void captureReferralVisit(location.pathname, location.search);

    if (!shouldTrackPageView(location.pathname)) {
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
