import type { Enforcement } from "./types";

export function createFakeEnforcement(): Enforcement {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const fire = () => {
    timer = null;
    for (const listener of listeners) {
      listener();
    }
  };

  const arm = (minutes: number) => {
    clear();
    timer = setTimeout(fire, minutes * 60_000);
  };

  return {
    kind: "fake",
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
