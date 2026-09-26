import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { gate } from "@/enforcement/gate";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

type Permission = {
  id: string;
  name: string;
  why: string;
};

const PERMISSIONS: Permission[] = [
  {
    id: "accessibility",
    name: "Accessibility service",
    why: "Tells us the instant an app opens, so we know what to gate.",
  },
  {
    id: "overlay",
    name: "Display over other apps",
    why: "Lets us cover a game with the problems.",
  },
  {
    id: "battery",
    name: "Ignore battery optimisation",
    why: "Stops Android from putting us to sleep.",
  },
];

const permissionRowStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(6),
    width: "100%",
    paddingVertical: "5%",
    paddingHorizontal: "5%",
    borderRadius: Radius.xxl,
  },
  title: {
    ...StyleUtils.flexRow(8),
    alignItems: "center",
    width: "100%",
  },
  name: {
    flex: 1,
  },
  grant: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "3.5%",
    borderRadius: Radius.lg,
    marginTop: 6,
  },
});

type PermissionRowProps = {
  permission: Permission;
  granted: boolean;
  onGrant: () => void;
};

function PermissionRow({ permission, granted, onGrant }: PermissionRowProps) {
  const fill = useColor(AppColor.fill);
  const accent = useColor(AppColor.accent);

  return (
    <View style={[permissionRowStyles.container, { backgroundColor: fill }]}>
      <View style={permissionRowStyles.title}>
        <Text large bold style={permissionRowStyles.name}>
          {permission.name}
        </Text>
        <Text neutral bold correct={granted} muted={!granted}>
          {granted ? "✓" : "needed"}
        </Text>
      </View>
      <Text small muted>
        {permission.why}
      </Text>
      {granted ? null : (
        <Pressable
          onPress={onGrant}
          style={[permissionRowStyles.grant, { backgroundColor: accent }]}
        >
          <Text small extrabold onFilled>
            Open settings
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const permissionsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    ...StyleUtils.flexColumn(6),
    paddingHorizontal: "6%",
    paddingTop: "4%",
    paddingBottom: "5%",
  },
  content: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "6%",
    paddingBottom: "12%",
  },
  back: {
    ...StyleUtils.flexRowCenterAll(4),
    paddingVertical: "2%",
    paddingRight: "6%",
    alignSelf: "flex-start",
  },
});

export default function PermissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const [status, setStatus] = useState<Record<string, boolean>>({});

  // Android grants happen on its own screens, so re-read when we come back.
  const refresh = useCallback(() => {
    setStatus(gate?.getPermissionStatus() ?? {});
  }, []);

  useEffect(() => {
    refresh();
    const listener = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        refresh();
      }
    });
    return () => listener.remove();
  }, [refresh]);

  const remaining = PERMISSIONS.filter((one) => !status[one.id]).length;

  return (
    <View
      style={[
        permissionsStyles.container,
        { backgroundColor: background, paddingTop: insets.top },
      ]}
    >
      <View style={permissionsStyles.header}>
        <Pressable onPress={() => router.back()} style={permissionsStyles.back}>
          <Text neutral semibold accent>
            {"‹"} Back
          </Text>
        </Pressable>
        <Text huge bold>
          {remaining === 0 ? "All set" : `${remaining} left`}
        </Text>
        <Text small muted>
          Android grants each one on its own settings screen. Tap, allow, then
          come back here.
        </Text>
      </View>
      <ScrollView contentContainerStyle={permissionsStyles.content}>
        {PERMISSIONS.map((permission) => (
          <PermissionRow
            key={permission.id}
            permission={permission}
            granted={status[permission.id] ?? false}
            onGrant={() => gate?.openPermission(permission.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
