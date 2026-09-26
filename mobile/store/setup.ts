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
  /** Android only. iOS never tells us a bundle id, so it uses `selection`. */
  gatedPackages: string[];
  quotaMinutes: number;
  /** When we last called startMonitoring. Wall-clock, not usage -- iOS never
   *  reports a running total, so this is elapsed time, not quota consumed. */
  armedAt: number | null;
  hydrated: boolean;
  setSelection: (selection: Selection) => void;
  toggleGatedPackage: (packageName: string) => void;
  setQuotaMinutes: (minutes: number) => void;
  setArmedAt: (armedAt: number | null) => void;
  clearSelection: () => void;
  setHydrated: () => void;
};

export const useSetupStore = create<SetupState>()(
  persist(
    (set) => ({
      selection: null,
      gatedPackages: [],
      quotaMinutes: DEFAULT_QUOTA_MINUTES,
      armedAt: null,
      hydrated: false,
      setSelection: (selection) => set({ selection }),
      toggleGatedPackage: (packageName) =>
        set((state) => ({
          gatedPackages: state.gatedPackages.includes(packageName)
            ? state.gatedPackages.filter((name) => name !== packageName)
            : [...state.gatedPackages, packageName],
        })),
      setQuotaMinutes: (quotaMinutes) => set({ quotaMinutes }),
      setArmedAt: (armedAt) => set({ armedAt }),
      clearSelection: () => set({ selection: null, gatedPackages: [] }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "solvelock-setup",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selection: state.selection,
        gatedPackages: state.gatedPackages,
        quotaMinutes: state.quotaMinutes,
        armedAt: state.armedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function describeGatedPackages(gatedPackages: string[]) {
  if (gatedPackages.length === 0) {
    return "Nothing selected yet";
  }
  return `${gatedPackages.length} ${gatedPackages.length === 1 ? "app" : "apps"}`;
}

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
