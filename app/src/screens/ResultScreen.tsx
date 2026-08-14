import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { LandInfoResponse } from "../types/api";
import { ZoningSummaryCard } from "../components/ZoningSummaryCard";
import { BuildableOverviewCard } from "../components/BuildableOverviewCard";
import { TransactionListItem } from "../components/TransactionListItem";

interface Props {
  result: LandInfoResponse;
  onBack: () => void;
}

export function ResultScreen({ result, onBack }: Props) {
  const { transactions } = result;
  const usingExpanded = transactions.count === 0 && transactions.expandedRadiusM !== null;
  const displayedItems = usingExpanded ? transactions.expandedItems : transactions.items;
  const noResultsAtAll = transactions.count === 0 && transactions.expandedRadiusM === null;
  const mapRadiusM = usingExpanded ? transactions.expandedRadiusM ?? transactions.radiusM : transactions.radiusM;

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedItems}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item }) => <TransactionListItem item={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← 入力に戻る</Text>
            </TouchableOpacity>

            <Text style={styles.address}>{result.input.resolvedAddress ?? "-"}</Text>
            <Text style={styles.areaLine}>
              {result.input.areaTsubo}坪 ({result.input.areaSqm}m²)
            </Text>

            <ZoningSummaryCard zoning={result.zoning} />
            <BuildableOverviewCard overview={result.buildableOverview} northSlant={result.northSlant} />

            {Platform.OS === "web" ? (
              <MapSection
                lat={result.input.lat}
                lng={result.input.lng}
                radiusM={mapRadiusM}
                items={displayedItems}
              />
            ) : null}

            {usingExpanded ? (
              <>
                <Text style={styles.sectionTitle}>
                  周辺の取引実績(半径{transactions.radiusM}m ・ 過去3年 ・ 0件)
                </Text>
                <Text style={styles.expandedNotice}>
                  半径{transactions.radiusM}m以内には取引実績が見つかりませんでした。参考として、半径
                  {transactions.expandedRadiusM}m以内の実績({transactions.expandedCount}件)を表示します。
                </Text>
              </>
            ) : (
              <Text style={styles.sectionTitle}>
                周辺の取引実績(半径{transactions.radiusM}m ・ 過去3年 ・ {transactions.count}件 ・
                新しい順)
              </Text>
            )}

            {noResultsAtAll && (
              <Text style={styles.noTransactions}>
                半径{transactions.expandedRadiusM ?? transactions.radiusM}m圏内でも取引実績は見つかりませんでした。
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

// Leaflet is a DOM/browser-only library, so the map component is loaded
// lazily and only on web — importing it at the top level would crash native
// (iOS/Android) builds, which have no `document`/`window`.
function MapSection(props: {
  lat: number;
  lng: number;
  radiusM: number;
  items: LandInfoResponse["transactions"]["items"];
}) {
  const { ResultMap } = require("../components/ResultMap");
  return <ResultMap {...props} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  listContent: { padding: 20 },
  backButton: { marginBottom: 16 },
  backButtonText: { color: "#2563eb", fontSize: 14 },
  address: { fontSize: 18, fontWeight: "700" },
  areaLine: { fontSize: 13, color: "#666", marginBottom: 16 },
  sectionTitle: { fontSize: 13, color: "#666", marginTop: 8, marginBottom: 8 },
  expandedNotice: {
    fontSize: 12,
    color: "#b45309",
    marginBottom: 8,
    lineHeight: 17,
  },
  noTransactions: { fontSize: 13, color: "#888" },
});
