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
import type { Lang } from "@/lib/i18n";
import { trackClickAndGetRedirect } from "@/lib/api";
import { logFunnelEvent } from "@/lib/funnel-events";
import type { FunnelEventName, RedirectType } from "@/lib/omega-types";
import { getActiveReferralCode, getOrCreateSessionId } from "@/lib/referral";

type TrackedOutboundButtonProps = {
  lang?: Lang;
  destinationType: RedirectType;
  fallbackHref: string;
  preferFallbackHref?: boolean;
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

const confirmCopyByLang: Record<Lang, { title: string; description: string; confirmLabel: string; cancelLabel: string }> = {
  sv: {
    title: "Du går nu vidare till Zinzino",
    description: "Nästa steg sker hos Zinzino, där beställning och leverans hanteras.",
    confirmLabel: "OK, gå vidare",
    cancelLabel: "Stanna kvar",
  },
  no: {
    title: "Du går nå videre til Zinzino",
    description: "Neste steg skjer hos Zinzino, der bestilling og levering håndteres.",
    confirmLabel: "OK, gå videre",
    cancelLabel: "Bli her",
  },
  da: {
    title: "Du går nu videre til Zinzino",
    description: "Næste trin sker hos Zinzino, hvor bestilling og levering håndteres.",
    confirmLabel: "OK, gå videre",
    cancelLabel: "Bliv her",
  },
  fi: {
    title: "Siirryt nyt Zinzinoon",
    description: "Seuraava vaihe tapahtuu Zinzino-palvelussa, jossa tilaus ja toimitus hoidetaan.",
    confirmLabel: "OK, jatka",
    cancelLabel: "Pysy täällä",
  },
  en: {
    title: "You are now continuing to Zinzino",
    description: "The next step takes place at Zinzino, where ordering and delivery are handled.",
    confirmLabel: "OK, continue",
    cancelLabel: "Stay here",
  },
  de: {
    title: "Du gehst jetzt weiter zu Zinzino",
    description: "Der nächste Schritt findet bei Zinzino statt, wo Bestellung und Lieferung abgewickelt werden.",
    confirmLabel: "OK, weiter",
    cancelLabel: "Hier bleiben",
  },
  fr: {
    title: "Vous allez maintenant vers Zinzino",
    description: "La prochaine étape se déroule chez Zinzino, où la commande et la livraison sont gérées.",
    confirmLabel: "OK, continuer",
    cancelLabel: "Rester ici",
  },
  it: {
    title: "Stai per proseguire verso Zinzino",
    description: "Il passaggio successivo avviene su Zinzino, dove vengono gestiti ordine e consegna.",
    confirmLabel: "OK, continua",
    cancelLabel: "Resta qui",
  },
  ar: {
    title: "ستنتقل الآن إلى Zinzino",
    description: "تتم الخطوة التالية لدى Zinzino، حيث يتم التعامل مع الطلب والتوصيل.",
    confirmLabel: "حسنا، تابع",
    cancelLabel: "البقاء هنا",
  },
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

function isTestDestination(destinationType: RedirectType) {
  return destinationType === "test" || destinationType === "gut_test";
}

const TrackedOutboundButton = ({
  lang,
  destinationType,
  fallbackHref,
  preferFallbackHref = false,
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
  const localizedConfirmCopy = lang ? confirmCopyByLang[lang] : null;
  const effectiveConfirmTitle = confirmTitle ?? (isTestDestination(destinationType) ? localizedConfirmCopy?.title : undefined);
  const effectiveConfirmDescription = confirmDescription ?? (isTestDestination(destinationType) ? localizedConfirmCopy?.description : undefined);
  const effectiveConfirmLabel = confirmConfirmLabel === "OK" && localizedConfirmCopy ? localizedConfirmCopy.confirmLabel : confirmConfirmLabel;
  const effectiveCancelLabel = confirmCancelLabel === "Avbryt" && localizedConfirmCopy ? localizedConfirmCopy.cancelLabel : confirmCancelLabel;

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

    if (preferFallbackHref) {
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

    if (effectiveConfirmTitle || effectiveConfirmDescription) {
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
            {effectiveConfirmTitle ? <AlertDialogTitle>{effectiveConfirmTitle}</AlertDialogTitle> : null}
            {effectiveConfirmDescription ? <AlertDialogDescription>{effectiveConfirmDescription}</AlertDialogDescription> : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{effectiveCancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                setConfirmOpen(false);
                void handleClick();
              }}
            >
              {pending ? pendingLabel : effectiveConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrackedOutboundButton;
