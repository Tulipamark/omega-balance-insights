import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DestinationType = "test" | "shop" | "partner";
type FailureReason = "partner_not_found" | "partner_not_verified" | "destination_missing" | "invalid_type";

type RequestBody = {
  ref?: string;
  type?: DestinationType;
  session_id?: string;
};

type PartnerRow = {
  id: string;
  referral_code: string;
  zinzino_test_url: string | null;
  zinzino_shop_url: string | null;
  zinzino_partner_url: string | null;
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

  return null;
}

function failure(reason: FailureReason, status = 200) {
  return jsonResponse({ ok: false, reason }, status);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, reason: "invalid_type" satisfies FailureReason }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse({ ok: false, reason: "destination_missing" satisfies FailureReason }, 500);
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const referralCode = normalizeReferralCode(body?.ref);
  const destinationType = body?.type;
  const sessionId = body?.session_id?.trim();

  if (!destinationType || !["test", "shop", "partner"].includes(destinationType)) {
    return failure("invalid_type");
  }

  if (!referralCode || !sessionId) {
    return failure("partner_not_found");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id, referral_code, zinzino_test_url, zinzino_shop_url, zinzino_partner_url, status")
    .eq("referral_code", referralCode)
    .maybeSingle<PartnerRow>();

  if (partnerError) {
    console.error("Failed to resolve partner", partnerError);
    return failure("partner_not_found");
  }

  if (!partner) {
    return failure("partner_not_found");
  }

  if (partner.status !== "verified") {
    return failure("partner_not_verified");
  }

  const destinationUrl = getDestinationUrl(partner, destinationType);
  if (!destinationUrl || !destinationUrl.startsWith("https://")) {
    return failure("destination_missing");
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

  return jsonResponse({
    ok: true,
    destination_url: destinationUrl,
  });
});
