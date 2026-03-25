import type { AcceptPortalLegalRequest, AppUser } from "@/lib/omega-types";

export const PORTAL_TERMS_VERSION = "2026-03-25";
export const PORTAL_PRIVACY_VERSION = "2026-03-25";
export const PORTAL_NOTICE_VERSION = "2026-03-25";

export function hasAcceptedPortalLegal(user: AppUser | null | undefined) {
  if (!user) {
    return false;
  }

  return Boolean(
    user.accepted_terms_at &&
      user.accepted_privacy_at &&
      user.accepted_portal_notice_at &&
      user.terms_version === PORTAL_TERMS_VERSION &&
      user.privacy_version === PORTAL_PRIVACY_VERSION &&
      user.portal_notice_version === PORTAL_NOTICE_VERSION,
  );
}

export function buildPortalLegalAcceptancePayload(userAgent?: string | null): AcceptPortalLegalRequest {
  const now = new Date().toISOString();

  return {
    accepted_terms_at: now,
    accepted_privacy_at: now,
    accepted_portal_notice_at: now,
    terms_version: PORTAL_TERMS_VERSION,
    privacy_version: PORTAL_PRIVACY_VERSION,
    portal_notice_version: PORTAL_NOTICE_VERSION,
    legal_acceptance_user_agent: userAgent || null,
  };
}
