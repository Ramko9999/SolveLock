import {
  type Action,
  AuthorizationStatus,
  type AuthorizationStatusType,
  configureActions,
  type DeviceActivitySchedule,
  getActivities,
  getAuthorizationStatus,
  getEvents,
  isShieldActive,
  onDeviceActivityMonitorEvent,
  requestAuthorization,
  resetBlocks,
  type ShieldActions,
  type ShieldConfiguration,
  setFamilyActivitySelectionId,
  startMonitoring,
  stopMonitoring,
  unblockSelection,
  updateShield,
  userDefaultsAll,
} from "react-native-device-activity";
import { AppColor, getColor } from "@/theme/color";
import type { AuthorizationState, Enforcement } from "./types";

const ACTIVITY_NAME = "solvelock.quota";
const EVENT_NAME = "quota";

/** The monitor extension can only act on a selection by id, not by token. */
const SELECTION_ID = "gated";

/** One window covering the day. The quota is the event threshold inside it --
 *  DeviceActivitySchedule intervals have a 15 minute floor. */
const DAILY: DeviceActivitySchedule = {
  intervalStart: { hour: 0, minute: 0 },
  intervalEnd: { hour: 23, minute: 59 },
  repeats: true,
};

function toUIColor(hex: string) {
  const h = hex.replace("#", "");
  return {
    red: Number.parseInt(h.slice(0, 2), 16),
    green: Number.parseInt(h.slice(2, 4), 16),
    blue: Number.parseInt(h.slice(4, 6), 16),
  };
}

/** Fourteen cosmetic fields and two buttons is the entire surface. Nothing can
 *  be drawn here -- the copy is almost all the control there is. */
const SHIELD: ShieldConfiguration = {
  backgroundColor: toUIColor(getColor(AppColor.background, "light")),
  title: "Three problems",
  titleColor: toUIColor(getColor(AppColor.primary, "light")),
  subtitle: "Solve them and you're back in.",
  subtitleColor: toUIColor(getColor(AppColor.muted, "light")),
  primaryButtonLabel: "Start",
  primaryButtonBackgroundColor: toUIColor(getColor(AppColor.accent, "light")),
  primaryButtonLabelColor: toUIColor(getColor(AppColor.onFilled, "light")),
};

/**
 * Opening our app from the shield IS possible -- ScreenZen does it, and the
 * iOS back breadcrumb it leaves proves it is a real app-to-app open, not a
 * notification. Apple documents no supported route, so this is unofficial.
 *
 * Two details decide whether it works, and we had neither:
 *
 * 1. `openUrlWithDispatch`, not `openUrl`. NSExtensionContext.open fails
 *    silently off the main thread; the library ships both variants for this.
 * 2. `delay`. Without it the extension answers .close at once and iOS tears it
 *    down, so a block just scheduled on the main queue never runs.
 *
 * `url` is ours. The newer `{ type: "openApp" }` action hardcodes
 * `device-activity://`, which is why it opened nothing.
 *
 * Neither "openUrlWithDispatch" nor `url` nor `delay` is in the library's
 * TypeScript types, though the Swift handles all three. Hence the cast.
 *
 * The notification stays until this is proven on device.
 */
const SHIELD_ACTIONS = {
  primary: {
    behavior: "close",
    type: "openUrlWithDispatch",
    url: "solvelock://",
    delay: 0.5,
    actions: [
      {
        type: "sendNotification",
        payload: {
          title: "Three problems",
          body: "Tap to solve and get back in.",
          interruptionLevel: "active",
        },
      },
    ],
  },
} as unknown as ShieldActions;

const BLOCK_ON_THRESHOLD: Action[] = [
  { type: "blockSelection", familyActivitySelectionId: SELECTION_ID },
];

/** The dump is unreadable raw: tokens are hundreds of characters and the
 *  shield config is deeply nested. Summarise instead. */
function summarise(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "string") {
    return value.length > 60 ? `string(${value.length})` : value;
  }
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }
  if (typeof value === "object") {
    return `object{${Object.keys(value as object).join(",")}}`;
  }
  return String(value);
}

function toState(status: AuthorizationStatusType): AuthorizationState {
  if (status === AuthorizationStatus.approved) {
    return "approved";
  }
  if (status === AuthorizationStatus.denied) {
    return "denied";
  }
  return "notDetermined";
}

export function createNativeEnforcement(): Enforcement {
  const register = (token: string | null) => {
    if (token) {
      setFamilyActivitySelectionId({
        id: SELECTION_ID,
        familyActivitySelection: token,
      });
    }
  };

  const arm = async (minutes: number, token: string | null) => {
    if (!token) {
      return;
    }
    register(token);
    updateShield(SHIELD, SHIELD_ACTIONS, "solvelock");
    configureActions({
      activityName: ACTIVITY_NAME,
      callbackName: "eventDidReachThreshold",
      eventName: EVENT_NAME,
      actions: BLOCK_ON_THRESHOLD,
    });
    // A threshold event fires once per window, so re-arming is a full restart.
    stopMonitoring([ACTIVITY_NAME]);
    await startMonitoring(ACTIVITY_NAME, DAILY, [
      {
        familyActivitySelection: token,
        threshold: { minute: minutes },
        eventName: EVENT_NAME,
      },
    ]);
  };

  return {
    kind: "native",
    getAuthorization: () => toState(getAuthorizationStatus()),
    requestAuthorization: async () => {
      // The call resolves void; the status is read back separately.
      await requestAuthorization("individual");
      return toState(getAuthorizationStatus());
    },
    setSelection: register,
    start: arm,
    release: async (minutes, token) => {
      unblockSelection({ activitySelectionId: SELECTION_ID }, "solved");
      await arm(minutes, token);
    },
    stop: async () => {
      stopMonitoring([ACTIVITY_NAME]);
    },
    clearShield: async () => {
      resetBlocks("manual");
    },
    isShielded: () => isShieldActive(),
    lastReachedAt: () => {
      const hits = getEvents(ACTIVITY_NAME).filter(
        (event) => event.callbackName === "eventDidReachThreshold",
      );
      if (hits.length === 0) {
        return null;
      }
      return Math.max(
        ...hits.map((hit) => new Date(hit.lastCalledAt).getTime()),
      );
    },
    diagnostics: () => {
      const raw = userDefaultsAll() ?? {};
      const keys = Object.keys(raw).sort();
      return {
        authorization: toState(getAuthorizationStatus()),
        activities: getActivities(),
        shieldActive: isShieldActive(),
        appGroupKeys: keys,
        appGroup: Object.fromEntries(
          keys.map((key) => [key, summarise(raw[key])]),
        ),
      };
    },
    onReached: (listener) => {
      const subscription = onDeviceActivityMonitorEvent((event) => {
        if (event.callbackName === "eventDidReachThreshold") {
          listener();
        }
      });
      return () => subscription.remove();
    },
  };
}
