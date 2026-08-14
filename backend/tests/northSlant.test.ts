import { describe, expect, it } from "vitest";
import { calcNorthSlant, isLowRiseResidential, isMidRiseResidential } from "../src/lib/northSlant.js";

describe("calcNorthSlant", () => {
  it("returns null when no distance is provided", () => {
    expect(calcNorthSlant("第一種低層住居専用地域", null)).toBeNull();
  });

  it("computes 5m + 1.25×distance for low-rise residential zones", () => {
    const result = calcNorthSlant("第一種低層住居専用地域", 4);
    expect(result?.applicable).toBe(true);
    expect(result?.baseHeightM).toBe(5);
    expect(result?.heightLimitM).toBe(10); // 5 + 1.25*4
  });

  it("computes 10m + 1.25×distance for mid-rise residential zones", () => {
    const result = calcNorthSlant("第一種中高層住居専用地域", 4);
    expect(result?.applicable).toBe(true);
    expect(result?.baseHeightM).toBe(10);
    expect(result?.heightLimitM).toBe(15); // 10 + 1.25*4
  });

  it("marks the rule as not applicable for zones without north-side slant restrictions", () => {
    const result = calcNorthSlant("商業地域", 4);
    expect(result?.applicable).toBe(false);
    expect(result?.heightLimitM).toBeNull();
  });
});

describe("isLowRiseResidential / isMidRiseResidential", () => {
  it("classifies zones correctly", () => {
    expect(isLowRiseResidential("第一種低層住居専用地域")).toBe(true);
    expect(isLowRiseResidential("田園住居地域")).toBe(true);
    expect(isMidRiseResidential("第二種中高層住居専用地域")).toBe(true);
    expect(isLowRiseResidential("第一種住居地域")).toBe(false);
    expect(isMidRiseResidential("第一種住居地域")).toBe(false);
  });
});
