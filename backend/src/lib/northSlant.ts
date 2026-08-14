export interface NorthSlantResult {
  applicable: boolean;
  baseHeightM: number | null;
  heightLimitM: number | null;
  note: string;
}

const SLOPE_RATIO = 1.25;

function isLowRiseResidential(zoneName: string | null): boolean {
  if (!zoneName) return false;
  return zoneName.includes("低層住居専用") || zoneName === "田園住居地域";
}

function isMidRiseResidential(zoneName: string | null): boolean {
  if (!zoneName) return false;
  return zoneName.includes("中高層住居専用");
}

/**
 * Building Standards Act Art. 56-1-3 (北側斜線制限): only applies to
 * 低層住居専用地域/田園住居地域 (base 5m) and 中高層住居専用地域 (base 10m).
 * Height limit at a point `northBoundaryDistanceM` from the north boundary
 * = base + 1.25 × distance. This is informational only — it does not by
 * itself determine a buildable floor area, since that also depends on the
 * building's footprint/shape at each height, which is not known here.
 */
export function calcNorthSlant(
  zoneName: string | null,
  northBoundaryDistanceM: number | null
): NorthSlantResult | null {
  if (northBoundaryDistanceM === null) return null;

  if (isLowRiseResidential(zoneName)) {
    const baseHeightM = 5;
    return {
      applicable: true,
      baseHeightM,
      heightLimitM: round2(baseHeightM + SLOPE_RATIO * northBoundaryDistanceM),
      note: "低層住居専用地域・田園住居地域の基準(5m + 1.25×北側境界線までの距離)による参考値です。",
    };
  }

  if (isMidRiseResidential(zoneName)) {
    const baseHeightM = 10;
    return {
      applicable: true,
      baseHeightM,
      heightLimitM: round2(baseHeightM + SLOPE_RATIO * northBoundaryDistanceM),
      note: "中高層住居専用地域の基準(10m + 1.25×北側境界線までの距離)による参考値です。日影規制が適用される場合は別途制限される可能性があります。",
    };
  }

  return {
    applicable: false,
    baseHeightM: null,
    heightLimitM: null,
    note: "この用途地域には北側斜線制限は適用されません。",
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// exported for tests
export { isLowRiseResidential, isMidRiseResidential };
