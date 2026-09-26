import { NativeModule, requireOptionalNativeModule } from "expo";
import type {
  ForegroundApp,
  InstalledApp,
  SolveLockGateModuleEvents,
} from "./SolveLockGate.types";

declare class SolveLockGateModule extends NativeModule<SolveLockGateModuleEvents> {
  getForegroundApp(): ForegroundApp;
  getInstalledApps(): Promise<InstalledApp[]>;
  isAccessibilityEnabled(): boolean;
  openAccessibilitySettings(): boolean;
}

export default requireOptionalNativeModule<SolveLockGateModule>(
  "SolveLockGate",
);
