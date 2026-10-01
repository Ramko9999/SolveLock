import * as Application from "expo-application";
import PostHog from "posthog-react-native";
import { Platform } from "react-native";

/**
 * Paste the SolveLock project key here, or set EXPO_PUBLIC_POSTHOG_API_KEY.
 * Empty means every call below is a no-op, so the app runs fine without it.
 */
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "";
const POSTHOG_HOST = "https://us.i.posthog.com";

export const AnalyticsEvents = {
  /** The cover went up over a gated app. Logged natively, sent later. */
  COVER_SHOWN: "cover_shown",
  /** The child tapped Start and the problems appeared. */
  CHECK_STARTED: "check_started",
  /** One answer, right or wrong, with how long it took. */
  PROBLEM_ANSWERED: "problem_answered",
  /** The whole run, with how many were right and how long it took. */
  CHECK_COMPLETED: "check_completed",
} as const;

let posthogClient: PostHog | null = null;

async function getDeviceId(): Promise<string | null> {
  if (Platform.OS === "ios") {
    return Application.getIosIdForVendorAsync();
  }
  return Application.getAndroidId() ?? null;
}

async function initialize(): Promise<void> {
  if (posthogClient || !POSTHOG_API_KEY) {
    return;
  }

  try {
    posthogClient = new PostHog(POSTHOG_API_KEY, { host: POSTHOG_HOST });
    const deviceId = await getDeviceId();
    if (deviceId) {
      posthogClient.identify(deviceId, {
        platform: Platform.OS,
        app_version: Application.nativeApplicationVersion ?? "unknown",
      });
    }
  } catch {
    // Silently fail - analytics must not crash the app
  }
}

function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  if (!posthogClient) {
    return;
  }

  posthogClient.capture(eventName, {
    ...properties,
    platform: Platform.OS,
    app_version: Application.nativeApplicationVersion ?? "unknown",
  });
}

export const AnalyticsApi = {
  initialize,
  trackEvent,
};
