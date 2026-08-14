export interface GeocodeCandidate {
  resolvedAddress: string;
  lat: number;
  lng: number;
}

export interface ZoningResult {
  zoneName: string | null;
  coverageRatioPercent: number | null;
  farRatioPercent: number | null;
  municipality: string | null;
  multipleZonesDetected: boolean;
  warnings: string[];
}

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

export interface NorthSlantResult {
  applicable: boolean;
  baseHeightM: number | null;
  heightLimitM: number | null;
  note: string;
}

export interface TransactionItem {
  transactionPeriod: string;
  year: number | null;
  quarter: number | null;
  lat: number;
  lng: number;
  priceYen: number | null;
  areaSqm: number | null;
  areaLabel: string;
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
  expandedRadiusM: number | null;
  expandedCount: number | null;
  expandedItems: TransactionItem[];
}

export interface LandInfoRequest {
  address?: string;
  lat?: number;
  lng?: number;
  areaTsubo: number;
  frontRoadWidthM?: number;
  isCornerLot?: boolean;
  northBoundaryDistanceM?: number;
}

export interface LandInfoResponse {
  input: {
    resolvedAddress: string | null;
    lat: number;
    lng: number;
    areaTsubo: number;
    areaSqm: number;
  };
  zoning: ZoningResult;
  buildableOverview: BuildableOverview | null;
  northSlant: NorthSlantResult | null;
  transactions: TransactionsResult;
}

export interface NeedsDisambiguationError {
  error: "needs_disambiguation";
  candidates: GeocodeCandidate[];
}

export interface ApiError {
  error: string;
}
