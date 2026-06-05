import { describe, expect, it } from "vitest";
import { getZinzinoGutTestUrl, getZinzinoTestUrl } from "@/lib/zinzino";

describe("zinzino fallback urls", () => {
  it("uses the live Zinzino product route format for BalanceTest", () => {
    expect(getZinzinoTestUrl("sv")).toBe(
      "https://www.zinzino.com/shop/site/SE/sv-SE/products/shop/home-health-tests/309000",
    );
  });

  it("uses the live Zinzino product route format for GutBalance", () => {
    expect(getZinzinoGutTestUrl("en")).toBe(
      "https://www.zinzino.com/shop/site/GB/en-GB/products/shop/home-health-tests/309070",
    );
  });
});
