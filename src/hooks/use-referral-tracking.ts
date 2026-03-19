import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureReferralVisit } from "@/lib/referral";

export function useReferralTracking() {
  const location = useLocation();

  useEffect(() => {
    void captureReferralVisit(location.pathname, location.search);
  }, [location.pathname, location.search]);
}
