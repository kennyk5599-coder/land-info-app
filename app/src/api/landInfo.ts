import { apiClient } from "./client";
import type { LandInfoRequest, LandInfoResponse } from "../types/api";

export async function fetchLandInfo(payload: LandInfoRequest): Promise<LandInfoResponse> {
  const res = await apiClient.post<LandInfoResponse>("/land-info", payload);
  return res.data;
}
