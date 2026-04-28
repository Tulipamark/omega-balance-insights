import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody = {
  name?: string;
  ref?: string | null;
  session_id?: string;
  page_path?: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent?: string | null;
  details?: Record<string, unknown> | null;
};

type PartnerRow = {
  id: string;
  referral_code: string;
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

function normalizeEventName(value?: string | null) {
  return value?.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || null;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse({ ok: false }, 500);
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const eventName = normalizeEventName(body?.name);
  const sessionId = body?.session_id?.trim();
  const pagePath = body?.page_path?.trim();
  const referralCode = normalizeReferralCode(body?.ref);

  if (!eventName || !sessionId || !pagePath) {
    return jsonResponse({ ok: false }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let partnerId: string | null = null;

  if (referralCode) {
    const { data: partner } = await supabase
      .from("partners")
      .select("id, referral_code")
      .eq("referral_code", referralCode)
      .maybeSingle<PartnerRow>();

    partnerId = partner?.id || null;
  }

  const { data, error } = await supabase
    .from("funnel_events")
    .insert({
      partner_id: partnerId,
      referral_code: referralCode,
      session_id: sessionId,
      event_name: eventName,
      page_path: pagePath,
      referrer: body?.referrer || null,
      utm_source: body?.utm_source || null,
      utm_medium: body?.utm_medium || null,
      utm_campaign: body?.utm_campaign || null,
      user_agent: body?.user_agent || null,
      details: body?.details && typeof body.details === "object" ? body.details : {},
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    console.error("Failed to insert funnel event", error);
    return jsonResponse({ ok: false }, 500);
  }

  return jsonResponse({
    ok: true,
    event_id: data.id,
  });
});
