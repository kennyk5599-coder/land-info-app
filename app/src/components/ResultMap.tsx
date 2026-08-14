import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon, icon } from "leaflet";
import type { TransactionItem } from "../types/api";

// Load Leaflet's CSS at runtime instead of a static import — avoids depending
// on Expo web's bundler CSS-loading behavior, which varies by SDK version.
function useLeafletCss() {
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);
}

const singleTransactionIcon = icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function groupCountIcon(count: number) {
  const size = count >= 100 ? 34 : count >= 10 ? 30 : 26;
  return divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.5);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const targetIcon = divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#dc2626;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function formatYen(yen: number | null): string {
  if (yen === null) return "-";
  if (yen >= 100_000_000) return `${(yen / 100_000_000).toFixed(2)}億円`;
  return `${Math.round(yen / 10_000).toLocaleString()}万円`;
}

interface Props {
  lat: number;
  lng: number;
  radiusM: number;
  items: TransactionItem[];
}

interface CoordGroup {
  lat: number;
  lng: number;
  items: TransactionItem[];
}

// Many transactions share an identical anonymized coordinate (same building,
// different quarters/units), so plotting one marker per item would stack
// them invisibly on top of each other. Group by coordinate instead.
function groupByCoordinate(items: TransactionItem[]): CoordGroup[] {
  const groups = new Map<string, CoordGroup>();
  for (const item of items) {
    const key = `${item.lat},${item.lng}`;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, { lat: item.lat, lng: item.lng, items: [item] });
    }
  }
  return Array.from(groups.values());
}

// reinfolib reports transactions by quarter, not by exact date, so "the last
// 3 months" is approximated as "the single most recent quarter present in
// this result set".
function filterToLatestQuarter(items: TransactionItem[]): {
  filtered: TransactionItem[];
  latestPeriod: string | null;
} {
  let latestKey = -1;
  let latestPeriod: string | null = null;
  for (const item of items) {
    if (item.year === null || item.quarter === null) continue;
    const key = item.year * 10 + item.quarter;
    if (key > latestKey) {
      latestKey = key;
      latestPeriod = item.transactionPeriod;
    }
  }
  if (latestKey === -1) return { filtered: [], latestPeriod: null };
  const filtered = items.filter((item) => (item.year ?? 0) * 10 + (item.quarter ?? 0) === latestKey);
  return { filtered, latestPeriod };
}

export function ResultMap({ lat, lng, radiusM, items }: Props) {
  useLeafletCss();
  const { filtered, latestPeriod } = useMemo(() => filterToLatestQuarter(items), [items]);
  const groups = useMemo(() => groupByCoordinate(filtered), [filtered]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        地図(対象地・周辺取引){latestPeriod ? ` ・ ${latestPeriod}の実績のみ表示` : ""}
      </Text>
      <View style={styles.mapWrapper}>
        <MapContainer center={[lat, lng]} zoom={16} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={[lat, lng]}
            radius={radiusM}
            pathOptions={{ color: "#dc2626", fillOpacity: 0.05 }}
          />
          <Marker position={[lat, lng]} icon={targetIcon}>
            <Popup>対象地</Popup>
          </Marker>
          {groups.map((group, index) => (
            <Marker
              key={index}
              position={[group.lat, group.lng]}
              icon={group.items.length > 1 ? groupCountIcon(group.items.length) : singleTransactionIcon}
            >
              <Popup minWidth={280} maxWidth={360}>
                <View style={styles.popupList}>
                  {group.items.length > 1 && (
                    <Text style={styles.popupCount}>この地点の取引: {group.items.length}件</Text>
                  )}
                  {group.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.popupItem}>
                      <Text style={styles.popupItemPeriodPrice}>
                        {item.transactionPeriod} ・ {formatYen(item.priceYen)}
                      </Text>
                      <Text style={styles.popupItemDetail}>
                        {item.areaLabel}: {item.areaSqm ?? "-"}m² ・ 距離: {item.distanceM}m
                      </Text>
                    </View>
                  ))}
                </View>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </View>
      <Text style={styles.legend}>
        赤い点: 対象地 ・ 青いピン: 取引地点(数字は同一地点の件数) ・ ピンをタップすると詳細を表示
        {latestPeriod === null ? "\n(直近の取引実績が見つかりませんでした)" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 13, color: "#666", marginBottom: 12 },
  mapWrapper: {
    height: 380,
    borderRadius: 8,
    overflow: "hidden",
  },
  legend: { fontSize: 11, color: "#999", marginTop: 8 },
  popupList: { maxHeight: 280, overflow: "scroll" as const, paddingRight: 4 },
  popupCount: { fontWeight: "700", fontSize: 15, marginBottom: 8 },
  popupItem: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  popupItemPeriodPrice: { fontSize: 14, fontWeight: "600" },
  popupItemDetail: { fontSize: 13, color: "#555", marginTop: 2 },
});
