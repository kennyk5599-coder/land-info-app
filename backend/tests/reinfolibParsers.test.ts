import { describe, expect, it } from "vitest";
import {
  parseAreaSqm,
  parsePercent,
  parsePointInTime,
  parsePriceYen,
} from "../src/lib/reinfolibParsers.js";

describe("reinfolibParsers", () => {
  it("parses percent strings", () => {
    expect(parsePercent("80.0%")).toBe(80);
    expect(parsePercent("600%")).toBe(600);
    expect(parsePercent(null)).toBeNull();
  });

  it("parses area strings", () => {
    expect(parseAreaSqm("40㎡")).toBe(40);
    expect(parseAreaSqm("1,234.5㎡")).toBe(1234.5);
  });

  it("parses price strings in 万円/億円", () => {
    expect(parsePriceYen("7,500万円")).toBe(75_000_000);
    expect(parsePriceYen("1億2,300万円")).toBe(123_000_000);
    expect(parsePriceYen(null)).toBeNull();
  });

  it("parses point-in-time strings", () => {
    expect(parsePointInTime("2024年第4四半期")).toEqual({ year: 2024, quarter: 4 });
    expect(parsePointInTime("")).toBeNull();
  });
});
