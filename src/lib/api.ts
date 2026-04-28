import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type {
  LeadFailureReason,
  OnboardPartnerFromLeadRequest,
  OnboardPartnerFromLeadResponse,
  UpdatePartnerLeadReviewRequest,
  UpdatePartnerLeadReviewResponse,
  TrackClickRequest,
  TrackClickResponse,
  TrackFunnelEventRequest,
  TrackFunnelEventResponse,
  TrackVisitRequest,
  TrackVisitResponse,
  UpsertLeadRequest,
  UpsertLeadResponse,
} from "@/lib/omega-types";

function getLeadErrorMessage(reason?: LeadFailureReason) {
  switch (reason) {
    case "partner_not_found":
      return "Referral-koden kunde inte kopplas till n\u00e5gon partner.";
    case "partner_not_verified":
      return "Den h\u00e4r partnern \u00e4r \u00e4nnu inte verifierad f\u00f6r detta fl\u00f6det.";
    case "invalid_email":
      return "Vi kunde inte spara uppgifterna. Kontrollera e-postadressen och f\u00f6rs\u00f6k igen.";
    default:
      return "Vi kunde inte spara uppgifterna just nu.";
  }
}

function getFallbackLeadErrorMessage(response: Response, payload: unknown) {
  if (payload && typeof payload === "object") {
    const candidate = payload as { error?: unknown; message?: unknown; code?: unknown };

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }

    if (typeof candidate.code === "string" && candidate.code.trim()) {
      return `Lead-save misslyckades: ${candidate.code}`;
    }
  }

  return `Vi kunde inte spara uppgifterna just nu (${response.status}).`;
}

