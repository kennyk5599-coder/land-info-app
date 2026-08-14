import { sqmToTsubo, tsuboToSqm } from "./geoConversions.js";

export interface BuildableOverview {
  designatedCoverageRatioPercent: number;
  appliedCoverageRatioPercent: number;
  cornerLotBonusApplied: boolean;
  maxFootprintSqm: number;
  maxFootprintTsubo: number;
  designatedFarRatioPercent: number;
  appliedFarRatioPercent: number;
  farRestrictedByRoadWidth: boolean;
  roadWidthFarCapPercent: number | null;
  maxTotalFloorAreaSqm: number;
  maxTotalFloorAreaTsubo: number;
  estimatedFloors: number | null;
  suggestedUses: string[];
  disclaimer: string;
}

const DISCLAIMER =
  "容積率は前面道路幅員による制限を、建蔽率は角地の有無による緩和(該当する場合)を考慮していますが、実際の適用条件(角地の指定基準、2つ以上の道路に接する場合の特例など)は自治体により異なります。また、道路斜線制限・絶対高さ制限などの高さに関する法令は考慮していません。想定階数・用途はあくまで参考情報です。正式な建築計画の際は必ず自治体・建築士にご確認ください。";

const CORNER_LOT_COVERAGE_BONUS_PERCENT = 10;
const MAX_COVERAGE_RATIO_PERCENT = 100;

/** All 12 standard use-area (用途地域) names classified as "residential" contain 住居. */
function isResidentialZone(zoneName: string | null): boolean {
  return !!zoneName && zoneName.includes("住居");
}

/**
 * Building Standards Act: when the front road is narrower than 12m, the
 * applicable FAR is capped at roadWidthM × 0.4 (residential zones) or × 0.6
 * (other zones). Returns null when the road is wide enough that this rule
 * does not apply.
 */
function calcRoadWidthFarCapPercent(
  frontRoadWidthM: number,
  zoneName: string | null
): number | null {
  if (frontRoadWidthM >= 12) return null;
  const multiplier = isResidentialZone(zoneName) ? 0.4 : 0.6;
  return frontRoadWidthM * multiplier * 100;
}

/** Rough, zone-based building-use suggestions — reference only, not a design proposal. */
function suggestedBuildingUses(zoneName: string | null): string[] {
  if (!zoneName) return [];
  if (zoneName.includes("低層住居専用") || zoneName === "田園住居地域") {
    return ["戸建て住宅", "二世帯住宅"];
  }
  if (zoneName.includes("中高層住居専用")) {
    return ["共同住宅(低〜中層マンション)", "二世帯住宅"];
  }
  if (zoneName.includes("住居地域") || zoneName === "準住居地域") {
    return ["共同住宅(マンション・アパート)", "戸建て住宅", "小規模店舗併用住宅"];
  }
  if (zoneName.includes("商業地域")) {
    return ["店舗", "事務所ビル", "店舗・住居複合ビル"];
  }
  if (zoneName.includes("工業")) {
    return ["倉庫", "工場", "事務所"];
  }
  return [];
}

export function calcBuildableOverview(
  landAreaTsubo: number,
  coverageRatioPercent: number,
  designatedFarRatioPercent: number,
  zoneName: string | null,
  frontRoadWidthM: number | null,
  isCornerLot: boolean
): BuildableOverview {
  const landAreaSqm = tsuboToSqm(landAreaTsubo);

  let appliedCoverageRatioPercent = coverageRatioPercent;
  const cornerLotBonusApplied = isCornerLot && coverageRatioPercent < MAX_COVERAGE_RATIO_PERCENT;
  if (cornerLotBonusApplied) {
    appliedCoverageRatioPercent = Math.min(
      coverageRatioPercent + CORNER_LOT_COVERAGE_BONUS_PERCENT,
      MAX_COVERAGE_RATIO_PERCENT
    );
  }

  const maxFootprintSqm = landAreaSqm * (appliedCoverageRatioPercent / 100);

  let appliedFarRatioPercent = designatedFarRatioPercent;
  let farRestrictedByRoadWidth = false;
  let roadWidthFarCapPercent: number | null = null;

  if (frontRoadWidthM !== null && frontRoadWidthM > 0) {
    const cap = calcRoadWidthFarCapPercent(frontRoadWidthM, zoneName);
    if (cap !== null) {
      roadWidthFarCapPercent = round2(cap);
      if (cap < designatedFarRatioPercent) {
        appliedFarRatioPercent = cap;
        farRestrictedByRoadWidth = true;
      }
    }
  }

  const maxTotalFloorAreaSqm = landAreaSqm * (appliedFarRatioPercent / 100);
  const estimatedFloors =
    maxFootprintSqm > 0 ? Math.max(1, Math.ceil(maxTotalFloorAreaSqm / maxFootprintSqm)) : null;

  return {
    designatedCoverageRatioPercent: coverageRatioPercent,
    appliedCoverageRatioPercent: round2(appliedCoverageRatioPercent),
    cornerLotBonusApplied,
    maxFootprintSqm: round2(maxFootprintSqm),
    maxFootprintTsubo: round2(sqmToTsubo(maxFootprintSqm)),
    designatedFarRatioPercent,
    appliedFarRatioPercent: round2(appliedFarRatioPercent),
    farRestrictedByRoadWidth,
    roadWidthFarCapPercent,
    maxTotalFloorAreaSqm: round2(maxTotalFloorAreaSqm),
    maxTotalFloorAreaTsubo: round2(sqmToTsubo(maxTotalFloorAreaSqm)),
    estimatedFloors,
    suggestedUses: suggestedBuildingUses(zoneName),
    disclaimer: DISCLAIMER,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// exported for tests
export { isResidentialZone, calcRoadWidthFarCapPercent, suggestedBuildingUses };
