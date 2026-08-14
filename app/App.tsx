import { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { InputScreen, SubmitOptions } from "./src/screens/InputScreen";
import { ResultScreen } from "./src/screens/ResultScreen";
import { DisambiguationScreen } from "./src/screens/DisambiguationScreen";
import { fetchLandInfo } from "./src/api/landInfo";
import type { GeocodeCandidate, LandInfoResponse } from "./src/types/api";

const queryClient = new QueryClient();

type Screen =
  | { kind: "input" }
  | {
      kind: "disambiguation";
      candidates: GeocodeCandidate[];
      areaTsubo: number;
      options: SubmitOptions;
    }
  | { kind: "result"; result: LandInfoResponse };

function AppContent() {
  const [screen, setScreen] = useState<Screen>({ kind: "input" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runLandInfo(payload: {
    address?: string;
    lat?: number;
    lng?: number;
    areaTsubo: number;
    frontRoadWidthM?: number;
    isCornerLot?: boolean;
    northBoundaryDistanceM?: number;
  }) {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchLandInfo(payload);
      setScreen({ kind: "result", result });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { error?: string; candidates?: GeocodeCandidate[] } | undefined;

        if (status === 409 && data?.error === "needs_disambiguation" && data.candidates) {
          setScreen({
            kind: "disambiguation",
            candidates: data.candidates,
            areaTsubo: payload.areaTsubo,
            options: {
              frontRoadWidthM: payload.frontRoadWidthM ?? null,
              isCornerLot: payload.isCornerLot ?? false,
              northBoundaryDistanceM: payload.northBoundaryDistanceM ?? null,
            },
          });
          return;
        }
        if (status === 404) {
          setErrorMessage("住所が見つかりませんでした。表記を見直してもう一度お試しください。");
          return;
        }
        setErrorMessage("サーバーに接続できませんでした。しばらくしてから再度お試しください。");
        return;
      }
      setErrorMessage("予期しないエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {screen.kind === "input" && (
        <InputScreen
          loading={loading}
          errorMessage={errorMessage}
          onSubmit={(address, areaTsubo, options) =>
            runLandInfo({
              address,
              areaTsubo,
              frontRoadWidthM: options.frontRoadWidthM ?? undefined,
              isCornerLot: options.isCornerLot,
              northBoundaryDistanceM: options.northBoundaryDistanceM ?? undefined,
            })
          }
        />
      )}
      {screen.kind === "disambiguation" && (
        <DisambiguationScreen
          candidates={screen.candidates}
          onBack={() => setScreen({ kind: "input" })}
          onSelect={(candidate) =>
            runLandInfo({
              lat: candidate.lat,
              lng: candidate.lng,
              areaTsubo: screen.areaTsubo,
              frontRoadWidthM: screen.options.frontRoadWidthM ?? undefined,
              isCornerLot: screen.options.isCornerLot,
              northBoundaryDistanceM: screen.options.northBoundaryDistanceM ?? undefined,
            })
          }
        />
      )}
      {screen.kind === "result" && (
        <ResultScreen result={screen.result} onBack={() => setScreen({ kind: "input" })} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
});
