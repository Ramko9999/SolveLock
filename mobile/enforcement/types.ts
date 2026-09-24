export type QuotaStatus = "idle" | "running" | "reached";

export type AuthorizationState = "notDetermined" | "denied" | "approved";

/**
 * The seam between the child experience and Apple's Screen Time API.
 *
 * Deliberately narrow. iOS counts the usage and only reports that a threshold
 * was *reached* -- never a running total -- so there is no `remaining()` here.
 *
 * `token` is the opaque FamilyActivitySelection blob. It is meaningless to us
 * and meaningful only to iOS on the device that produced it.
 */
export type Enforcement = {
  readonly kind: "fake" | "native";
  getAuthorization(): AuthorizationState;
  requestAuthorization(): Promise<AuthorizationState>;
  /** Arm a quota window. */
  start(minutes: number, token: string | null): Promise<void>;
  /** Clear the shield, then arm a fresh window. */
  release(minutes: number, token: string | null): Promise<void>;
  stop(): Promise<void>;
  onReached(listener: () => void): () => void;
  /** Only the fake provides this. */
  trip?(): void;
};
