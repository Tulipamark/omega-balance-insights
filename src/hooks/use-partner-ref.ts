import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const REF_KEY = "omega_partner_ref";

export function usePartnerRef() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem(REF_KEY, ref);
      // Log visit
      (async () => {
        const { data: partner } = await supabase
          .from("partners")
          .select("id")
          .eq("referral_code", ref)
          .single();
        if (partner) {
          await supabase.from("partner_visits").insert({
            partner_id: partner.id,
            page: window.location.pathname,
            lang: window.location.pathname.split("/")[1] || "sv",
          });
        }
      })();
    }
  }, [searchParams]);

  return localStorage.getItem(REF_KEY) || undefined;
}

export async function getPartnerIdFromRef(ref: string | undefined): Promise<string | null> {
  if (!ref) return null;
  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("referral_code", ref)
    .single();
  return data?.id || null;
}
