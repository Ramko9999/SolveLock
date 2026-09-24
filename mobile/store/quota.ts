import { create } from "zustand";
import type { QuotaStatus } from "@/enforcement";
import { enforcement } from "@/enforcement";
import { QUOTA_MINUTES } from "@/store/setup";

type QuotaState = {
  status: QuotaStatus;
  startQuota: (token: string | null) => Promise<void>;
  releaseQuota: (token: string | null) => Promise<void>;
  stopQuota: () => Promise<void>;
  markReached: () => void;
  tripForTesting: () => void;
};

export const useQuotaStore = create<QuotaState>()((set) => ({
  status: "idle",
  startQuota: async (token) => {
    await enforcement.start(QUOTA_MINUTES, token);
    set({ status: "running" });
  },
  releaseQuota: async (token) => {
    await enforcement.release(QUOTA_MINUTES, token);
    set({ status: "running" });
  },
  stopQuota: async () => {
    await enforcement.stop();
    set({ status: "idle" });
  },
  markReached: () => set({ status: "reached" }),
  tripForTesting: () => enforcement.trip?.(),
}));
