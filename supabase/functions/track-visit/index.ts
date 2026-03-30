import { createClient } from "@supabase/supabase-js";

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
  geo_country: string | null;
  geo_country_code: string | null;
  geo_region: string | null;
  geo_city: string | null;
  geo_timezone: string | null;
  geo_source: string | null;
};

type LegacyVisitInsertPayload = {
  referral_code: string;
  visitor_id: string;
  landing_page: string;
  utm_source: string | null;
  utm_campaign: string | null;
};

type GeoLookupResult = {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  source: string | null;
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

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return request.headers.get("x-real-ip")?.trim() || null;
}

async function hashValue(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeGeoValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function readGeoFromHeaders(request: Request): GeoLookupResult {
  const country = normalizeGeoValue(
    request.headers.get("x-country-name") ||
      request.headers.get("x-vercel-ip-country-name"),
  );
  const countryCode = normalizeGeoValue(
    request.headers.get("x-country-code") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country"),
  );
  const region = normalizeGeoValue(
    request.headers.get("x-region-name") ||
      request.headers.get("x-vercel-ip-country-region"),
  );
  const city = normalizeGeoValue(
    request.headers.get("x-city") ||
      request.headers.get("x-vercel-ip-city"),
  );
  const timezone = normalizeGeoValue(
    request.headers.get("x-timezone") ||
      request.headers.get("x-vercel-ip-timezone"),
  );

  if (!country && !countryCode && !region && !city && !timezone) {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
      timezone: null,
      source: null,
    };
  }

  return {
    country,
    countryCode,
    region,
    city,
    timezone,
    source: "headers",
  };
}

async function lookupGeoFromIp(ip: string | null): Promise<GeoLookupResult> {
  if (!ip) {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
      timezone: null,
      source: null,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        country: null,
        countryCode: null,
        region: null,
        city: null,
        timezone: null,
        source: null,
      };
    }

    const data = await response.json().catch(() => null) as {
      success?: boolean;
      country?: string | null;
      country_code?: string | null;
      region?: string | null;
      city?: string | null;
      timezone?: { id?: string | null } | null;
    } | null;

    if (!data?.success) {
      return {
        country: null,
        countryCode: null,
        region: null,
        city: null,
        timezone: null,
        source: null,
      };
    }

    return {
      country: normalizeGeoValue(data.country),
      countryCode: normalizeGeoValue(data.country_code),
      region: normalizeGeoValue(data.region),
      city: normalizeGeoValue(data.city),
      timezone: normalizeGeoValue(data.timezone?.id),
      source: "ipwhois",
    };
  } catch (_error) {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
      timezone: null,
      source: null,
    };
  }
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

Deno.serve(async (request: Request) => {
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
  const clientIp = getClientIp(request);

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

  const ipHash = clientIp ? await hashValue(clientIp) : null;
  const headerGeo = readGeoFromHeaders(request);
  const lookedUpGeo =
    headerGeo.source === null
      ? await lookupGeoFromIp(clientIp)
      : {
          country: null,
          countryCode: null,
          region: null,
          city: null,
          timezone: null,
          source: null,
        };
  const geo = {
    country: headerGeo.country ?? lookedUpGeo.country,
    countryCode: headerGeo.countryCode ?? lookedUpGeo.countryCode,
    region: headerGeo.region ?? lookedUpGeo.region,
    city: headerGeo.city ?? lookedUpGeo.city,
    timezone: headerGeo.timezone ?? lookedUpGeo.timezone,
    source: headerGeo.source ?? lookedUpGeo.source,
  };

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
    ip_hash: ipHash,
    geo_country: geo.country,
    geo_country_code: geo.countryCode,
    geo_region: geo.region,
    geo_city: geo.city,
    geo_timezone: geo.timezone,
    geo_source: geo.source,
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
