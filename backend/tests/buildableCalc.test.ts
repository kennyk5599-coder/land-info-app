import { describe, expect, it } from "vitest";
import {
  calcBuildableOverview,
  calcRoadWidthFarCapPercent,
  isResidentialZone,
  suggestedBuildingUses,
} from "../src/lib/buildableCalc.js";

describe("calcBuildableOverview", () => {
  it("computes max footprint and floor area from coverage/FAR ratios (no road width given)", () => {
    // 30 tsubo ~= 99.17 sqm; 60% coverage, 200% FAR
    const result = calcBuildableOverview(30, 60, 200, "第一種住居地域", null, false);

    expect(result.maxFootprintSqm).toBeCloseTo(59.5, 1);
    expect(result.maxTotalFloorAreaSqm).toBeCloseTo(198.35, 1);
    expect(result.maxFootprintTsubo).toBeCloseTo(18, 1);
    expect(result.maxTotalFloorAreaTsubo).toBeCloseTo(60, 1);
    expect(result.appliedFarRatioPercent).toBe(200);
    expect(result.farRestrictedByRoadWidth).toBe(false);
    expect(result.roadWidthFarCapPercent).toBeNull();
    expect(result.appliedCoverageRatioPercent).toBe(60);
    expect(result.cornerLotBonusApplied).toBe(false);
    expect(result.disclaimer).toContain("前面道路幅員");
  });

  it("caps FAR using the road-width rule when it is more restrictive (residential zone, 0.4x)", () => {
    // designated FAR 300%, but a 4m road in a residential zone caps it at 4 * 0.4 * 100 = 160%
    const result = calcBuildableOverview(30, 60, 300, "第一種住居地域", 4, false);

    expect(result.roadWidthFarCapPercent).toBe(160);
    expect(result.appliedFarRatioPercent).toBe(160);
    expect(result.farRestrictedByRoadWidth).toBe(true);
    // 99.173... sqm * 1.6 ~= 158.68
    expect(result.maxTotalFloorAreaSqm).toBeCloseTo(158.68, 1);
  });

  it("caps FAR using the road-width rule with the 0.6x multiplier for non-residential zones", () => {
    // designated FAR 400%, 5m road in a commercial zone caps it at 5 * 0.6 * 100 = 300%
    const result = calcBuildableOverview(30, 80, 400, "商業地域", 5, false);

    expect(result.roadWidthFarCapPercent).toBe(300);
    expect(result.appliedFarRatioPercent).toBe(300);
    expect(result.farRestrictedByRoadWidth).toBe(true);
  });

  it("does not restrict FAR when the road-width cap is looser than the designated FAR", () => {
    // 8m road in a residential zone caps at 8 * 0.4 * 100 = 320%, looser than designated 200%
    const result = calcBuildableOverview(30, 60, 200, "第一種住居地域", 8, false);

    expect(result.roadWidthFarCapPercent).toBe(320);
    expect(result.appliedFarRatioPercent).toBe(200);
    expect(result.farRestrictedByRoadWidth).toBe(false);
  });

  it("does not apply the road-width rule when the road is 12m or wider", () => {
    const result = calcBuildableOverview(30, 60, 600, "商業地域", 12, false);

    expect(result.roadWidthFarCapPercent).toBeNull();
    expect(result.appliedFarRatioPercent).toBe(600);
    expect(result.farRestrictedByRoadWidth).toBe(false);
  });

  it("applies a +10 percentage point coverage bonus for corner lots", () => {
    const result = calcBuildableOverview(30, 60, 200, "第一種住居地域", null, true);

    expect(result.designatedCoverageRatioPercent).toBe(60);
    expect(result.appliedCoverageRatioPercent).toBe(70);
    expect(result.cornerLotBonusApplied).toBe(true);
  });

  it("caps the corner-lot coverage bonus at 100%", () => {
    const result = calcBuildableOverview(30, 95, 200, "商業地域", null, true);

    expect(result.appliedCoverageRatioPercent).toBe(100);
  });

  it("does not apply a corner-lot bonus when coverage is already 100%", () => {
    const result = calcBuildableOverview(30, 100, 200, "商業地域", null, true);

    expect(result.appliedCoverageRatioPercent).toBe(100);
    expect(result.cornerLotBonusApplied).toBe(false);
  });

  it("estimates the number of floors from max footprint and max total floor area", () => {
    // footprint 60 sqm-equivalent ratio, FAR 200% -> floors = 200/60 rounded up
    const result = calcBuildableOverview(30, 60, 200, "第一種住居地域", null, false);
    const expectedFloors = Math.ceil(result.maxTotalFloorAreaSqm / result.maxFootprintSqm);

    expect(result.estimatedFloors).toBe(expectedFloors);
  });

  it("suggests building uses based on the zone", () => {
    const result = calcBuildableOverview(30, 60, 200, "商業地域", null, false);
    expect(result.suggestedUses.length).toBeGreaterThan(0);
  });
});

describe("isResidentialZone", () => {
  it("classifies all residential-type zone names as residential", () => {
    const residentialZones = [
      "第一種低層住居専用地域",
      "第二種低層住居専用地域",
      "田園住居地域",
      "第一種中高層住居専用地域",
      "第二種中高層住居専用地域",
      "第一種住居地域",
      "第二種住居地域",
      "準住居地域",
    ];
    for (const zone of residentialZones) {
      expect(isResidentialZone(zone)).toBe(true);
    }
  });

  it("classifies non-residential zone names as non-residential", () => {
    const otherZones = ["近隣商業地域", "商業地域", "準工業地域", "工業地域", "工業専用地域"];
    for (const zone of otherZones) {
      expect(isResidentialZone(zone)).toBe(false);
    }
  });

  it("treats null zone name as non-residential", () => {
    expect(isResidentialZone(null)).toBe(false);
  });
});

describe("calcRoadWidthFarCapPercent", () => {
  it("returns null when road width is 12m or more", () => {
    expect(calcRoadWidthFarCapPercent(12, "第一種住居地域")).toBeNull();
    expect(calcRoadWidthFarCapPercent(15, "商業地域")).toBeNull();
  });
});

describe("suggestedBuildingUses", () => {
  it("suggests detached-house style uses for low-rise residential zones", () => {
    expect(suggestedBuildingUses("第一種低層住居専用地域")).toContain("戸建て住宅");
    expect(suggestedBuildingUses("田園住居地域")).toContain("戸建て住宅");
  });

  it("suggests apartment/office uses for commercial zones", () => {
    expect(suggestedBuildingUses("商業地域")).toContain("店舗");
  });

  it("returns an empty array when zone name is null", () => {
    expect(suggestedBuildingUses(null)).toEqual([]);
  });
});
