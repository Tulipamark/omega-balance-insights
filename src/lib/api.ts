import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import type {
  OnboardPartnerFromLeadRequest,
  OnboardPartnerFromLeadResponse,
  TrackClickRequest,
  TrackClickResponse,
  TrackVisitRequest,
  TrackVisitResponse,
  UpsertLeadRequest,
  UpsertLeadResponse,
} from "@/lib/omega-types";

async function getSupabaseFunctionHeaders() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const session = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const accessToken = session.data.session?.access_token;

  return {
    supabaseUrl,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  };
}

export async function trackClickAndGetRedirect(payload: TrackClickRequest): Promise<TrackClickResponse> {
  const { supabaseUrl, headers } = await getSupabaseFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/track-click-and-redirect`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as TrackClickResponse | null;

  if (!data) {
    throw new Error("Could not resolve redirect right now.");
  }

  return data;
}

export async function trackVisit(payload: TrackVisitRequest): Promise<TrackVisitResponse> {
  const { supabaseUrl, headers } = await getSupabaseFunctionHeaders();

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
  const { supabaseUrl, headers } = await getSupabaseFunctionHeaders();

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

export async function onboardPartnerFromLead(payload: OnboardPartnerFromLeadRequest): Promise<OnboardPartnerFromLeadResponse> {
  const { supabaseUrl, headers } = await getSupabaseFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/onboard-partner-from-lead`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as OnboardPartnerFromLeadResponse | null;

  if (!response.ok || !data) {
    throw new Error("Could not onboard partner right now.");
  }

  return data;
}
