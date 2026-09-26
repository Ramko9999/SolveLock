import { NativeModule, requireOptionalNativeModule } from "expo";
import type {
  ForegroundApp,
  InstalledApp,
  SolveLockGateModuleEvents,
  Usage,
} from "./SolveLockGate.types";

declare class SolveLockGateModule extends NativeModule<SolveLockGateModuleEvents> {
  getForegroundApp(): ForegroundApp;
  getInstalledApps(): Promise<InstalledApp[]>;
  getUsage(): Usage | null;
  setGatedPackages(packages: string[]): boolean;
  setQuotaMinutes(minutes: number): boolean;
  resetUsage(): boolean;
  isAccessibilityEnabled(): boolean;
  openAccessibilitySettings(): boolean;
}

export default requireOptionalNativeModule<SolveLockGateModule>(
  "SolveLockGate",
);