function getBaseFunctionConfig() {
  if (!isSupabaseConfigured) {
    throw new Error("Systemet \u00e4r inte konfigurerat \u00e4nnu.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  return { supabaseUrl, supabaseAnonKey };
}

async function getPublicFunctionHeaders() {
  const { supabaseUrl, supabaseAnonKey } = getBaseFunctionConfig();

  return {
    supabaseUrl,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
  };
}

async function getProtectedFunctionHeaders() {
  const { supabaseUrl, supabaseAnonKey } = getBaseFunctionConfig();
  const session = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const accessToken = session.data.session?.access_token;

  if (!accessToken) {
    throw new Error("Du m\u00e5ste vara inloggad f\u00f6r att g\u00f6ra detta.");
  }

  return {
    supabaseUrl,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function readFunctionErrorContext(error: unknown) {
  const context = (error as { context?: unknown })?.context;

  if (!context) {
    return null;
  }

  if (context instanceof Response) {
    return context.text().catch(() => null);
  }

  if (typeof context === "object") {
    const candidate = context as {
      text?: unknown;
      json?: unknown;
      error?: unknown;
      message?: unknown;
    };

    if (typeof candidate.text === "function") {
      return (candidate.text as () => Promise<string> | string)();
    }

    if (typeof candidate.json === "function") {
      const parsed = await (candidate.json as () => Promise<unknown> | unknown)();
      if (parsed && typeof parsed === "object") {
        const payload = parsed as { error?: unknown; message?: unknown };
        return getStringValue(payload.error) || getStringValue(payload.message);
      }
    }

    return getStringValue(candidate.error) || getStringValue(candidate.message);
  }

  return getStringValue(context);
}

async function getFunctionErrorMessage(error: unknown, fallback: string) {
  const raw = await readFunctionErrorContext(error).catch(() => null);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { error?: unknown; message?: unknown };
      const detailedMessage = getStringValue(parsed.error) || getStringValue(parsed.message);

      if (detailedMessage) {
        return detailedMessage;
      }
    } catch {
      return raw.trim();
    }
  }

  return getStringValue((error as { message?: unknown })?.message) || fallback;
}

export async function trackClickAndGetRedirect(payload: TrackClickRequest): Promise<TrackClickResponse> {
  const { supabaseUrl, headers } = await getPublicFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/track-click-and-redirect`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as TrackClickResponse | null;

  if (!data) {
    throw new Error("Vi kunde inte \u00f6ppna r\u00e4tt l\u00e4nk just nu.");
  }

  return data;
}

export async function trackVisit(payload: TrackVisitRequest): Promise<TrackVisitResponse> {
  const { supabaseUrl, headers } = await getPublicFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/track-visit`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as TrackVisitResponse | null;

  if (!response.ok || !data) {
    throw new Error("Vi kunde inte registrera bes\u00f6ket just nu.");
  }

  return data;
}

export async function trackFunnelEvent(payload: TrackFunnelEventRequest): Promise<TrackFunnelEventResponse> {
  const { supabaseUrl, headers } = await getPublicFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/track-funnel-event`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as TrackFunnelEventResponse | null;

  if (!response.ok || !data) {
    throw new Error("Vi kunde inte registrera h\u00e4ndelsen just nu.");
  }

  return data;
}

export async function upsertLead(payload: UpsertLeadRequest): Promise<UpsertLeadResponse> {
  const { supabaseUrl, headers } = await getPublicFunctionHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/upsert-lead`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const rawText = await response.text().catch(() => "");
  let data: UpsertLeadResponse | null = null;

  try {
    data = rawText ? (JSON.parse(rawText) as UpsertLeadResponse) : null;
  } catch {
    data = null;
  }

  if (!data) {
    throw new Error(
      response.ok
        ? "Vi fick inget giltigt svar n\u00e4r vi f\u00f6rs\u00f6kte spara uppgifterna."
        : `Vi kunde inte spara uppgifterna just nu (${response.status}).`,
    );
  }

  if (!response.ok || !data.ok) {
    throw new Error(data.reason ? getLeadErrorMessage(data.reason) : getFallbackLeadErrorMessage(response, data));
  }

  return data;
}

export async function onboardPartnerFromLead(
  payload: OnboardPartnerFromLeadRequest,
): Promise<OnboardPartnerFromLeadResponse> {
  if (!supabase) {
    throw new Error("Systemet \u00e4r inte konfigurerat \u00e4nnu.");
  }

  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  let accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    const {
      data: refreshedSessionData,
      error: refreshError,
    } = await supabase.auth.refreshSession();

    if (refreshError) {
      throw new Error(refreshError.message);
    }

    accessToken = refreshedSessionData.session?.access_token;
  }

  if (!accessToken) {
    throw new Error("Du m\u00e5ste vara inloggad f\u00f6r att skapa partnerkonto.");
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke<OnboardPartnerFromLeadResponse>("onboard-partner-from-lead", {
    body: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error, "Kunde inte skapa teammedlem just nu."));
  }

  if (!data?.ok) {
    throw new Error(data?.error?.trim() || "Kunde inte skapa teammedlem just nu.");
  }

  return data;
}

export async function updatePartnerLeadReview(
  payload: UpdatePartnerLeadReviewRequest,
): Promise<UpdatePartnerLeadReviewResponse> {
  if (!supabase) {
    throw new Error("Systemet \u00e4r inte konfigurerat \u00e4nnu.");
  }

  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  let accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    const {
      data: refreshedSessionData,
      error: refreshError,
    } = await supabase.auth.refreshSession();

    if (refreshError) {
      throw new Error(refreshError.message);
    }

    accessToken = refreshedSessionData.session?.access_token;
  }

  if (!accessToken) {
    throw new Error("Du m\u00e5ste vara inloggad f\u00f6r att g\u00f6ra detta.");
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke<UpdatePartnerLeadReviewResponse>("update-partner-lead-review", {
    body: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error, "Kunde inte uppdatera granskningen just nu."));
  }

  if (!data?.ok) {
    throw new Error(data?.error?.trim() || "Kunde inte uppdatera granskningen just nu.");
  }

  return data;
}
