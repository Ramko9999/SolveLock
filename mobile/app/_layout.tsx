import {
  DarkTheme,
  DefaultTheme,
  router,
  Stack,
  ThemeProvider,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AnalyticsApi, AnalyticsEvents } from "@/api/analytics";
import { enforcement } from "@/enforcement";
import { gate } from "@/enforcement/gate";
import { useQuotaStore } from "@/store/quota";
import { useSetupStore } from "@/store/setup";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const markReached = useQuotaStore((s) => s.markReached);
  const syncFromSystem = useQuotaStore((s) => s.syncFromSystem);
  const armedAt = useSetupStore((s) => s.armedAt);
  const hydrated = useSetupStore((s) => s.hydrated);
  const gatedPackages = useSetupStore((s) => s.gatedPackages);
  const gatedCategories = useSetupStore((s) => s.gatedCategories);
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);
  const problemsPerCheck = useSetupStore((s) => s.problemsPerCheck);

  useEffect(() => enforcement.onReached(markReached), [markReached]);

  // The shield can go up while the app is closed. Ask iOS on every launch.
  useEffect(() => {
    if (hydrated) {
      syncFromSystem(armedAt);
    }
  }, [hydrated, armedAt, syncFromSystem]);

  // Android counts in the accessibility service, which outlives the screens,
  // so it needs its own copy of what to watch.
  useEffect(() => {
    if (!hydrated || !gate) {
      return;
    }
    gate.setGatedPackages(gatedPackages);
    gate.setGatedCategories(gatedCategories);
    gate.setQuotaMinutes(quotaMinutes);
    gate.setProblemsPerCheck(problemsPerCheck);
  }, [
    hydrated,
    gatedPackages,
    gatedCategories,
    quotaMinutes,
    problemsPerCheck,
  ]);

  // The service writes a cover down the moment it raises one, because no
  // JavaScript is alive then. We send whatever it has whenever we run, so a
  // cover the child ignored is reported too, with the time it really happened.
  useEffect(() => {
    const drain = async () => {
      await AnalyticsApi.initialize();
      for (const cover of gate?.drainCoverLog() ?? []) {
        AnalyticsApi.trackEvent(AnalyticsEvents.COVER_SHOWN, {
          gated_package: cover.packageName,
          quota_minutes: Math.round(cover.quotaMillis / 60_000),
          shown_at: new Date(cover.at).toISOString(),
          reported_after_ms: Date.now() - cover.at,
        });
      }
    };
    drain();
    const state = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        drain();
      }
    });
    return () => state.remove();
  }, []);

  // Coming forward when nothing remounts -- the app was already alive behind
  // the cover. A cold start is handled in app/index.tsx during render instead,
  // so the home screen never paints first.
  useEffect(() => {
    const native = gate;
    if (!native) {
      return;
    }
    const open = () => {
      if (native.getBlockedPackage()) {
        router.replace("/solve");
      }
    };
    open();
    const state = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        open();
      }
    });
    return () => state.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="role" />
          <Stack.Screen name="handoff" />
          <Stack.Screen name="step-permissions" />
          <Stack.Screen name="step-apps" />
          <Stack.Screen name="step-quota" />
          <Stack.Screen name="step-problems" />
          <Stack.Screen name="step-confirm" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="permissions" />
          <Stack.Screen name="blocked" />
          <Stack.Screen name="solve" />
          <Stack.Screen name="picker" options={{ presentation: "modal" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
