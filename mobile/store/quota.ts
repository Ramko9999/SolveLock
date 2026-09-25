import { create } from "zustand";
import type { QuotaStatus } from "@/enforcement";
import { enforcement } from "@/enforcement";

type QuotaState = {
  status: QuotaStatus;
  startQuota: (minutes: number, token: string | null) => Promise<void>;
  releaseQuota: (minutes: number, token: string | null) => Promise<void>;
  stopQuota: () => Promise<void>;
  clearShield: () => Promise<void>;
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
  markReached: () => set({ status: "reached" }),
  tripForTesting: () => enforcement.trip?.(),
}));
