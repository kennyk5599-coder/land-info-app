import type { BuildableOverview } from "../lib/buildableCalc.js";
import type { NorthSlantResult } from "../lib/northSlant.js";
import type { ZoningResult } from "../services/zoningService.js";
import type { TransactionsResult } from "../services/transactionsService.js";

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
