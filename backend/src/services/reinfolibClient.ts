import axios from "axios";
import pRetry from "p-retry";
import { env } from "../config/env.js";
import type { Tile } from "../lib/tileMath.js";
import type { ZoningFeatureCollection, TransactionPointFeatureCollection } from "../types/reinfolib.js";
import { tileCache } from "../cache/tileCache.js";

const BASE_URL = "https://www.reinfolib.mlit.go.jp/ex-api/external";

const client = axios.create({
  headers: { "Ocp-Apim-Subscription-Key": env.reinfolibApiKey },
  timeout: 15_000,
});

async function getWithRetry<T>(url: string): Promise<T> {
  return pRetry(
    async () => {
      const res = await client.get<T>(url);
      return res.data;
    },
    { retries: 2 }
  );
}

export async function fetchZoningTile(tile: Tile): Promise<ZoningFeatureCollection> {
  const cacheKey = `xkt002:${tile.z}:${tile.x}:${tile.y}`;
  const cached = tileCache.get(cacheKey) as ZoningFeatureCollection | undefined;
  if (cached) return cached;

  const url = `${BASE_URL}/XKT002?response_format=geojson&z=${tile.z}&x=${tile.x}&y=${tile.y}`;
  const data = await getWithRetry<ZoningFeatureCollection>(url);
  tileCache.set(cacheKey, data, { ttl: 1000 * 60 * 60 * 24 * 7 }); // zoning rarely changes: 7 days
  return data;
}

export async function fetchTransactionTile(
  tile: Tile,
  from: string,
  to: string
): Promise<TransactionPointFeatureCollection> {
  const cacheKey = `xpt001:${tile.z}:${tile.x}:${tile.y}:${from}:${to}`;
  const cached = tileCache.get(cacheKey) as TransactionPointFeatureCollection | undefined;
  if (cached) return cached;

  const url = `${BASE_URL}/XPT001?response_format=geojson&z=${tile.z}&x=${tile.x}&y=${tile.y}&from=${from}&to=${to}`;
  const data = await getWithRetry<TransactionPointFeatureCollection>(url);
  tileCache.set(cacheKey, data, { ttl: 1000 * 60 * 60 * 24 }); // 1 day
  return data;
}
