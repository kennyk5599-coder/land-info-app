import { StyleSheet, Text, View } from "react-native";
import type { ZoningResult } from "../types/api";

export function ZoningSummaryCard({ zoning }: { zoning: ZoningResult }) {
  if (zoning.warnings.includes("zone_not_resolved")) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>用途地域</Text>
        <Text style={styles.warning}>
          この地点の用途地域を自動判定できませんでした。お手数ですが自治体窓口でご確認ください。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>用途地域</Text>
      <Text style={styles.zoneName}>{zoning.zoneName ?? "不明"}</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>建蔽率</Text>
          <Text style={styles.statValue}>
            {zoning.coverageRatioPercent !== null ? `${zoning.coverageRatioPercent}%` : "-"}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>容積率</Text>
          <Text style={styles.statValue}>
            {zoning.farRatioPercent !== null ? `${zoning.farRatioPercent}%` : "-"}
          </Text>
        </View>
      </View>
      {zoning.municipality && <Text style={styles.municipality}>{zoning.municipality}</Text>}
      {zoning.multipleZonesDetected && (
        <Text style={styles.warning}>
          この地点は複数の用途地域にまたがっている可能性があります。参考値としてご利用ください。
        </Text>
      )}
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
  title: { fontSize: 13, color: "#666", marginBottom: 4 },
  zoneName: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  row: { flexDirection: "row", gap: 24 },
  stat: { flex: 1 },
  statLabel: { fontSize: 12, color: "#888" },
  statValue: { fontSize: 18, fontWeight: "600" },
  municipality: { marginTop: 8, fontSize: 13, color: "#888" },
  warning: { marginTop: 8, fontSize: 13, color: "#b45309" },
});
