import { describe, expect, it } from "vitest";
import { bboxToTiles, circleToBBox, lngLatToTile } from "../src/lib/tileMath.js";

describe("lngLatToTile", () => {
  it("computes the known tile for Tokyo Station at z=13", () => {
    // Verified against the reinfolib API during Phase 0 (XKT002/XPT001 both
    // returned valid data for this tile).
    expect(lngLatToTile(139.767125, 35.681236, 13)).toEqual({ x: 7276, y: 3225, z: 13 });
  });
});

describe("circleToBBox / bboxToTiles", () => {
  it("covers a 500m radius with at least one tile and includes the center tile", () => {
    const lng = 139.767125;
    const lat = 35.681236;
    const z = 15;

    const bbox = circleToBBox(lng, lat, 500);
    const tiles = bboxToTiles(bbox, z);
    const centerTile = lngLatToTile(lng, lat, z);

    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles).toContainEqual(centerTile);
  });
});
