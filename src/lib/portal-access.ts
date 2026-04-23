import { supabase } from "@/integrations/supabase/client";
import type { AppUser, PortalAccessState } from "@/lib/omega-types";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and either VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return supabase;
}

export async function getPortalAccessState(): Promise<PortalAccessState> {
  if (!supabase) {
    return { authUser: null, portalUser: null };
  }

  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) {
    console.error("Failed to load auth user", userError);
    return { authUser: null, portalUser: null };
  }

  const authUser = userData.user
    ? {
        id: userData.user.id,
        email: userData.user.email ?? null,
      }
    : null;

  if (!authUser) {
    return { authUser: null, portalUser: null };
  }

  const { data: portalUser, error: portalError } = await client
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle<AppUser>();

  if (portalError) {
    console.error("Failed to load portal profile", portalError);
    return { authUser, portalUser: null };
  }

  return { authUser, portalUser };
}

export async function signOutPortalUser() {
  if (!supabase) {
    return;
  }

  const client = requireSupabase();
  await client.auth.signOut({ scope: "global" });
  window.location.assign("/dashboard/login");
}
