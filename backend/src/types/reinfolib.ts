import type { Feature, FeatureCollection, MultiPolygon, Point } from "geojson";

/** XKT002 (都市計画決定GISデータ／用途地域) feature properties, as observed from the live API. */
export interface ZoningProperties {
  prefecture: string;
  city_name: string;
  city_code: string;
  use_area_ja: string;
  u_building_coverage_ratio_ja: string;
  u_floor_area_ratio_ja: string;
  youto_id: number;
  [key: string]: unknown;
}

export type ZoningFeature = Feature<MultiPolygon, ZoningProperties>;
export type ZoningFeatureCollection = FeatureCollection<MultiPolygon, ZoningProperties>;

/** XPT001 (不動産価格のポイント) feature properties, as observed from the live API. */
export interface TransactionPointProperties {
  point_in_time_name_ja: string;
  land_type_name_ja: string;
  price_information_category_name_ja: string;
  prefecture_name_ja: string;
  city_name_ja: string;
  district_name_ja: string;
  u_transaction_price_total_ja: string;
  u_area_ja: string;
  u_building_total_floor_area_ja: string;
  building_structure_name_ja: string;
  floor_plan_name_ja: string;
  u_construction_year_ja: string;
  land_use_name_ja: string;
  u_building_coverage_ratio_ja: string;
  u_floor_area_ratio_ja: string;
  [key: string]: unknown;
}

export type TransactionPointFeature = Feature<Point, TransactionPointProperties>;
export type TransactionPointFeatureCollection = FeatureCollection<
  Point,
  TransactionPointProperties
>;
