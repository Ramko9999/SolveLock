import { NativeModule, requireOptionalNativeModule } from "expo";
import type {
  ForegroundApp,
  SolveLockGateModuleEvents,
} from "./SolveLockGate.types";

declare class SolveLockGateModule extends NativeModule<SolveLockGateModuleEvents> {
  getForegroundApp(): ForegroundApp;
  isAccessibilityEnabled(): boolean;
  openAccessibilitySettings(): boolean;
}

export default requireOptionalNativeModule<SolveLockGateModule>(
  "SolveLockGate",
);
