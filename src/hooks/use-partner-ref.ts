import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const REF_KEY = "omega_partner_ref";

export function usePartnerRef() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem(REF_KEY, ref);
    }
  }, [searchParams]);

  return localStorage.getItem(REF_KEY) || undefined;
}
