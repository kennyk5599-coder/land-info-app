import distance from "@turf/distance";
import { point } from "@turf/helpers";

/** Great-circle distance between two lng/lat points, in meters. */
export function distanceMeters(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  return distance(point([lng1, lat1]), point([lng2, lat2]), { units: "meters" });
}
