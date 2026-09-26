import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, Platform, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AuthorizationState } from "@/enforcement";
import { enforcement } from "@/enforcement";
import { gate } from "@/enforcement/gate";
import { useQuotaStore } from "@/store/quota";
import {
  describeGatedPackages,
  describeSelection,
  useSetupStore,
} from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

function minutes(count: number) {
  return `${count} ${count === 1 ? "minute" : "minutes"}`;
}

const settingRowStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    width: "100%",
    paddingVertical: "4.5%",
    paddingHorizontal: "5%",
    borderRadius: Radius.xxl,
  },
  label: {
    ...StyleUtils.flexColumn(3),
    flex: 1,
  },
});

type SettingRowProps = {
  label: string;
  value: string;
  onPress?: () => void;
};

function SettingRow({ label, value, onPress }: SettingRowProps) {
  const fill = useColor(AppColor.fill);
  const muted = useColor(AppColor.muted);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[settingRowStyles.container, { backgroundColor: fill }]}
    >
      <View style={settingRowStyles.label}>
        <Text small bold muted>
          {label}
        </Text>
        <Text large semibold>
          {value}
        </Text>
      </View>
      {onPress ? (
        <Text larger bold style={{ color: muted }}>
          {"›"}
        </Text>
      ) : null}
    </Pressable>
  );
}

const setupStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "6%",
    paddingTop: "6%",
    paddingBottom: "8%",
    gap: 10,
  },
  heading: {
    ...StyleUtils.flexColumn(6),
    paddingBottom: "6%",
  },
  spacer: {
    flex: 1,
  },
  done: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "4.5%",
    borderRadius: Radius.xxl,
  },
});

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const accent = useColor(AppColor.accent);
  const fill = useColor(AppColor.fill);
  const selection = useSetupStore((s) => s.selection);
  const gatedPackages = useSetupStore((s) => s.gatedPackages);
  const [permissionsLeft, setPermissionsLeft] = useState<number | null>(null);
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);
  const setArmedAt = useSetupStore((s) => s.setArmedAt);
  const startQuota = useQuotaStore((s) => s.startQuota);
  const [notifications, setNotifications] = useState(false);
  const [authorization, setAuthorization] = useState<AuthorizationState>(
    enforcement.getAuthorization(),
  );

  // Screen Time authorization is an iOS concept. On Android the four
  // permissions stand in for it, and only the native module can read them.
  const isIOS = Platform.OS === "ios";

  const refreshPermissions = useCallback(() => {
    const native = gate;
    if (!native) {
      return;
    }
    const status = native.getPermissionStatus();
    setPermissionsLeft(
      ["accessibility", "overlay", "battery"].filter((id) => !status[id])
        .length,
    );
  }, []);

  useEffect(() => {
    refreshPermissions();
    const listener = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        refreshPermissions();
      }
    });
    return () => listener.remove();
  }, [refreshPermissions]);

  const approved = isIOS ? authorization === "approved" : true;
  const picked = isIOS
    ? (selection?.categoryCount ?? 0) + (selection?.applicationCount ?? 0) > 0
    : gatedPackages.length > 0;
  const permissionsDone = permissionsLeft === null || permissionsLeft === 0;
  const ready = approved && picked && permissionsDone;

  const authorize = async () => {
    setAuthorization(await enforcement.requestAuthorization());
  };

  // The shield cannot open our app. A notification is the only way through,
  // and the library posts one without ever asking for permission.
  const allowNotifications = async () => {
    const { granted } = await Notifications.requestPermissionsAsync();
    setNotifications(granted);
  };

  const finish = () => {
    setArmedAt(Date.now());
    startQuota(quotaMinutes, selection?.token ?? null);
    router.back();
  };

  const authorizationValue =
    authorization === "approved"
      ? "Allowed"
      : authorization === "denied"
        ? "Denied — allow it in Settings"
        : "Tap to allow";

  return (
    <View
      style={[
        setupStyles.container,
        { backgroundColor: background, paddingTop: insets.top },
      ]}
    >
      <View style={setupStyles.content}>
        <View style={setupStyles.heading}>
          <Text huge bold>
            Set up SolveLock
          </Text>
          <Text small muted>
            Pick what to gate. After {minutes(quotaMinutes)}, three problems
            unlock {minutes(quotaMinutes)} more.
          </Text>
        </View>

        {isIOS ? null : (
          <SettingRow
            label="Permissions"
            value={
              permissionsLeft === null
                ? "Three Android settings screens"
                : permissionsLeft === 0
                  ? "All granted"
                  : `${permissionsLeft} still needed`
            }
            onPress={() => router.push("/permissions")}
          />
        )}
        {isIOS ? (
          <SettingRow
            label="Screen Time access"
            value={authorizationValue}
            onPress={approved ? undefined : authorize}
          />
        ) : null}
        <SettingRow
          label="Notifications"
          value={notifications ? "Allowed" : "Tap to allow"}
          onPress={notifications ? undefined : allowNotifications}
        />
        <SettingRow
          label="Gated apps"
          value={
            isIOS
              ? describeSelection(selection)
              : describeGatedPackages(gatedPackages)
          }
          onPress={approved ? () => router.push("/picker") : undefined}
        />
        <SettingRow label="Check every" value={minutes(quotaMinutes)} />
        <SettingRow label="Problems per check" value="3" />

        <View style={setupStyles.spacer} />

        <Pressable
          onPress={finish}
          disabled={!ready}
          style={[setupStyles.done, { backgroundColor: ready ? accent : fill }]}
        >
          <Text large extrabold onFilled={ready} muted={!ready}>
            {ready
              ? "Done"
              : !picked
                ? "Pick what to gate first"
                : "Grant the permissions first"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
