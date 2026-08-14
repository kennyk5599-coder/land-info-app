export interface Tile {
  x: number;
  y: number;
  z: number;
}

export interface BBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export function lngLatToTile(lng: number, lat: number, z: number): Tile {
  const n = Math.pow(2, z);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x: clampTileCoord(x, n), y: clampTileCoord(y, n), z };
}

function clampTileCoord(value: number, n: number): number {
  return Math.min(Math.max(value, 0), n - 1);
}

function tileToLngLat(x: number, y: number, z: number): { lng: number; lat: number } {
  const n = Math.pow(2, z);
  const lng = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const lat = (latRad * 180) / Math.PI;
  return { lng, lat };
}

/** Bounding box (in lng/lat) covering a circle of `radiusM` meters around a point. */
export function circleToBBox(lng: number, lat: number, radiusM: number): BBox {
  const latDelta = radiusM / 111320;
  const lngDelta = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
  return {
    minLng: lng - lngDelta,
    minLat: lat - latDelta,
    maxLng: lng + lngDelta,
    maxLat: lat + latDelta,
  };
}

/** Enumerates every tile at zoom `z` that intersects the given bounding box. */
export function bboxToTiles(bbox: BBox, z: number): Tile[] {
  const topLeft = lngLatToTile(bbox.minLng, bbox.maxLat, z);
  const bottomRight = lngLatToTile(bbox.maxLng, bbox.minLat, z);

  const tiles: Tile[] = [];
  for (let x = topLeft.x; x <= bottomRight.x; x++) {
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      tiles.push({ x, y, z });
    }
  }
  return tiles;
}

export { tileToLngLat };
