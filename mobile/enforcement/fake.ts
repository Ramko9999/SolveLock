import type { AuthorizationState, Enforcement } from "./types";

/** Stands in for Screen Time where the native module is absent, so the app
 *  still runs in Expo Go. It enforces nothing. */
export function createFakeEnforcement(): Enforcement {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let authorization: AuthorizationState = "notDetermined";
  let reached: number | null = null;
  const listeners = new Set<() => void>();

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const fire = () => {
    timer = null;
    reached = Date.now();
    for (const listener of listeners) {
      listener();
    }
  };

  const arm = (minutes: number) => {
    clear();
    reached = null;
    timer = setTimeout(fire, minutes * 60_000);
  };

  return {
    kind: "fake",
    setSelection: () => {},
    clearShield: async () => {
      clear();
      reached = null;
    },
    pointShieldAt: () => {},
    isShielded: () => reached !== null,
    lastReachedAt: () => reached,
    diagnostics: () => ({
      authorization,
      activities: [],
      shieldActive: false,
      appGroupKeys: [],
      appGroup: {},
    }),
    getAuthorization: () => authorization,
    requestAuthorization: async () => {
      authorization = "approved";
      return authorization;
    },
    async start(minutes) {
      arm(minutes);
    },
    async release(minutes) {
      arm(minutes);
    },
    async stop() {
      clear();
    },
    onReached(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    trip() {
      clear();
      fire();
    },
  };
}
