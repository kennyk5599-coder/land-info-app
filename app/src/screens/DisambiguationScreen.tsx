import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { GeocodeCandidate } from "../types/api";

interface Props {
  candidates: GeocodeCandidate[];
  onSelect: (candidate: GeocodeCandidate) => void;
  onBack: () => void;
}

export function DisambiguationScreen({ candidates, onSelect, onBack }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← 入力に戻る</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>候補が複数見つかりました</Text>
      <Text style={styles.subheading}>該当する住所を選んでください</Text>
      <FlatList
        data={candidates}
        keyExtractor={(item, index) => `${item.resolvedAddress}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.candidate} onPress={() => onSelect(item)}>
            <Text style={styles.candidateText}>{item.resolvedAddress}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  backButton: { marginBottom: 16 },
  backButtonText: { color: "#2563eb", fontSize: 14 },
  heading: { fontSize: 18, fontWeight: "700" },
  subheading: { fontSize: 13, color: "#666", marginBottom: 16 },
  candidate: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  candidateText: { fontSize: 15 },
});
