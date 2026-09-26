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

export type SolveLockGateModuleEvents = {
  onForegroundApp: (event: ForegroundApp) => void;
};
