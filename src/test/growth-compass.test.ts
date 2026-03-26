import { describe, expect, it } from "vitest";
import {
  calculateGrowthCompassScore,
  evaluateGrowthCompass,
  getGrowthCompassStatus,
  normalizeGrowthCompassInput,
} from "@/lib/growth-compass";

describe("growth compass", () => {
  it("normalizes negative values to zero", () => {
    expect(
      normalizeGrowthCompassInput({
        personalCustomers30d: -1,
        recruitedPartners30d: -2,
        activeFirstLinePartners30d: -3,
        partnerGeneratedLeads30d: -4,
        partnerGeneratedCustomers30d: -5,
      }),
    ).toEqual({
      personalCustomers30d: 0,
      recruitedPartners30d: 0,
      activeFirstLinePartners30d: 0,
      partnerGeneratedLeads30d: 0,
      partnerGeneratedCustomers30d: 0,
    });
  });

  it("classifies fully inactive partners", () => {
    expect(
      getGrowthCompassStatus({
        personalCustomers30d: 0,
        recruitedPartners30d: 0,
        activeFirstLinePartners30d: 0,
        partnerGeneratedLeads30d: 0,
        partnerGeneratedCustomers30d: 0,
      }),
    ).toBe("inactive");
  });

  it("classifies early personal activity as active", () => {
    expect(
      evaluateGrowthCompass({
        personalCustomers30d: 1,
        recruitedPartners30d: 0,
        activeFirstLinePartners30d: 0,
        partnerGeneratedLeads30d: 0,
        partnerGeneratedCustomers30d: 0,
      }).status,
    ).toBe("active");
  });

  it("keeps strong solo customer activity in active until team signal exists", () => {
    const result = evaluateGrowthCompass({
      personalCustomers30d: 5,
      recruitedPartners30d: 0,
      activeFirstLinePartners30d: 0,
      partnerGeneratedLeads30d: 0,
      partnerGeneratedCustomers30d: 0,
    });

    expect(result.status).toBe("active");
    expect(result.missingToNext).toContain("1 first-line-signal");
  });

  it("classifies repeated activity with early team signal as growing", () => {
    const result = evaluateGrowthCompass({
      personalCustomers30d: 2,
      recruitedPartners30d: 0,
      activeFirstLinePartners30d: 1,
      partnerGeneratedLeads30d: 0,
      partnerGeneratedCustomers30d: 0,
    });

    expect(result.status).toBe("growing");
    expect(result.nextBestAction).toContain("first-line-aktivering");
  });

  it("allows recruiting-led build mode with early first-line signal", () => {
    const result = evaluateGrowthCompass({
      personalCustomers30d: 0,
      recruitedPartners30d: 2,
      activeFirstLinePartners30d: 1,
      partnerGeneratedLeads30d: 1,
      partnerGeneratedCustomers30d: 0,
    });

    expect(result.status).toBe("growing");
    expect(result.explanation).toContain("first-line-signal");
  });

  it("classifies real team momentum as duplicating", () => {
    const result = evaluateGrowthCompass({
      personalCustomers30d: 2,
      recruitedPartners30d: 2,
      activeFirstLinePartners30d: 2,
      partnerGeneratedLeads30d: 3,
      partnerGeneratedCustomers30d: 0,
    });

    expect(result.status).toBe("duplicating");
    expect(result.flags).toContain("duplication-started");
  });

  it("keeps residual team signal without fresh personal movement in active", () => {
    const result = evaluateGrowthCompass({
      personalCustomers30d: 0,
      recruitedPartners30d: 0,
      activeFirstLinePartners30d: 1,
      partnerGeneratedLeads30d: 0,
      partnerGeneratedCustomers30d: 0,
    });

    expect(result.status).toBe("active");
    expect(result.nextMilestone).toContain("Upprepa första resultatet");
  });

  it("classifies strongest signals as leader-track", () => {
    const result = evaluateGrowthCompass({
      personalCustomers30d: 3,
      recruitedPartners30d: 2,
      activeFirstLinePartners30d: 3,
      partnerGeneratedLeads30d: 5,
      partnerGeneratedCustomers30d: 2,
    });

    expect(result.status).toBe("leader-track");
    expect(result.flags).toContain("leader-signal");
  });

  it("uses weighted scoring that favors team activation", () => {
    const score = calculateGrowthCompassScore({
      personalCustomers30d: 1,
      recruitedPartners30d: 1,
      activeFirstLinePartners30d: 2,
      partnerGeneratedLeads30d: 3,
      partnerGeneratedCustomers30d: 1,
    });

    expect(score).toBe(95);
  });
});
