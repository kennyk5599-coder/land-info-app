import { StyleSheet, Text, View } from "react-native";
import type { BuildableOverview, NorthSlantResult } from "../types/api";

export function BuildableOverviewCard({
  overview,
  northSlant,
}: {
  overview: BuildableOverview | null;
  northSlant: NorthSlantResult | null;
}) {
  if (!overview) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>建築可能な建物概要</Text>
        <Text style={styles.warning}>
          用途地域が確定できなかったため、建築可能概要を計算できませんでした。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>建築可能な建物概要</Text>

      {overview.cornerLotBonusApplied && (
        <Text style={styles.noticeText}>
          角地緩和により、建蔽率{overview.designatedCoverageRatioPercent}%が{" "}
          {overview.appliedCoverageRatioPercent}%になっています。
        </Text>
      )}
      {overview.farRestrictedByRoadWidth && (
        <Text style={styles.noticeText}>
          前面道路幅員により、指定容積率{overview.designatedFarRatioPercent}%が{" "}
          {overview.appliedFarRatioPercent}%に制限されています(幅員による上限:{" "}
          {overview.roadWidthFarCapPercent}%)。
        </Text>
      )}

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            最大建築面積{overview.cornerLotBonusApplied ? "(緩和後)" : ""}
          </Text>
          <Text style={styles.statValue}>{overview.maxFootprintSqm.toLocaleString()} m²</Text>
          <Text style={styles.statSub}>({overview.maxFootprintTsubo.toLocaleString()} 坪)</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            最大延床面積{overview.farRestrictedByRoadWidth ? "(制限後)" : ""}
          </Text>
          <Text style={styles.statValue}>
            {overview.maxTotalFloorAreaSqm.toLocaleString()} m²
          </Text>
          <Text style={styles.statSub}>
            ({overview.maxTotalFloorAreaTsubo.toLocaleString()} 坪)
          </Text>
        </View>
      </View>

      {(overview.estimatedFloors !== null || overview.suggestedUses.length > 0) && (
        <View style={styles.proposalBox}>
          <Text style={styles.proposalTitle}>建築プランの参考情報</Text>
          {overview.estimatedFloors !== null && (
            <Text style={styles.proposalLine}>想定階数: 約{overview.estimatedFloors}階</Text>
          )}
          {overview.suggestedUses.length > 0 && (
            <Text style={styles.proposalLine}>
              想定用途: {overview.suggestedUses.join(" / ")}
            </Text>
          )}
        </View>
      )}

      {northSlant && (
        <View style={styles.proposalBox}>
          <Text style={styles.proposalTitle}>北側斜線制限(参考)</Text>
          {northSlant.applicable ? (
            <Text style={styles.proposalLine}>
              入力いただいた距離での高さ制限の目安: 約{northSlant.heightLimitM}m
            </Text>
          ) : (
            <Text style={styles.proposalLine}>この用途地域には適用されません。</Text>
          )}
          <Text style={styles.proposalNote}>{northSlant.note}</Text>
        </View>
      )}

      <Text style={styles.disclaimer}>{overview.disclaimer}</Text>
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
  noticeText: {
    fontSize: 12,
    color: "#b45309",
    marginBottom: 12,
    lineHeight: 17,
  },
  row: { flexDirection: "row", gap: 24 },
  stat: { flex: 1 },
  statLabel: { fontSize: 12, color: "#888" },
  statValue: { fontSize: 18, fontWeight: "600" },
  statSub: { fontSize: 12, color: "#888" },
  proposalBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  proposalTitle: { fontSize: 12, fontWeight: "700", color: "#444", marginBottom: 6 },
  proposalLine: { fontSize: 13, color: "#333", marginBottom: 2 },
  proposalNote: { fontSize: 11, color: "#999", marginTop: 4, lineHeight: 15 },
  disclaimer: { marginTop: 12, fontSize: 11, color: "#999", lineHeight: 16 },
  warning: { fontSize: 13, color: "#b45309" },
});
