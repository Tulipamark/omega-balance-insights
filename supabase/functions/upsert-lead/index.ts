import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type LeadType = "customer" | "partner";
type LeadSource = "email_gate" | "customer_form" | "partner_form";
type FailureReason = "invalid_email" | "partner_not_found" | "partner_not_verified";

type RequestBody = {
  email?: string;
  full_name?: string;
  phone?: string | null;
  ref?: string | null;
  session_id?: string | null;
  lead_type?: LeadType;
  lead_source?: LeadSource;
  source_page?: string | null;
  details?: Record<string, unknown> | null;
};

type PartnerRow = {
  id: string;
  referral_code: string;
  user_id: string;
  status: "pending" | "verified" | "rejected";
};

type ExistingLeadRow = {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
};

type LeadInsertPayload = {
  name: string;
  email: string;
  phone: string | null;
  type: "customer_lead" | "partner_lead";
  source_page: string | null;
  referral_code: string | null;
  referred_by_user_id: string | null;
  status: string;
  details: Record<string, unknown>;
  full_name?: string;
  lead_type?: LeadType;
  lead_source?: LeadSource;
  partner_id?: string | null;
  session_id?: string | null;
};

type LeadUpdatePayload = LeadInsertPayload;

type NotificationPayload = {
  mode: "created" | "updated";
  email: string;
  fullName: string;
  phone: string | null;
  leadType: LeadType;
  leadSource: LeadSource;
  sourcePage: string | null;
  sessionId: string | null;
  referralCode: string | null;
  partnerStatus: PartnerRow["status"] | null;
  details: Record<string, unknown>;
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

function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() || null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isWithinThirtyDays(timestamp: string, now: Date) {
  return now.getTime() - new Date(timestamp).getTime() <= 30 * 24 * 60 * 60 * 1000;
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

async function sendLeadNotification(payload: NotificationPayload) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const notificationTo = Deno.env.get("LEAD_NOTIFICATION_TO");
  const notificationFrom = Deno.env.get("LEAD_NOTIFICATION_FROM") || "OmegaBalance <onboarding@resend.dev>";

  if (!resendApiKey || !notificationTo) {
    console.info("Lead notification skipped because RESEND_API_KEY or LEAD_NOTIFICATION_TO is missing.");
    return;
  }

  const intent = typeof payload.details.intent === "string" ? payload.details.intent : "lead";
  const detailEntries = Object.entries(payload.details || {})
    .map(([key, value]) => `<li><strong>${key}</strong>: ${String(value)}</li>`)
    .join("");

  const html = `
    <h2>New OmegaBalance ${payload.leadType} ${intent}</h2>
    <p><strong>Mode:</strong> ${payload.mode}</p>
    <p><strong>Name:</strong> ${payload.fullName}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Phone:</strong> ${payload.phone || "-"}</p>
    <p><strong>Lead type:</strong> ${payload.leadType}</p>
    <p><strong>Lead source:</strong> ${payload.leadSource}</p>
    <p><strong>Source page:</strong> ${payload.sourcePage || "-"}</p>
    <p><strong>Referral code:</strong> ${payload.referralCode || "-"}</p>
    <p><strong>Partner status:</strong> ${payload.partnerStatus || "-"}</p>
    <p><strong>Session ID:</strong> ${payload.sessionId || "-"}</p>
    ${detailEntries ? `<h3>Details</h3><ul>${detailEntries}</ul>` : ""}
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: notificationFrom,
      to: [notificationTo],
      subject: `OmegaBalance ${payload.leadType} ${intent}: ${payload.fullName}`,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("Failed to send lead notification", response.status, errorText);
  }
}

async function sendLeadAcknowledgement(payload: NotificationPayload) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const acknowledgementFrom =
    Deno.env.get("LEAD_ACK_FROM") ||
    Deno.env.get("LEAD_NOTIFICATION_FROM") ||
    "InsideBalance <onboarding@resend.dev>";
  const replyTo =
    Deno.env.get("LEAD_ACK_REPLY_TO") ||
    Deno.env.get("LEAD_NOTIFICATION_TO") ||
    "hello@insidebalance.eu";

  if (!resendApiKey) {
    console.info("Lead acknowledgement skipped because RESEND_API_KEY is missing.");
    return;
  }

  const intent = typeof payload.details.intent === "string" ? payload.details.intent : "lead";
  const isPartnerLead = payload.leadType === "partner";
  const subject = isPartnerLead
    ? "Tack för din partnerförfrågan"
    : "Tack för din förfrågan";
  const intro = isPartnerLead
    ? "Vi har tagit emot din partnerförfrågan och återkommer så snart vi kan."
    : intent === "contact"
      ? "Vi har tagit emot ditt meddelande och återkommer så snart vi kan."
      : "Vi har tagit emot din förfrågan och återkommer så snart vi kan.";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.65;">
      <h2 style="margin-bottom: 12px;">Tack ${payload.fullName.split(" ")[0] || ""}</h2>
      <p>${intro}</p>
      <p>Normal svarstid är inom 24–48 timmar.</p>
      <p>Om du vill komplettera något kan du svara direkt på det här mejlet eller skriva till <a href="mailto:${replyTo}">${replyTo}</a>.</p>
      <p style="margin-top: 24px;">Vänliga hälsningar,<br />InsideBalance</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: acknowledgementFrom,
      to: [payload.email],
      reply_to: replyTo,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("Failed to send lead acknowledgement", response.status, errorText);
  }
}

async function fetchExistingLeadByEmail(supabase: ReturnType<typeof createClient>, email: string) {
  const modernQuery = await supabase
    .from("leads")
    .select("id, created_at, updated_at, status")
    .eq("email", email)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<ExistingLeadRow>();

  if (!modernQuery.error || !isSchemaMismatchError(modernQuery.error)) {
    return modernQuery;
  }

  return supabase
    .from("leads")
    .select("id, created_at, status")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<ExistingLeadRow>();
}

async function insertLeadRow(
  supabase: ReturnType<typeof createClient>,
  modernPayload: LeadInsertPayload,
  legacyPayload: Record<string, unknown>,
) {
  const modernInsert = await supabase.from("leads").insert(modernPayload).select("id").single<{ id: string }>();

  if (!modernInsert.error || !isSchemaMismatchError(modernInsert.error)) {
    return modernInsert;
  }

  return supabase.from("leads").insert(legacyPayload).select("id").single<{ id: string }>();
}

async function updateLeadRow(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  modernPayload: LeadUpdatePayload,
  legacyPayload: Record<string, unknown>,
) {
  const modernUpdate = await supabase.from("leads").update(modernPayload).eq("id", leadId);

  if (!modernUpdate.error || !isSchemaMismatchError(modernUpdate.error)) {
    return modernUpdate;
  }

  return supabase.from("leads").update(legacyPayload).eq("id", leadId);
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, reason: "invalid_email" satisfies FailureReason }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse({ ok: false, reason: "invalid_email" satisfies FailureReason }, 500);
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const email = normalizeEmail(body?.email);
  const fullName = body?.full_name?.trim();
  const phone = body?.phone?.trim() || null;
  const referralCode = normalizeReferralCode(body?.ref);
  const sessionId = body?.session_id?.trim() || null;
  const leadType = body?.lead_type;
  const leadSource = body?.lead_source;
  const sourcePage = body?.source_page?.trim() || null;
  const details = body?.details ?? {};
  const intent = typeof details.intent === "string" ? details.intent : null;
  const allowDirectContactFallback = leadSource === "customer_form" && intent === "contact";

  if (!email || !isValidEmail(email) || !fullName || !leadType || !leadSource) {
    return jsonResponse({ ok: false, reason: "invalid_email" satisfies FailureReason }, 400);
  }

  if (!["customer", "partner"].includes(leadType) || !["email_gate", "customer_form", "partner_form"].includes(leadSource)) {
    return jsonResponse({ ok: false, reason: "invalid_email" satisfies FailureReason }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let partner: PartnerRow | null = null;

  if (referralCode) {
    const { data: partnerRow, error: partnerError } = await supabase
      .from("partners")
      .select("id, referral_code, user_id, status")
      .eq("referral_code", referralCode)
      .maybeSingle<PartnerRow>();

    if (partnerError) {
      console.error("Failed to resolve partner for lead", partnerError);
      if (!isSchemaMismatchError(partnerError)) {
        if (allowDirectContactFallback) {
          console.warn("Contact lead fallback: ignoring unresolved referral code", referralCode);
        } else {
          return jsonResponse({ ok: false, reason: "partner_not_found" satisfies FailureReason });
        }
      }
    }

    if (partnerRow) {
      if (partnerRow.status !== "verified") {
        if (allowDirectContactFallback) {
          console.warn("Contact lead fallback: ignoring unverified partner referral", referralCode);
        } else {
          return jsonResponse({ ok: false, reason: "partner_not_verified" satisfies FailureReason });
        }
      } else {
        partner = partnerRow;
      }
    } else if (!partnerError) {
      if (allowDirectContactFallback) {
        console.warn("Contact lead fallback: partner row missing for referral", referralCode);
      } else {
        return jsonResponse({ ok: false, reason: "partner_not_found" satisfies FailureReason });
      }
    }
  }

  const now = new Date();
  const { data: existingLead, error: lookupError } = await fetchExistingLeadByEmail(supabase, email);

  if (lookupError) {
    console.error("Failed to look up lead", lookupError);
    return jsonResponse({ ok: false, reason: "invalid_email" satisfies FailureReason });
  }

  const modernInsertPayload: LeadInsertPayload = {
    name: fullName,
    full_name: fullName,
    email,
    phone,
    type: leadType === "customer" ? "customer_lead" : "partner_lead",
    lead_type: leadType,
    lead_source: leadSource,
    source_page: sourcePage,
    referral_code: partner?.referral_code || null,
    referred_by_user_id: partner?.user_id || null,
    partner_id: partner?.id || null,
    session_id: sessionId,
    status: "new",
    details,
  };

  const legacyInsertPayload = {
    name: fullName,
    email,
    phone,
    type: leadType === "customer" ? "customer_lead" : "partner_lead",
    source_page: sourcePage,
    referral_code: partner?.referral_code || null,
    referred_by_user_id: partner?.user_id || null,
    status: "new",
    details,
  };

  if (!existingLead) {
    const { data: createdLead, error: insertError } = await insertLeadRow(supabase, modernInsertPayload, legacyInsertPayload);

    if (insertError) {
      console.error("Failed to insert lead", insertError);
      return jsonResponse({ ok: false, reason: "invalid_email" satisfies FailureReason });
    }

    await sendLeadNotification({
      mode: "created",
      email,
      fullName,
      phone,
      leadType,
      leadSource,
      sourcePage,
      sessionId,
      referralCode: partner?.referral_code || null,
      partnerStatus: partner?.status || null,
      details,
    });
    await sendLeadAcknowledgement({
      mode: "created",
      email,
      fullName,
      phone,
      leadType,
      leadSource,
      sourcePage,
      sessionId,
      referralCode: partner?.referral_code || null,
      partnerStatus: partner?.status || null,
      details,
    });

    return jsonResponse({ ok: true, mode: "created", lead_id: createdLead.id });
  }

  const interactionTime = existingLead.updated_at || existingLead.created_at;
  if (!isWithinThirtyDays(interactionTime, now)) {
    return jsonResponse({ ok: true, mode: "ignored", lead_id: existingLead.id });
  }

  const modernUpdatePayload: LeadUpdatePayload = {
    name: fullName,
    full_name: fullName,
    email,
    phone,
    type: leadType === "customer" ? "customer_lead" : "partner_lead",
    lead_type: leadType,
    lead_source: leadSource,
    source_page: sourcePage,
    session_id: sessionId,
    status: existingLead.status,
    details,
    ...(partner
      ? {
          referral_code: partner.referral_code,
          referred_by_user_id: partner.user_id,
          partner_id: partner.id,
        }
      : {}),
  };

  const legacyUpdatePayload = {
    name: fullName,
    email,
    phone,
    type: leadType === "customer" ? "customer_lead" : "partner_lead",
    source_page: sourcePage,
    referral_code: partner?.referral_code || null,
    referred_by_user_id: partner?.user_id || null,
    status: existingLead.status,
    details,
  };

  const { error: updateError } = await updateLeadRow(supabase, existingLead.id, modernUpdatePayload, legacyUpdatePayload);

  if (updateError) {
    console.error("Failed to update lead", updateError);
    return jsonResponse({ ok: false, reason: "invalid_email" satisfies FailureReason });
  }

  await sendLeadNotification({
    mode: "updated",
    email,
    fullName,
    phone,
    leadType,
    leadSource,
    sourcePage,
    sessionId,
    referralCode: partner?.referral_code || null,
    partnerStatus: partner?.status || null,
    details,
  });
  await sendLeadAcknowledgement({
    mode: "updated",
    email,
    fullName,
    phone,
    leadType,
    leadSource,
    sourcePage,
    sessionId,
    referralCode: partner?.referral_code || null,
    partnerStatus: partner?.status || null,
    details,
  });

  return jsonResponse({ ok: true, mode: "updated", lead_id: existingLead.id });
});
