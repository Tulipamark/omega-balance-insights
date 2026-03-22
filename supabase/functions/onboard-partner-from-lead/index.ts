import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody = {
  lead_id?: string;
};

type AuthUser = {
  id: string;
  email?: string | null;
};

type PortalUser = {
  id: string;
  auth_user_id: string | null;
  role: "admin" | "partner";
};

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: "customer_lead" | "partner_lead";
  status: string;
  referral_code: string | null;
  referred_by_user_id: string | null;
  details: Record<string, unknown> | null;
};

type AppUserRow = {
  id: string;
  auth_user_id: string | null;
  email: string;
  name: string;
  role: "admin" | "partner";
  referral_code: string;
  parent_partner_id: string | null;
};

type PartnerRow = {
  id: string;
  user_id: string;
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

function generateTemporaryPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (value) => chars[value % chars.length]).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = request.headers.get("Authorization");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !authHeader) {
    return jsonResponse({ ok: false, error: "Missing configuration" }, 500);
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const leadId = body?.lead_id?.trim();

  if (!leadId) {
    return jsonResponse({ ok: false, error: "Missing lead_id" }, 400);
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: authData, error: authError } = await authClient.auth.getUser();
  const authUser = authData.user as AuthUser | null;

  if (authError || !authUser) {
    return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
  }

  const { data: adminUser, error: adminError } = await serviceClient
    .from("users")
    .select("id, auth_user_id, role")
    .eq("auth_user_id", authUser.id)
    .maybeSingle<PortalUser>();

  if (adminError || !adminUser || adminUser.role !== "admin") {
    return jsonResponse({ ok: false, error: "Forbidden" }, 403);
  }

  const { data: lead, error: leadError } = await serviceClient
    .from("leads")
    .select("id, name, email, phone, type, status, referral_code, referred_by_user_id, details")
    .eq("id", leadId)
    .eq("type", "partner_lead")
    .maybeSingle<LeadRow>();

  if (leadError || !lead) {
    return jsonResponse({ ok: false, error: "Partner lead not found" }, 404);
  }

  let portalUser: AppUserRow | null = null;
  const { data: existingPortalUser, error: existingPortalUserError } = await serviceClient
    .from("users")
    .select("id, auth_user_id, email, name, role, referral_code, parent_partner_id")
    .eq("email", lead.email)
    .maybeSingle<AppUserRow>();

  if (existingPortalUserError) {
    return jsonResponse({ ok: false, error: "Could not look up existing portal user" }, 500);
  }

  portalUser = existingPortalUser;

  let authUserId = portalUser?.auth_user_id || null;
  let temporaryPassword: string | null = null;

  if (!authUserId) {
    const temporary = generateTemporaryPassword();
    const { data: createdAuthUser, error: createdAuthUserError } = await serviceClient.auth.admin.createUser({
      email: lead.email,
      password: temporary,
      email_confirm: true,
      user_metadata: {
        full_name: lead.name,
      },
    });

    if (createdAuthUserError || !createdAuthUser.user) {
      return jsonResponse({ ok: false, error: createdAuthUserError?.message || "Could not create auth user" }, 500);
    }

    authUserId = createdAuthUser.user.id;
    temporaryPassword = temporary;
  }

  if (!portalUser) {
    const { data: insertedPortalUser, error: insertedPortalUserError } = await serviceClient
      .from("users")
      .insert({
        auth_user_id: authUserId,
        name: lead.name,
        email: lead.email,
        role: "partner",
        parent_partner_id: lead.referred_by_user_id || null,
      })
      .select("id, auth_user_id, email, name, role, referral_code, parent_partner_id")
      .single<AppUserRow>();

    if (insertedPortalUserError || !insertedPortalUser) {
      return jsonResponse({ ok: false, error: insertedPortalUserError?.message || "Could not create portal user" }, 500);
    }

    portalUser = insertedPortalUser;
  } else {
    const { data: updatedPortalUser, error: updatedPortalUserError } = await serviceClient
      .from("users")
      .update({
        auth_user_id: authUserId,
        role: "partner",
        name: lead.name,
        parent_partner_id: lead.referred_by_user_id || null,
      })
      .eq("id", portalUser.id)
      .select("id, auth_user_id, email, name, role, referral_code, parent_partner_id")
      .single<AppUserRow>();

    if (updatedPortalUserError || !updatedPortalUser) {
      return jsonResponse({ ok: false, error: updatedPortalUserError?.message || "Could not update portal user" }, 500);
    }

    portalUser = updatedPortalUser;
  }

  const { data: existingPartner, error: existingPartnerError } = await serviceClient
    .from("partners")
    .select("id, user_id, referral_code")
    .eq("user_id", portalUser.id)
    .maybeSingle<PartnerRow>();

  if (existingPartnerError) {
    return jsonResponse({ ok: false, error: "Could not look up partner profile" }, 500);
  }

  let partner = existingPartner;

  if (!partner) {
    const { data: createdPartner, error: createdPartnerError } = await serviceClient
      .from("partners")
      .insert({
        user_id: portalUser.id,
        referral_code: portalUser.referral_code,
        status: "pending",
      })
      .select("id, user_id, referral_code")
      .single<PartnerRow>();

    if (createdPartnerError || !createdPartner) {
      return jsonResponse({ ok: false, error: createdPartnerError?.message || "Could not create partner profile" }, 500);
    }

    partner = createdPartner;
  }

  if (lead.referred_by_user_id) {
    const { error: relationshipError } = await serviceClient
      .from("partner_relationships")
      .upsert({
        sponsor_user_id: lead.referred_by_user_id,
        partner_user_id: portalUser.id,
        level: 1,
      }, { onConflict: "partner_user_id" });

    if (relationshipError) {
      return jsonResponse({ ok: false, error: "Could not create partner relationship" }, 500);
    }
  }

  const { error: leadUpdateError } = await serviceClient
    .from("leads")
    .update({
      status: "qualified",
      referred_by_user_id: lead.referred_by_user_id,
      referral_code: lead.referral_code,
      partner_id: partner.id,
      details: {
        ...(lead.details || {}),
        onboarding_completed_at: new Date().toISOString(),
      },
    })
    .eq("id", lead.id);

  if (leadUpdateError) {
    return jsonResponse({ ok: false, error: "Could not update partner lead" }, 500);
  }

  return jsonResponse({
    ok: true,
    partner_id: partner.id,
    auth_user_id: authUserId,
    email: lead.email,
    temporary_password: temporaryPassword,
    referral_code: partner.referral_code,
  });
});
