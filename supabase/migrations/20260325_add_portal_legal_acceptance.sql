alter table public.users
  add column if not exists accepted_terms_at timestamptz,
  add column if not exists accepted_privacy_at timestamptz,
  add column if not exists accepted_portal_notice_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists privacy_version text,
  add column if not exists portal_notice_version text,
  add column if not exists legal_acceptance_user_agent text;
