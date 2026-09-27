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

/**
 * Whose phone this is. The parent configures either way; `child` means they
 * handed it back, so the screens must never speak to the parent from then on.
 */
export type Role = "self" | "child";

export const DEFAULT_QUOTA_MINUTES = 30;

/**
 * What a parent can choose: ten to forty-five minutes, in fives. Shorter than
 * ten is not a quota, it is an interruption; longer than forty-five and the
 * check stops being a rhythm.
 */
export const QUOTA_MINUTES = [10, 15, 20, 25, 30, 35, 40, 45];

/** Diagnostics only. A device test must not cost ten minutes of waiting. */
export const TEST_QUOTA_CHOICES = [1, 2, 5, 30] as const;

export const DEFAULT_PROBLEMS_PER_CHECK = 3;

export const PROBLEM_CHOICES = [1, 3, 5] as const;

type SetupState = {
  role: Role | null;
  /** Correct answers, ever. The child's number, not the parent's. */
  solvedCorrect: number;
  selection: Selection | null;
  /** Android only. iOS never tells us a bundle id, so it uses `selection`. */
  gatedPackages: string[];
  /**
   * Whole categories, stored as a rule rather than the apps it matched today.
   * A game installed next week is then gated without the parent touching it.
   */
  gatedCategories: number[];
  quotaMinutes: number;
  problemsPerCheck: number;
  /** When we last called startMonitoring. Wall-clock, not usage -- iOS never
   *  reports a running total, so this is elapsed time, not quota consumed. */
  armedAt: number | null;
  hydrated: boolean;
  setRole: (role: Role) => void;
  countCorrect: () => void;
  setSelection: (selection: Selection) => void;
  toggleGatedPackage: (packageName: string) => void;
  toggleGatedCategory: (category: number) => void;
  setQuotaMinutes: (minutes: number) => void;
  setProblemsPerCheck: (count: number) => void;
  setArmedAt: (armedAt: number | null) => void;
  clearSelection: () => void;
  setHydrated: () => void;
};

export const useSetupStore = create<SetupState>()(
  persist(
    (set) => ({
      role: null,
      solvedCorrect: 0,
      selection: null,
      gatedPackages: [],
      gatedCategories: [],
      quotaMinutes: DEFAULT_QUOTA_MINUTES,
      problemsPerCheck: DEFAULT_PROBLEMS_PER_CHECK,
      armedAt: null,
      hydrated: false,
      setRole: (role) => set({ role }),
      countCorrect: () =>
        set((state) => ({ solvedCorrect: state.solvedCorrect + 1 })),
      setSelection: (selection) => set({ selection }),
      toggleGatedPackage: (packageName) =>
        set((state) => ({
          gatedPackages: state.gatedPackages.includes(packageName)
            ? state.gatedPackages.filter((name) => name !== packageName)
            : [...state.gatedPackages, packageName],
        })),
      toggleGatedCategory: (category) =>
        set((state) => ({
          gatedCategories: state.gatedCategories.includes(category)
            ? state.gatedCategories.filter((one) => one !== category)
            : [...state.gatedCategories, category],
        })),
      setQuotaMinutes: (quotaMinutes) => set({ quotaMinutes }),
      setProblemsPerCheck: (problemsPerCheck) => set({ problemsPerCheck }),
      setArmedAt: (armedAt) => set({ armedAt }),
      clearSelection: () =>
        set({ selection: null, gatedPackages: [], gatedCategories: [] }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "solvelock-setup",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        role: state.role,
        solvedCorrect: state.solvedCorrect,
        selection: state.selection,
        gatedPackages: state.gatedPackages,
        gatedCategories: state.gatedCategories,
        quotaMinutes: state.quotaMinutes,
        problemsPerCheck: state.problemsPerCheck,
        armedAt: state.armedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function describeGatedPackages(
  gatedPackages: string[],
  gatedCategories: number[] = [],
) {
  const parts: string[] = [];
  if (gatedCategories.length > 0) {
    parts.push(
      `${gatedCategories.length} ${gatedCategories.length === 1 ? "category" : "categories"}`,
    );
  }
  if (gatedPackages.length > 0) {
    parts.push(
      `${gatedPackages.length} ${gatedPackages.length === 1 ? "app" : "apps"}`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : "Nothing selected yet";
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
