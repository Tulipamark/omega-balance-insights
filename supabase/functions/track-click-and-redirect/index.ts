import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DestinationType = "test" | "shop" | "partner" | "consultation";
type ErrorCode = "missing_referral" | "partner_not_found" | "partner_not_verified" | "destination_missing" | "consultation_url_missing" | "invalid_type";

type RequestBody = {
  ref?: string;
  type?: DestinationType;
  session_id?: string;
};

type PartnerRow = {
  id: string;
  referral_code: string;
  consultation_url?: string | null;
  zinzino_test_url?: string | null;
  zinzino_shop_url?: string | null;
  zinzino_partner_url?: string | null;
  zinzino_consultation_url?: string | null;
  status: "pending" | "verified" | "rejected";
};

type OutboundClickInsertPayload = {
  partner_id: string;
  referral_code: string;
  session_id: string;
  destination_type: DestinationType;
  destination_url: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeReferralCode(value?: string | null) {
  return value?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "") || null;
}

function isSchemaMismatchError(error: unknown) {
  const candidate = error as { code?: string; message?: string; details?: string };
  const message = `${candidate?.code ?? ""} ${candidate?.message ?? ""} ${candidate?.details ?? ""}`.toLowerCase();

  return (
    message.includes("42703") ||
    message.includes("42p01") ||
    (message.includes("column") && message.includes("does not exist")) ||
    (message.includes("relation") && message.includes("does not exist")) ||
    message.includes("could not find the table")
  );
}

async function logOutboundClick(supabase: ReturnType<typeof createClient>, payload: OutboundClickInsertPayload) {
  const insert = await supabase.from("outbound_clicks").insert(payload);

  return insert;
}

function getDestinationUrl(partner: PartnerRow, type: DestinationType) {
  if (type === "test") {
    return partner.zinzino_test_url;
  }

  if (type === "shop") {
    return partner.zinzino_shop_url;
  }

  if (type === "partner") {
    return partner.zinzino_partner_url;
  }

  if (type === "consultation") {
    return partner.consultation_url || partner.zinzino_consultation_url;
  }

  return null;
}

function errorResponse(code: ErrorCode, message: string, status = 400) {
  return jsonResponse({ ok: false, error: { code, message } }, status);
}

function successResponse(destinationUrl: string) {
  return jsonResponse({
    ok: true,
    destination_url: destinationUrl,
  });
}

async function fetchPartnerByReferralCode(supabase: ReturnType<typeof createClient>, referralCode: string) {
  const modernQuery = await supabase
    .from("partners")
    .select("id, referral_code, consultation_url, status")
    .eq("referral_code", referralCode)
    .maybeSingle<PartnerRow>();

  if (!modernQuery.error || !isSchemaMismatchError(modernQuery.error)) {
    return modernQuery;
  }

  return supabase
    .from("partners")
    .select("id, referral_code, zinzino_test_url, zinzino_shop_url, zinzino_partner_url, zinzino_consultation_url, status")
    .eq("referral_code", referralCode)
    .maybeSingle<PartnerRow>();
}

function parseRequest(request: Request) {
  const url = new URL(request.url);

  return request
    .json()
    .catch(() => null)
    .then((body) => {
      const payload = (body ?? {}) as RequestBody;

      return {
        ref: normalizeReferralCode(payload.ref ?? url.searchParams.get("ref")),
        type: (payload.type ?? (url.searchParams.get("type") as DestinationType | null) ?? "consultation") as DestinationType,
        sessionId:
          payload.session_id?.trim() ||
          url.searchParams.get("session_id")?.trim() ||
          crypto.randomUUID(),
      };
    });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return errorResponse("invalid_type", "Only POST is supported.", 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return errorResponse("consultation_url_missing", "Supabase environment is not configured.", 500);
  }

  const { ref: referralCode, type: destinationType, sessionId } = await parseRequest(request);

  if (!destinationType || !["test", "shop", "partner", "consultation"].includes(destinationType)) {
    return errorResponse("invalid_type", "Unsupported destination type.", 400);
  }

  if (!referralCode || !sessionId) {
    return errorResponse("missing_referral", "A referral code is required for routing.", 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: partner, error: partnerError } = await fetchPartnerByReferralCode(supabase, referralCode);

  if (partnerError) {
    console.error("Failed to resolve partner", partnerError);
    return errorResponse("partner_not_found", "No partner was found for this referral code.", 404);
  }

  if (!partner) {
    return errorResponse("partner_not_found", "No partner was found for this referral code.", 404);
  }

  if (partner.status !== "verified") {
    return errorResponse("partner_not_verified", "This partner is not verified for routing.", 422);
  }

  const destinationUrl = getDestinationUrl(partner, destinationType);
  if (!destinationUrl) {
    return errorResponse(
      destinationType === "consultation" ? "consultation_url_missing" : "destination_missing",
      destinationType === "consultation"
        ? "This partner does not have a consultation destination configured."
        : "This destination is not configured for the partner.",
      422,
    );
  }

  if (!destinationUrl.startsWith("https://")) {
    return errorResponse(
      destinationType === "consultation" ? "consultation_url_missing" : "destination_missing",
      "The destination URL must use https.",
      422,
    );
  }

  const { error: clickError } = await logOutboundClick(supabase, {
    partner_id: partner.id,
    referral_code: partner.referral_code,
    session_id: sessionId,
    destination_type: destinationType,
    destination_url: destinationUrl,
  });

  if (clickError) {
    if (!isSchemaMismatchError(clickError)) {
      console.warn("Outbound click logging failed, continuing with redirect", clickError);
    }
  }

  return successResponse(destinationUrl);
});
