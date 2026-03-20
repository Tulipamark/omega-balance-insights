import { isSupabaseConfigured } from "@/integrations/supabase/client";

type RedirectType = "test" | "shop" | "partner";
type FailureReason = "partner_not_found" | "partner_not_verified" | "destination_missing" | "invalid_type";

type TrackClickRequest = {
  ref: string;
  type: RedirectType;
  session_id: string;
};

type TrackClickResponse = {
  ok: boolean;
  destination_url?: string;
  reason?: FailureReason;
};

type TrackVisitRequest = {
  ref: string;
  session_id: string;
  landing_page: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  user_agent: string | null;
};

type TrackVisitResponse = {
  ok: boolean;
  partnerFound: boolean;
  verified: boolean;
};

type LeadFailureReason = "invalid_email" | "partner_not_found" | "partner_not_verified";

type UpsertLeadRequest = {
  email: string;
  full_name: string;
  phone?: string | null;
  ref?: string | null;
  session_id?: string | null;
  lead_type: "customer" | "partner";
  lead_source: "email_gate" | "customer_form" | "partner_form";
  source_page?: string | null;
  details?: Record<string, unknown>;
};

type UpsertLeadResponse = {
  ok: boolean;
  mode?: "created" | "updated" | "ignored";
  lead_id?: string;
  reason?: LeadFailureReason;
};

function getSupabaseFunctionHeaders() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  return {
    supabaseUrl,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
  };
}

export async function trackClickAndGetRedirect(payload: TrackClickRequest): Promise<TrackClickResponse> {
  const { supabaseUrl, headers } = getSupabaseFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/track-click-and-redirect`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as TrackClickResponse | null;

  if (!response.ok || !data) {
    throw new Error("Could not resolve redirect right now.");
  }

  return data;
}

export async function trackVisit(payload: TrackVisitRequest): Promise<TrackVisitResponse> {
  const { supabaseUrl, headers } = getSupabaseFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/track-visit`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as TrackVisitResponse | null;

  if (!response.ok || !data) {
    throw new Error("Could not track referral visit right now.");
  }

  return data;
}

export async function upsertLead(payload: UpsertLeadRequest): Promise<UpsertLeadResponse> {
  const { supabaseUrl, headers } = getSupabaseFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/upsert-lead`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as UpsertLeadResponse | null;

  if (!response.ok || !data) {
    throw new Error("Could not save lead right now.");
  }

  return data;
}
