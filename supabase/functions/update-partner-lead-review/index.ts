import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody = {
  lead_id?: string;
  partner_priority?: "hot" | "follow_up" | "not_now" | null;
  admin_note?: string | null;
  zinzino_verified?: boolean | null;
  team_intent_confirmed?: boolean | null;
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
  type: "customer_lead" | "partner_lead";
  details: Record<string, unknown> | null;
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

Deno.serve(async (request: Request) => {
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

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse({ ok: false, error: "Missing configuration" }, 500);
  }

  if (!authHeader) {
    return jsonResponse({ ok: false, error: "Missing authorization header" }, 401);
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const leadId = body?.lead_id?.trim();
  const partnerPriority = body?.partner_priority ?? null;
  const adminNote = body?.admin_note?.trim() || null;
  const zinzinoVerified = body?.zinzino_verified ?? null;
  const teamIntentConfirmed = body?.team_intent_confirmed ?? null;

  if (!leadId) {
    return jsonResponse({ ok: false, error: "Missing lead_id" }, 400);
  }

  if (partnerPriority && !["hot", "follow_up", "not_now"].includes(partnerPriority)) {
    return jsonResponse({ ok: false, error: "Invalid partner_priority" }, 400);
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
    .select("id, type, details")
    .eq("id", leadId)
    .eq("type", "partner_lead")
    .maybeSingle<LeadRow>();

  if (leadError || !lead) {
    return jsonResponse({ ok: false, error: "Partner lead not found" }, 404);
  }

  const nextDetails = {
    ...(lead.details || {}),
    partner_priority: partnerPriority,
    admin_note: adminNote,
    zinzino_verified: zinzinoVerified,
    team_intent_confirmed: teamIntentConfirmed,
    review_updated_at: new Date().toISOString(),
    review_updated_by: adminUser.id,
  };

  const { error: updateError } = await serviceClient
    .from("leads")
    .update({
      details: nextDetails,
    })
    .eq("id", lead.id);

  if (updateError) {
    return jsonResponse({ ok: false, error: "Could not update partner lead review" }, 500);
  }

  return jsonResponse({
    ok: true,
    lead_id: lead.id,
    partner_priority: partnerPriority,
    admin_note: adminNote,
    zinzino_verified: zinzinoVerified,
    team_intent_confirmed: teamIntentConfirmed,
  });
});
