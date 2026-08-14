import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Feature, GeoJsonProperties, MultiPolygon, Polygon } from "geojson";

export function findContainingFeature<P extends GeoJsonProperties>(
  lng: number,
  lat: number,
  features: Feature<Polygon | MultiPolygon, P>[]
): Feature<Polygon | MultiPolygon, P>[] {
  const pt = point([lng, lat]);
  return features.filter((feature) => booleanPointInPolygon(pt, feature));
}
