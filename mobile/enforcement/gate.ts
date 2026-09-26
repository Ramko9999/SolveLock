import { Platform } from "react-native";
import type {
  ForegroundApp,
  InstalledApp,
  Usage,
} from "@/modules/solvelock-gate/src/SolveLockGate.types";

type Gate = {
  getForegroundApp(): ForegroundApp;
  getInstalledApps(): Promise<InstalledApp[]>;
  getUsage(): Usage | null;
  setGatedPackages(packages: string[]): boolean;
  setQuotaMinutes(minutes: number): boolean;
  resetUsage(): boolean;
  isAccessibilityEnabled(): boolean;
  openAccessibilitySettings(): boolean;
};

/**
 * Android only, and null until the native build includes the module. A missing
 * module must not blank the app, so every caller checks for null.
 */
export const gate: Gate | null =
  Platform.OS === "android"
    ? (require("@/modules/solvelock-gate/src/SolveLockGateModule")
        .default as Gate | null)
    : null;

export type { ForegroundApp, InstalledApp, Usage };
