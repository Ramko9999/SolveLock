export type ForegroundApp = {
  packageName: string | null;
  /** Wall-clock at the moment the service saw the change, not when JS asked. */
  changedAt: number;
};

export type SolveLockGateModuleEvents = {
  onForegroundApp: (event: ForegroundApp) => void;
};
