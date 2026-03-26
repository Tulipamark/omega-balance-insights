import { useState } from "react";
import { useLocation } from "react-router-dom";
import { trackClickAndGetRedirect } from "@/lib/api";
import { logFunnelEvent } from "@/lib/funnel-events";
import type { FunnelEventName } from "@/lib/omega-types";
import { getActiveReferralCode, getOrCreateSessionId } from "@/lib/referral";

type TrackedOutboundButtonProps = {
  destinationType: "test" | "shop" | "partner" | "consultation";
  fallbackHref: string;
  className: string;
  children: React.ReactNode;
  pendingLabel?: string;
  trackingEventName?: FunnelEventName;
  trackingDetails?: Record<string, unknown>;
  errorMessages?: Partial<Record<keyof typeof reasonCopy, string>> & { generic?: string };
};

const reasonCopy: Record<string, string> = {
  partner_not_found: "Ingen giltig partnerlänk hittades för den här hänvisningen.",
  partner_not_verified: "Partnern är inte verifierad ännu.",
  destination_missing: "Målet för den här länken är inte klart ännu.",
  consultation_url_missing: "Partnern saknar en konsultationslänk just nu.",
  invalid_type: "Länken kunde inte tolkas korrekt.",
};

const fallbackEligibleErrors = new Set([
  "partner_not_found",
  "partner_not_verified",
  "destination_missing",
]);

const genericErrorCopy = "Länken kunde inte öppnas just nu.";

const TrackedOutboundButton = ({
  destinationType,
  fallbackHref,
  className,
  children,
  pendingLabel = "Öppnar...",
  trackingEventName,
  trackingDetails,
  errorMessages,
}: TrackedOutboundButtonProps) => {
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async () => {
    if (pending) {
      return;
    }

    setErrorMessage(null);

    const referralCode = getActiveReferralCode(location.pathname, location.search);
    const sessionId = getOrCreateSessionId();

    if (trackingEventName) {
      void logFunnelEvent(trackingEventName, {
        pathname: location.pathname,
        search: location.search,
        referralCode,
        sessionId,
        details: {
          destinationType,
          ...trackingDetails,
        },
      });
    }

    if (!referralCode) {
      window.location.assign(fallbackHref);
      return;
    }

    setPending(true);

    try {
      const result = await trackClickAndGetRedirect({
        ref: referralCode,
        type: destinationType,
        session_id: sessionId,
      });

      if (result.ok) {
        window.location.assign(result.destination_url);
        return;
      }

      const failResult = result as Extract<typeof result, { ok: false }>;
      const reason = failResult.error?.code || failResult.reason || "destination_missing";

      if (fallbackEligibleErrors.has(reason)) {
        window.location.assign(fallbackHref);
        return;
      }

      setErrorMessage(errorMessages?.[reason] || reasonCopy[reason] || errorMessages?.generic || genericErrorCopy);
    } catch (error) {
      console.error("Outbound redirect failed", error);
      setErrorMessage(errorMessages?.generic || genericErrorCopy);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={() => void handleClick()} disabled={pending} className={`${className} disabled:opacity-70`}>
        {pending ? pendingLabel : children}
      </button>
      {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  );
};

export default TrackedOutboundButton;
