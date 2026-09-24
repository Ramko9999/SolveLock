import {
  AuthorizationStatus,
  type AuthorizationStatusType,
  type DeviceActivitySchedule,
  getAuthorizationStatus,
  onDeviceActivityMonitorEvent,
  requestAuthorization,
  startMonitoring,
  stopMonitoring,
  unblockSelection,
} from "react-native-device-activity";
import type { AuthorizationState, Enforcement } from "./types";

const ACTIVITY_NAME = "solvelock.quota";
const EVENT_NAME = "quota";

/** One window that covers the whole day. The quota inside it is the event
 *  threshold, not the window -- DeviceActivitySchedule has a 15 minute floor. */
const DAILY: DeviceActivitySchedule = {
  intervalStart: { hour: 0, minute: 0 },
  intervalEnd: { hour: 23, minute: 59 },
  repeats: true,
};

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
  const arm = async (minutes: number, token: string | null) => {
    if (!token) {
      return;
    }
    // The event fires once per window, so re-arming means a full restart.
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
    start: arm,
    release: async (minutes, token) => {
      if (token) {
        unblockSelection({ activitySelectionToken: token }, "solved");
      }
      await arm(minutes, token);
    },
    stop: async () => {
      stopMonitoring([ACTIVITY_NAME]);
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
