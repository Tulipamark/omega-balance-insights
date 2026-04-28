import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import { getAdminDashboardData, getDemoPartnerOptions, getPartnerDashboardData, updatePartnerZzLinks } from "@/lib/omega-data";

describe("updatePartnerZzLinks", () => {
  const partner = getDemoPartnerOptions()[0];
  let originalLinks: Awaited<ReturnType<typeof getPartnerDashboardData>>["zzLinks"];

  beforeEach(async () => {
    const data = await getPartnerDashboardData(partner.id);
    originalLinks = data.zzLinks;
  });

  afterEach(async () => {
    if (originalLinks) {
      await updatePartnerZzLinks(partner.id, originalLinks);
    }
  });

  it("saves valid https links and exposes them in the partner dashboard", async () => {
    await updatePartnerZzLinks(partner.id, {
      test: "https://example.com/test",
      gutTest: "https://example.com/gut-test",
      shop: "https://example.com/shop",
      partner: "https://example.com/partner",
      consultation: "https://example.com/call",
    });

    const data = await getPartnerDashboardData(partner.id);

    expect(data.zzLinks).toEqual({
      test: "https://example.com/test",
      gutTest: "https://example.com/gut-test",
      shop: "https://example.com/shop",
      partner: "https://example.com/partner",
      consultation: "https://example.com/call",
    });
  });

  it("marks ZZ links as ready when both test links, shop and partner links are set", async () => {
    await updatePartnerZzLinks(partner.id, {
      test: "https://example.com/test",
      gutTest: "https://example.com/gut-test",
      shop: "https://example.com/shop",
      partner: "https://example.com/partner",
      consultation: null,
    });

    const adminData = await getAdminDashboardData();
    const partnerRow = adminData.partners.find((row) => row.partnerId === partner.id);

    expect(partnerRow?.zzLinksReady).toBe(true);
    expect(partnerRow?.zzLinks.consultation).toBeNull();
  });

  it("rejects links that do not use https", async () => {
    await expect(
      updatePartnerZzLinks(partner.id, {
        test: "http://example.com/test",
        gutTest: null,
        shop: null,
        partner: null,
        consultation: null,
      }),
    ).rejects.toThrow("Omega/BalanceTest-länk måste börja med https://");
  });

  it("rejects malformed urls", async () => {
    await expect(
      updatePartnerZzLinks(partner.id, {
        test: "inte-en-url",
        gutTest: null,
        shop: null,
        partner: null,
        consultation: null,
      }),
    ).rejects.toThrow("Omega/BalanceTest-länk måste vara en giltig URL.");
  });
});
