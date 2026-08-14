import { describe, expect, it } from "vitest";
import { areaLabelForLandType, isLandTransaction } from "../src/services/transactionsService.js";

describe("areaLabelForLandType", () => {
  it("labels land-only and land-with-building sales as 土地面積", () => {
    expect(areaLabelForLandType("宅地(土地)")).toBe("土地面積");
    expect(areaLabelForLandType("宅地(土地と建物)")).toBe("土地面積");
  });

  it("labels condo units as 専有面積", () => {
    expect(areaLabelForLandType("中古マンション等")).toBe("専有面積");
  });

  it("falls back to 面積 for other land types", () => {
    expect(areaLabelForLandType("農地")).toBe("面積");
  });
});

describe("isLandTransaction", () => {
  it("accepts land-only and land-with-building sales", () => {
    expect(isLandTransaction("宅地(土地)")).toBe(true);
    expect(isLandTransaction("宅地(土地と建物)")).toBe(true);
  });

  it("rejects condo units and other non-land types", () => {
    expect(isLandTransaction("中古マンション等")).toBe(false);
    expect(isLandTransaction("農地")).toBe(false);
  });
});
