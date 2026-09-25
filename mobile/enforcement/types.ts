export type QuotaStatus = "idle" | "running" | "reached";

export type AuthorizationState = "notDetermined" | "denied" | "approved";

/** The only window into the three extensions, which cannot be debugged live. */
export type Diagnostics = {
  authorization: AuthorizationState;
  activities: string[];
  shieldActive: boolean;
  appGroup: Record<string, unknown>;
};

/**
 * The seam between the child experience and Apple's Screen Time API.
 *
 * Deliberately narrow. iOS only reports that a threshold was *reached*, never a
 * running total, so there is no `remaining()` here.
 *
 * `token` is the opaque FamilyActivitySelection blob, meaningful only to iOS on
 * the device that produced it.
 */
export type Enforcement = {
  readonly kind: "fake" | "native";
  getAuthorization(): AuthorizationState;
  requestAuthorization(): Promise<AuthorizationState>;
  /** Register the selection so the monitor extension can act on it by id. */
  setSelection(token: string | null): void;
  start(minutes: number, token: string | null): Promise<void>;
  /** Clear the shield, then arm a fresh window. */
  release(minutes: number, token: string | null): Promise<void>;
  stop(): Promise<void>;
  /** Escape hatch: unblock everything without solving. */
  clearShield(): Promise<void>;
  /** True while iOS is showing the shield. Ask the system, don't remember. */
  isShielded(): boolean;
  /** When the threshold last fired, from the monitor's own record. */
  lastReachedAt(): number | null;
  diagnostics(): Diagnostics;
  onReached(listener: () => void): () => void;
  /** Only the fake provides this. */
  trip?(): void;
};
