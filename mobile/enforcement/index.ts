import { createFakeEnforcement } from "./fake";
import type { Enforcement } from "./types";

/** Swap for the native implementation at M5, once the entitlement lands. */
export const enforcement: Enforcement = createFakeEnforcement();

export type { Enforcement, QuotaStatus } from "./types";
