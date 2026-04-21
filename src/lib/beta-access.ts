const BETA_ACCESS_STORAGE_KEY = "insidebalance.beta_access_granted";
const DEFAULT_BETA_ACCESS_CODE = "INSIDE-2026";

function getConfiguredAccessCode() {
  return import.meta.env.VITE_BETA_ACCESS_CODE?.trim() || DEFAULT_BETA_ACCESS_CODE;
}

export function getBetaAccessCodeHint() {
  const configured = getConfiguredAccessCode();

  if (configured.length !== 9 || !configured.includes("-")) {
    return "XXXX-XXXX";
  }

  return configured.replace(/[A-Z0-9]/g, "X");
}

export function isBetaAccessGranted() {
  if (typeof window === "undefined") {
    return false;
  }

  window.localStorage.removeItem(BETA_ACCESS_STORAGE_KEY);
  return window.sessionStorage.getItem(BETA_ACCESS_STORAGE_KEY) === "granted";
}

export function grantBetaAccess() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BETA_ACCESS_STORAGE_KEY);
  window.sessionStorage.setItem(BETA_ACCESS_STORAGE_KEY, "granted");
}

export function revokeBetaAccess() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BETA_ACCESS_STORAGE_KEY);
  window.sessionStorage.removeItem(BETA_ACCESS_STORAGE_KEY);
}

export function isValidBetaAccessCode(input: string) {
  const normalizedInput = input.trim().toUpperCase();
  const configuredCode = getConfiguredAccessCode().trim().toUpperCase();

  return normalizedInput.length > 0 && normalizedInput === configuredCode;
}
