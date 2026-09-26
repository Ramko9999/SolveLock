import { create } from "zustand";
import type { QuotaStatus } from "@/enforcement";
import { enforcement } from "@/enforcement";

type QuotaState = {
  status: QuotaStatus;
  startQuota: (minutes: number, token: string | null) => Promise<void>;
  releaseQuota: (minutes: number, token: string | null) => Promise<void>;
  stopQuota: () => Promise<void>;
  clearShield: () => Promise<void>;
  /** iOS holds the truth across app launches, so read it rather than
   *  remember it. This store is deliberately not persisted. */
  syncFromSystem: (armedAt: number | null) => void;
  markReached: () => void;
  tripForTesting: () => void;
};

export const useQuotaStore = create<QuotaState>()((set) => ({
  status: "idle",
  startQuota: async (minutes, token) => {
    await enforcement.start(minutes, token);
    set({ status: "running" });
  },
  releaseQuota: async (minutes, token) => {
    await enforcement.release(minutes, token);
    set({ status: "running" });
  },
  stopQuota: async () => {
    await enforcement.stop();
    set({ status: "idle" });
  },
  clearShield: async () => {
    await enforcement.clearShield();
    set({ status: "idle" });
  },
  syncFromSystem: (armedAt) => {
    if (enforcement.isShielded()) {
      set({ status: "reached" });
      return;
    }
    const reachedAt = enforcement.lastReachedAt();
    if (armedAt !== null && reachedAt !== null && reachedAt >= armedAt) {
      set({ status: "reached" });
      return;
    }
    set({ status: armedAt === null ? "idle" : "running" });
  },
  markReached: () => set({ status: "reached" }),
  tripForTesting: () => enforcement.trip?.(),
}));
