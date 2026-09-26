export type ForegroundApp = {
  packageName: string | null;
  /** Wall-clock at the moment the service saw the change, not when JS asked. */
  changedAt: number;
};

export type InstalledApp = {
  packageName: string;
  label: string;
  /** A PNG data URI. Null when Android refuses to draw the icon. */
  icon: string | null;
};

export type Usage = {
  usedMillis: number;
  quotaMillis: number;
  over: boolean;
  /** True while a gated app is in front, so the clock is running. */
  inGatedApp: boolean;
  gatedPackages: string[];
};

export type SolveLockGateModuleEvents = {
  onForegroundApp: (event: ForegroundApp) => void;
};
