import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enforcement } from "@/enforcement";
import { useQuotaStore } from "@/store/quota";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const markReached = useQuotaStore((s) => s.markReached);

  useEffect(() => enforcement.onReached(markReached), [markReached]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="blocked" />
          <Stack.Screen name="solve" />
          <Stack.Screen name="picker" options={{ presentation: "modal" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
