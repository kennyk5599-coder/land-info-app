import { Router } from "express";
import { geocodeAddress } from "../services/geocodeService.js";
import { resolveZoning } from "../services/zoningService.js";
import { findNearbyTransactions } from "../services/transactionsService.js";
import { calcBuildableOverview } from "../lib/buildableCalc.js";
import { calcNorthSlant } from "../lib/northSlant.js";
import { tsuboToSqm } from "../lib/geoConversions.js";
import type { LandInfoRequest, LandInfoResponse } from "../types/api.js";

export const landInfoRouter = Router();

landInfoRouter.post("/land-info", async (req, res) => {
  const body = req.body as LandInfoRequest;

  if (!body || typeof body.areaTsubo !== "number" || body.areaTsubo <= 0) {
    res.status(400).json({ error: "areaTsubo (positive number) is required" });
    return;
  }
  if (!body.address && (body.lat === undefined || body.lng === undefined)) {
    res.status(400).json({ error: "either address or lat/lng is required" });
    return;
  }
  if (
    body.frontRoadWidthM !== undefined &&
    (typeof body.frontRoadWidthM !== "number" || body.frontRoadWidthM <= 0)
  ) {
    res.status(400).json({ error: "frontRoadWidthM must be a positive number when provided" });
    return;
  }
  if (
    body.northBoundaryDistanceM !== undefined &&
    (typeof body.northBoundaryDistanceM !== "number" || body.northBoundaryDistanceM <= 0)
  ) {
    res
      .status(400)
      .json({ error: "northBoundaryDistanceM must be a positive number when provided" });
    return;
  }

  let lat: number;
  let lng: number;
  let resolvedAddress: string | null = null;

  if (body.lat !== undefined && body.lng !== undefined) {
    lat = body.lat;
    lng = body.lng;
  } else {
    let candidates;
    try {
      candidates = await geocodeAddress(body.address!);
    } catch {
      res.status(502).json({ error: "geocode_service_unavailable" });
      return;
    }

    if (candidates.length === 0) {
      res.status(404).json({ error: "address_not_found" });
      return;
    }
    if (candidates.length > 1) {
      res.status(409).json({ error: "needs_disambiguation", candidates });
      return;
    }

    lat = candidates[0].lat;
    lng = candidates[0].lng;
    resolvedAddress = candidates[0].resolvedAddress;
  }

  try {
    const [zoning, transactions] = await Promise.all([
      resolveZoning(lng, lat),
      findNearbyTransactions(lng, lat),
    ]);

    const buildableOverview =
      zoning.coverageRatioPercent !== null && zoning.farRatioPercent !== null
        ? calcBuildableOverview(
            body.areaTsubo,
            zoning.coverageRatioPercent,
            zoning.farRatioPercent,
            zoning.zoneName,
            body.frontRoadWidthM ?? null,
            body.isCornerLot ?? false
          )
        : null;

    const northSlant = calcNorthSlant(zoning.zoneName, body.northBoundaryDistanceM ?? null);

    const response: LandInfoResponse = {
      input: {
        resolvedAddress,
        lat,
        lng,
        areaTsubo: body.areaTsubo,
        areaSqm: Math.round(tsuboToSqm(body.areaTsubo) * 100) / 100,
      },
      zoning,
      buildableOverview,
      northSlant,
      transactions,
    };

    res.json(response);
  } catch {
    res.status(502).json({ error: "reinfolib_service_unavailable" });
  }
});
