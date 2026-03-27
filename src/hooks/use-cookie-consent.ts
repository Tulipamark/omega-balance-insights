import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "omega_cookie_consent";

export type CookieConsentStatus = "accepted" | "declined" | "pending";

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

function readStoredConsent(): CookieConsentStatus {
  if (!canUseBrowserStorage()) {
    return "pending";
  }

  const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (raw === "accepted" || raw === "declined") {
    return raw;
  }

  return "pending";
}

export function useCookieConsent() {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>("pending");

  useEffect(() => {
    setConsentStatus(readStoredConsent());
  }, []);

  const setConsent = (next: Exclude<CookieConsentStatus, "pending">) => {
    if (canUseBrowserStorage()) {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, next);
    }

    setConsentStatus(next);
  };

  return {
    consentStatus,
    hasAcceptedOptionalTracking: consentStatus === "accepted",
    acceptOptionalTracking: () => setConsent("accepted"),
    declineOptionalTracking: () => setConsent("declined"),
  };
}
