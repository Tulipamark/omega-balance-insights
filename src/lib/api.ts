import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type {
  TrackClickRequest,
  TrackClickResponse,
  TrackVisitRequest,
  TrackVisitResponse,
  UpsertLeadRequest,
  UpsertLeadResponse,
} from "@/lib/omega-types";

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

  if (!data) {
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
