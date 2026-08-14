import { lngLatToTile } from "../lib/tileMath.js";
import { findContainingFeature } from "../lib/pointInPolygon.js";
import { parsePercent } from "../lib/reinfolibParsers.js";
import { fetchZoningTile } from "./reinfolibClient.js";

const ZONING_ZOOM = 15;
// Tile-edge neighbors to also check if the point's own tile yields no match.
const NEIGHBOR_OFFSETS = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

export interface ZoningResult {
  zoneName: string | null;
  coverageRatioPercent: number | null;
  farRatioPercent: number | null;
  municipality: string | null;
  multipleZonesDetected: boolean;
  warnings: string[];
}

export async function resolveZoning(lng: number, lat: number): Promise<ZoningResult> {
  const baseTile = lngLatToTile(lng, lat, ZONING_ZOOM);

  let matches = findContainingFeature(lng, lat, (await fetchZoningTile(baseTile)).features);

  if (matches.length === 0) {
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      const neighborTile = { x: baseTile.x + dx, y: baseTile.y + dy, z: ZONING_ZOOM };
      const neighborFeatures = (await fetchZoningTile(neighborTile)).features;
      matches = findContainingFeature(lng, lat, neighborFeatures);
      if (matches.length > 0) break;
    }
  }

  if (matches.length === 0) {
    return {
      zoneName: null,
      coverageRatioPercent: null,
      farRatioPercent: null,
      municipality: null,
      multipleZonesDetected: false,
      warnings: ["zone_not_resolved"],
    };
  }

  const primary = matches[0].properties;
  return {
    zoneName: primary.use_area_ja || null,
    coverageRatioPercent: parsePercent(primary.u_building_coverage_ratio_ja),
    farRatioPercent: parsePercent(primary.u_floor_area_ratio_ja),
    municipality: primary.city_name || null,
    multipleZonesDetected: matches.length > 1,
    warnings: [],
  };
}
