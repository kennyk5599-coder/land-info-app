import { StyleSheet, Text, View } from "react-native";
import type { TransactionItem } from "../types/api";

function formatYen(yen: number | null): string {
  if (yen === null) return "-";
  if (yen >= 100_000_000) return `${(yen / 100_000_000).toFixed(2)}億円`;
  return `${Math.round(yen / 10_000).toLocaleString()}万円`;
}

export function TransactionListItem({ item }: { item: TransactionItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.period}>{item.transactionPeriod}</Text>
        <Text style={styles.meta}>
          {item.landType}
          {item.buildingStructure ? ` ・ ${item.buildingStructure}` : ""}
        </Text>
        <Text style={styles.areaLine}>
          {item.areaLabel}: {item.areaSqm ?? "-"}m²
          {item.buildingTotalFloorAreaSqm !== null
            ? ` ・ 建物延床面積: ${item.buildingTotalFloorAreaSqm}m²`
            : ""}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatYen(item.priceYen)}</Text>
        <Text style={styles.meta}>{item.distanceM}m</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  left: { flex: 1, paddingRight: 8 },
  right: { alignItems: "flex-end" },
  period: { fontSize: 13, fontWeight: "600" },
  price: { fontSize: 14, fontWeight: "600" },
  meta: { fontSize: 12, color: "#888", marginTop: 2 },
  areaLine: { fontSize: 12, color: "#888", marginTop: 2 },
});
