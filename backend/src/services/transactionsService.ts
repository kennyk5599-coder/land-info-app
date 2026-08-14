import { bboxToTiles, circleToBBox } from "../lib/tileMath.js";
import { distanceMeters } from "../lib/haversine.js";
import { parseAreaSqm, parsePointInTime, parsePriceYen } from "../lib/reinfolibParsers.js";
import { fetchTransactionTile } from "./reinfolibClient.js";
import type { TransactionPointFeature } from "../types/reinfolib.js";

const TRANSACTIONS_ZOOM = 15;
const RADIUS_M = 500;
const FALLBACK_RADII_M = [1000, 1500];
const YEARS_BACK = 3;

export interface TransactionItem {
  transactionPeriod: string;
  year: number | null;
  quarter: number | null;
  lat: number;
  lng: number;
  priceYen: number | null;
  /** The area figure reinfolib reports; what it represents depends on areaLabel. */
  areaSqm: number | null;
  /** "土地面積" for land sales, "専有面積" for condo units, "面積" otherwise. */
  areaLabel: string;
  /** Building total floor area, only populated for 宅地(土地と建物) transactions. */
  buildingTotalFloorAreaSqm: number | null;
  landType: string;
  buildingStructure: string;
  distanceM: number;
}

export interface TransactionsResult {
  count: number;
  radiusM: number;
  periodFrom: string;
  periodTo: string;
  items: TransactionItem[];
  /** Present only when the primary radius found nothing and a wider search was tried. */
  expandedRadiusM: number | null;
  expandedCount: number | null;
  expandedItems: TransactionItem[];
}

function currentPeriodCode(): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}${quarter}`;
}

function periodCodeYearsAgo(years: number): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear() - years}${quarter}`;
}

function areaLabelForLandType(landType: string): string {
  if (landType.includes("土地")) return "土地面積";
  if (landType.includes("マンション")) return "専有面積";
  return "面積";
}

/** Restrict results to 宅地(土地) / 宅地(土地と建物); excludes 中古マンション等 and other non-land types. */
function isLandTransaction(landType: string): boolean {
  return landType.includes("土地");
}

async function searchWithinRadius(
  lng: number,
  lat: number,
  radiusM: number,
  from: string,
  to: string
): Promise<TransactionItem[]> {
  const bbox = circleToBBox(lng, lat, radiusM);
  const tiles = bboxToTiles(bbox, TRANSACTIONS_ZOOM);

  const seen = new Set<string>();
  const items: TransactionItem[] = [];

  for (const tile of tiles) {
    const collection = await fetchTransactionTile(tile, from, to);
    for (const feature of collection.features as TransactionPointFeature[]) {
      const [flng, flat] = feature.geometry.coordinates;
      const distanceM = distanceMeters(lng, lat, flng, flat);
      if (distanceM > radiusM) continue;

      const landType = feature.properties.land_type_name_ja;
      if (!isLandTransaction(landType)) continue;

      const key = `${feature.geometry.coordinates.join(",")}:${feature.properties.point_in_time_name_ja}:${feature.properties.u_transaction_price_total_ja}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const pointInTime = parsePointInTime(feature.properties.point_in_time_name_ja);

      items.push({
        transactionPeriod: feature.properties.point_in_time_name_ja,
        year: pointInTime?.year ?? null,
        quarter: pointInTime?.quarter ?? null,
        lat: flat,
        lng: flng,
        priceYen: parsePriceYen(feature.properties.u_transaction_price_total_ja),
        areaSqm: parseAreaSqm(feature.properties.u_area_ja),
        areaLabel: areaLabelForLandType(landType),
        buildingTotalFloorAreaSqm: parseAreaSqm(feature.properties.u_building_total_floor_area_ja),
        landType,
        buildingStructure: feature.properties.building_structure_name_ja,
        distanceM: Math.round(distanceM),
      });
    }
  }

  items.sort((a, b) => {
    const aKey = (a.year ?? 0) * 10 + (a.quarter ?? 0);
    const bKey = (b.year ?? 0) * 10 + (b.quarter ?? 0);
    return bKey - aKey; // most recent first
  });
  return items;
}

export async function findNearbyTransactions(
  lng: number,
  lat: number
): Promise<TransactionsResult> {
  const from = periodCodeYearsAgo(YEARS_BACK);
  const to = currentPeriodCode();

  const items = await searchWithinRadius(lng, lat, RADIUS_M, from, to);

  let expandedRadiusM: number | null = null;
  let expandedItems: TransactionItem[] = [];

  if (items.length === 0) {
    for (const radius of FALLBACK_RADII_M) {
      const fallbackItems = await searchWithinRadius(lng, lat, radius, from, to);
      if (fallbackItems.length > 0) {
        expandedRadiusM = radius;
        expandedItems = fallbackItems;
        break;
      }
    }
  }

  return {
    count: items.length,
    radiusM: RADIUS_M,
    periodFrom: from,
    periodTo: to,
    items,
    expandedRadiusM,
    expandedCount: expandedRadiusM ? expandedItems.length : null,
    expandedItems,
  };
}

// exported for tests
export { currentPeriodCode, periodCodeYearsAgo, areaLabelForLandType, isLandTransaction };
