import { isAvailable } from "react-native-device-activity";
import { createFakeEnforcement } from "./fake";
import { createNativeEnforcement } from "./native";
import type { Enforcement } from "./types";

/** Native in a development build, fake in Expo Go, same JS bundle. */
export const enforcement: Enforcement = isAvailable()
  ? createNativeEnforcement()
  : createFakeEnforcement();

export type {
  AuthorizationState,
  Diagnostics,
  Enforcement,
  QuotaStatus,
} from "./types";
