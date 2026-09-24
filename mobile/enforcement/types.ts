export type QuotaStatus = "idle" | "running" | "reached";

/**
 * The seam between the child experience and Apple's Screen Time API.
 *
 * Deliberately narrow. iOS counts the usage and only tells us when the
 * threshold is *reached* -- it never reports a running total -- so there is no
 * `remaining()` here. The fake must not promise what the native one cannot do.
 */
export type Enforcement = {
  readonly kind: "fake" | "native";
  /** Arm a quota window. */
  start(minutes: number): Promise<void>;
  /** Clear the shield, then arm a fresh window. */
  release(minutes: number): Promise<void>;
  stop(): Promise<void>;
  onReached(listener: () => void): () => void;
  /** Test affordance. The native implementation will not provide it. */
  trip?(): void;
};
