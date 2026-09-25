import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Mirrors ActivitySelectionMetadata from react-native-device-activity, so the
 *  real picker's result drops in here unchanged. `token` is the opaque
 *  FamilyActivitySelection blob — meaningless to us, meaningful to iOS. */
export type Selection = {
  categories: string[];
  applicationCount: number;
  categoryCount: number;
  webDomainCount: number;
  includeEntireCategory: boolean;
  token: string | null;
};

export const DEFAULT_QUOTA_MINUTES = 30;

/** Short values exist so a device test doesn't cost 30 minutes of waiting. */
export const QUOTA_CHOICES = [1, 2, 5, 30] as const;

type SetupState = {
  selection: Selection | null;
  quotaMinutes: number;
  hydrated: boolean;
  setSelection: (selection: Selection) => void;
  setQuotaMinutes: (minutes: number) => void;
  clearSelection: () => void;
  setHydrated: () => void;
};

export const useSetupStore = create<SetupState>()(
  persist(
    (set) => ({
      selection: null,
      quotaMinutes: DEFAULT_QUOTA_MINUTES,
      hydrated: false,
      setSelection: (selection) => set({ selection }),
      setQuotaMinutes: (quotaMinutes) => set({ quotaMinutes }),
      clearSelection: () => set({ selection: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "solvelock-setup",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selection: state.selection,
        quotaMinutes: state.quotaMinutes,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function describeSelection(selection: Selection | null) {
  if (!selection) {
    return "Nothing selected yet";
  }
  const parts: string[] = [];
  if (selection.categoryCount > 0) {
    parts.push(
      `${selection.categoryCount} ${selection.categoryCount === 1 ? "category" : "categories"}`,
    );
  }
  if (selection.applicationCount > 0) {
    parts.push(`${selection.applicationCount} apps`);
  }
  if (selection.webDomainCount > 0) {
    parts.push(`${selection.webDomainCount} websites`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Nothing selected yet";
}
