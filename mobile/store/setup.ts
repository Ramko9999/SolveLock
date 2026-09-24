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

export const QUOTA_MINUTES = 30;

type SetupState = {
  selection: Selection | null;
  hydrated: boolean;
  setSelection: (selection: Selection) => void;
  clearSelection: () => void;
  setHydrated: () => void;
};

export const useSetupStore = create<SetupState>()(
  persist(
    (set) => ({
      selection: null,
      hydrated: false,
      setSelection: (selection) => set({ selection }),
      clearSelection: () => set({ selection: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "solvelock-setup",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selection: state.selection }),
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
