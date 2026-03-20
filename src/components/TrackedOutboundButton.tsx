import { useState } from "react";
import { useLocation } from "react-router-dom";
import { getActiveReferralCode, getOrCreateSessionId } from "@/lib/referral";
import { trackClickAndGetRedirect } from "@/lib/api";

type TrackedOutboundButtonProps = {
  destinationType: "test" | "shop" | "partner";
  fallbackHref: string;
  className: string;
  children: React.ReactNode;
  pendingLabel?: string;
  errorMessages?: Partial<Record<keyof typeof reasonCopy, string>> & { generic?: string };
};

const reasonCopy: Record<string, string> = {
  partner_not_found: "Ingen giltig partnerlänk hittades för den här hänvisningen.",
  partner_not_verified: "Partnern är inte verifierad ännu.",
  destination_missing: "Målet för den här länken är inte klart ännu.",
  invalid_type: "Länken kunde inte tolkas korrekt.",
};

const TrackedOutboundButton = ({
  destinationType,
  fallbackHref,
  className,
  children,
  pendingLabel = "Öppnar...",
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
    if (!referralCode) {
      window.location.assign(fallbackHref);
      return;
    }

    setPending(true);

    try {
      const sessionId = getOrCreateSessionId();
      const result = await trackClickAndGetRedirect({
        ref: referralCode,
        type: destinationType,
        session_id: sessionId,
      });

      if (!result.ok || !result.destination_url) {
        const reason = result.reason || "destination_missing";
        setErrorMessage(errorMessages?.[reason] || reasonCopy[reason] || errorMessages?.generic || "Länken kunde inte öppnas just nu.");
        return;
      }

      window.location.assign(result.destination_url);
    } catch (error) {
      console.error("Outbound redirect failed", error);
      setErrorMessage(errorMessages?.generic || "Länken kunde inte öppnas just nu.");
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
