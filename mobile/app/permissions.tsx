import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

type Permission = {
  id: string;
  name: string;
  why: string;
  /** The Android settings screen that grants it. */
  intent: string;
};

const PERMISSIONS: Permission[] = [
  {
    id: "usage",
    name: "App usage access",
    why: "Lets us see which app is open, and count the minutes.",
    intent: "android.settings.USAGE_ACCESS_SETTINGS",
  },
  {
    id: "overlay",
    name: "Display over other apps",
    why: "Lets us cover a game with the problems. Also lets us open ourselves from the background.",
    intent: "android.settings.action.MANAGE_OVERLAY_PERMISSION",
  },
  {
    id: "accessibility",
    name: "Accessibility service",
    why: "Tells us the instant an app opens. Without it we must poll, which is slower and costs battery.",
    intent: "android.settings.ACCESSIBILITY_SETTINGS",
  },
  {
    id: "battery",
    name: "Ignore battery optimisation",
    why: "Stops Android from putting us to sleep.",
    intent: "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS",
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
  onGrant: () => void;
};

function PermissionRow({ permission, onGrant }: PermissionRowProps) {
  const fill = useColor(AppColor.fill);
  const accent = useColor(AppColor.accent);

  return (
    <View style={[permissionRowStyles.container, { backgroundColor: fill }]}>
      <Text large bold>
        {permission.name}
      </Text>
      <Text small muted>
        {permission.why}
      </Text>
      <Pressable
        onPress={onGrant}
        style={[permissionRowStyles.grant, { backgroundColor: accent }]}
      >
        <Text small extrabold onFilled>
          Open settings
        </Text>
      </Pressable>
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
          Four permissions
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
            onGrant={() => Linking.sendIntent(permission.intent)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
