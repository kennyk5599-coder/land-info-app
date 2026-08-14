import { describe, expect, it } from "vitest";
import { sqmToTsubo, tsuboToSqm } from "../src/lib/geoConversions.js";

describe("geoConversions", () => {
  it("converts 1 tsubo to ~3.305785 sqm", () => {
    expect(tsuboToSqm(1)).toBeCloseTo(3.305785, 6);
  });

  it("round-trips tsubo -> sqm -> tsubo", () => {
    expect(sqmToTsubo(tsuboToSqm(30))).toBeCloseTo(30, 6);
  });
});
