import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody = {
  ref?: string;
  session_id?: string;
  landing_page?: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent?: string | null;
};

type PartnerRow = {
  id: string;
  referral_code: string;
  status: "pending" | "verified" | "rejected";
};

type ModernVisitInsertPayload = {
  partner_id: string;
  referral_code: string;
  session_id: string;
  visitor_id: string;
  landing_page: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  user_agent: string | null;
  ip_hash: string | null;
};

type LegacyVisitInsertPayload = {
  referral_code: string;
  visitor_id: string;
  landing_page: string;
  utm_source: string | null;
  utm_campaign: string | null;
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

async function insertReferralVisit(
  supabase: ReturnType<typeof createClient>,
  modernPayload: ModernVisitInsertPayload,
  legacyPayload: LegacyVisitInsertPayload,
) {
  const modernInsert = await supabase.from("referral_visits").insert(modernPayload);

  if (!modernInsert.error || !isSchemaMismatchError(modernInsert.error)) {
    return modernInsert;
  }

  return supabase.from("referral_visits").insert(legacyPayload);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, partnerFound: false, verified: false }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse({ ok: false, partnerFound: false, verified: false }, 500);
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const referralCode = normalizeReferralCode(body?.ref);
  const sessionId = body?.session_id?.trim();
  const landingPage = body?.landing_page?.trim();

  if (!referralCode || !sessionId || !landingPage) {
    return jsonResponse({ ok: false, partnerFound: false, verified: false });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id, referral_code, status")
    .eq("referral_code", referralCode)
    .maybeSingle<PartnerRow>();

  if (partnerError) {
    console.error("Failed to resolve partner for visit tracking", partnerError);
    return jsonResponse({ ok: false, partnerFound: false, verified: false });
  }

  if (!partner) {
    return jsonResponse({ ok: false, partnerFound: false, verified: false });
  }

  if (partner.status !== "verified") {
    return jsonResponse({ ok: false, partnerFound: true, verified: false });
  }

  const modernInsertPayload: ModernVisitInsertPayload = {
    partner_id: partner.id,
    referral_code: partner.referral_code,
    session_id: sessionId,
    visitor_id: sessionId,
    landing_page: landingPage,
    referrer: body?.referrer || null,
    utm_source: body?.utm_source || null,
    utm_medium: body?.utm_medium || null,
    utm_campaign: body?.utm_campaign || null,
    user_agent: body?.user_agent || null,
    ip_hash: null,
  };

  const legacyInsertPayload: LegacyVisitInsertPayload = {
    referral_code: partner.referral_code,
    visitor_id: sessionId,
    landing_page: landingPage,
    utm_source: body?.utm_source || null,
    utm_campaign: body?.utm_campaign || null,
  };

  const { error: insertError } = await insertReferralVisit(supabase, modernInsertPayload, legacyInsertPayload);

  if (insertError) {
    console.error("Failed to insert referral visit", insertError);
    return jsonResponse({ ok: false, partnerFound: true, verified: true });
  }

  return jsonResponse({ ok: true, partnerFound: true, verified: true });
});
