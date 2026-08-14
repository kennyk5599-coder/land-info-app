import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Same conversion factor used by the backend (lib/geoConversions.ts).
const SQM_PER_TSUBO = 400 / 121;

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  return (Math.round(value * 100) / 100).toString();
}

export interface SubmitOptions {
  frontRoadWidthM: number | null;
  isCornerLot: boolean;
  northBoundaryDistanceM: number | null;
}

interface Props {
  onSubmit: (address: string, areaTsubo: number, options: SubmitOptions) => void;
  loading: boolean;
  errorMessage: string | null;
}

export function InputScreen({ onSubmit, loading, errorMessage }: Props) {
  const [address, setAddress] = useState("");
  const [areaTsubo, setAreaTsubo] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [frontRoadWidthM, setFrontRoadWidthM] = useState("");
  const [isCornerLot, setIsCornerLot] = useState(false);
  const [northBoundaryDistanceM, setNorthBoundaryDistanceM] = useState("");

  function handleTsuboChange(text: string) {
    setAreaTsubo(text);
    const parsed = Number(text);
    setAreaSqm(text.trim() !== "" && parsed > 0 ? formatNumber(parsed * SQM_PER_TSUBO) : "");
  }

  function handleSqmChange(text: string) {
    setAreaSqm(text);
    const parsed = Number(text);
    setAreaTsubo(text.trim() !== "" && parsed > 0 ? formatNumber(parsed / SQM_PER_TSUBO) : "");
  }

  const parsedTsubo = Number(areaTsubo);
  const parsedRoadWidth = frontRoadWidthM.trim() === "" ? null : Number(frontRoadWidthM);
  const roadWidthValid = parsedRoadWidth === null || parsedRoadWidth > 0;
  const parsedNorthDistance =
    northBoundaryDistanceM.trim() === "" ? null : Number(northBoundaryDistanceM);
  const northDistanceValid = parsedNorthDistance === null || parsedNorthDistance > 0;
  const canSubmit =
    address.trim().length > 0 &&
    parsedTsubo > 0 &&
    roadWidthValid &&
    northDistanceValid &&
    !loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.heading}>土地情報を調べる</Text>
      <Text style={styles.subheading}>
        東京都・神奈川県・千葉県・埼玉県内の住所と面積を入力してください
      </Text>

      <Text style={styles.label}>住所</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="例: 東京都千代田区丸の内1-1-1"
        autoCapitalize="none"
      />

      <Text style={styles.label}>面積</Text>
      <View style={styles.areaRow}>
        <View style={styles.areaField}>
          <TextInput
            style={styles.input}
            value={areaTsubo}
            onChangeText={handleTsuboChange}
            placeholder="例: 30"
            keyboardType="numeric"
          />
          <Text style={styles.areaUnit}>坪</Text>
        </View>
        <View style={styles.areaField}>
          <TextInput
            style={styles.input}
            value={areaSqm}
            onChangeText={handleSqmChange}
            placeholder="例: 99.17"
            keyboardType="numeric"
          />
          <Text style={styles.areaUnit}>m²</Text>
        </View>
      </View>
      <Text style={styles.hint}>どちらかに入力すると、もう一方が自動的に換算されます。</Text>

      <Text style={styles.label}>前面道路幅員(m)・任意</Text>
      <TextInput
        style={styles.input}
        value={frontRoadWidthM}
        onChangeText={setFrontRoadWidthM}
        placeholder="例: 4"
        keyboardType="numeric"
      />
      <Text style={styles.hint}>
        入力すると、前面道路幅員による容積率の制限(住居系は幅員×40%、それ以外は×60%)を反映します。未入力の場合は指定容積率のみで計算します。
      </Text>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setIsCornerLot((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isCornerLot && styles.checkboxChecked]}>
          {isCornerLot && <Text style={styles.checkboxMark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>角地(2つの道路に接する敷地)・任意</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        チェックすると、角地緩和(建蔽率+10%、上限100%)を反映します。適用条件は自治体により異なるため参考値です。
      </Text>

      <Text style={styles.label}>北側隣地境界線までの距離(m)・任意</Text>
      <TextInput
        style={styles.input}
        value={northBoundaryDistanceM}
        onChangeText={setNorthBoundaryDistanceM}
        placeholder="例: 3"
        keyboardType="numeric"
      />
      <Text style={styles.hint}>
        入力すると、その距離における北側斜線制限の高さ制限(参考値)を表示します。低層・中高層住居専用地域等にのみ適用されます。
      </Text>

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        disabled={!canSubmit}
        onPress={() =>
          onSubmit(address.trim(), parsedTsubo, {
            frontRoadWidthM: parsedRoadWidth,
            isCornerLot,
            northBoundaryDistanceM: parsedNorthDistance,
          })
        }
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>調べる</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f5f5f5" },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subheading: { fontSize: 13, color: "#666", marginBottom: 24 },
  label: { fontSize: 13, color: "#444", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  areaRow: { flexDirection: "row", gap: 12 },
  areaField: { flex: 1 },
  areaUnit: { fontSize: 11, color: "#999", marginTop: 4, textAlign: "right" },
  hint: { fontSize: 11, color: "#999", marginTop: 6, lineHeight: 15 },
  error: { color: "#dc2626", marginTop: 16, fontSize: 13 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  checkboxMark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  checkboxLabel: { fontSize: 13, color: "#444" },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
