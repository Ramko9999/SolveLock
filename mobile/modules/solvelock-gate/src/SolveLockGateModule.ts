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
  getPermissionStatus(): Record<string, boolean>;
  openPermission(id: string): boolean;
  getBlockedPackage(): string | null;
  clearBlocked(): boolean;
  canDrawOverlays(): boolean;
  openOverlaySettings(): boolean;
  launchApp(packageName: string): boolean;
  isAccessibilityEnabled(): boolean;
  openAccessibilitySettings(): boolean;
}

export default requireOptionalNativeModule<SolveLockGateModule>(
  "SolveLockGate",
);
