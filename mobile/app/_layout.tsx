import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);

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
    gate.setQuotaMinutes(quotaMinutes);
  }, [hydrated, gatedPackages, quotaMinutes]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
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
