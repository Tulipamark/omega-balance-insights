import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  confirmTitle?: string;
  confirmDescription?: string;
  confirmConfirmLabel?: string;
  confirmCancelLabel?: string;
};

const reasonCopy: Record<string, string> = {
  partner_not_found: "Ingen giltig partnerl\u00e4nk hittades f\u00f6r den h\u00e4r h\u00e4nvisningen.",
  partner_not_verified: "Partnern \u00e4r inte verifierad \u00e4nnu.",
  destination_missing: "M\u00e5let f\u00f6r den h\u00e4r l\u00e4nken \u00e4r inte klart \u00e4nnu.",
  consultation_url_missing: "Partnern saknar en konsultationsl\u00e4nk just nu.",
  invalid_type: "L\u00e4nken kunde inte tolkas korrekt.",
};

const fallbackEligibleErrors = new Set([
  "partner_not_found",
  "partner_not_verified",
  "destination_missing",
]);

const genericErrorCopy = "L\u00e4nken kunde inte \u00f6ppnas just nu.";

const TrackedOutboundButton = ({
  destinationType,
  fallbackHref,
  className,
  children,
  pendingLabel = "\u00d6ppnar...",
  trackingEventName,
  trackingDetails,
  errorMessages,
  confirmTitle,
  confirmDescription,
  confirmConfirmLabel = "OK",
  confirmCancelLabel = "Avbryt",
}: TrackedOutboundButtonProps) => {
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleButtonClick = () => {
    if (pending) {
      return;
    }

    if (confirmTitle || confirmDescription) {
      setConfirmOpen(true);
      return;
    }

    void handleClick();
  };

  return (
    <div>
      <button type="button" onClick={handleButtonClick} disabled={pending} className={`${className} disabled:opacity-70`}>
        {pending ? pendingLabel : children}
      </button>
      {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-md rounded-[1.5rem]">
          <AlertDialogHeader>
            {confirmTitle ? <AlertDialogTitle>{confirmTitle}</AlertDialogTitle> : null}
            {confirmDescription ? <AlertDialogDescription>{confirmDescription}</AlertDialogDescription> : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{confirmCancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                setConfirmOpen(false);
                void handleClick();
              }}
            >
              {pending ? pendingLabel : confirmConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrackedOutboundButton;
