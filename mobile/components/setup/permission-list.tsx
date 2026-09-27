import { useCallback, useEffect, useState } from "react";
import { AppState, Pressable, ScrollView, StyleSheet } from "react-native";
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

/**
 * Three, not four. We asked for app usage access and never used it -- the
 * foreground app comes from the accessibility service -- and every trip into
 * Android settings is a chance the parent gives up.
 */
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

/** Android grants on its own screens, so re-read whenever we come back. */
export function usePermissionStatus() {
  const [status, setStatus] = useState<Record<string, boolean>>({});

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
  return { status, remaining, refresh };
}

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

const permissionListStyles = StyleSheet.create({
  content: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "6%",
    paddingBottom: "6%",
  },
});

type PermissionListProps = {
  status: Record<string, boolean>;
};

export function PermissionList({ status }: PermissionListProps) {
  return (
    <ScrollView contentContainerStyle={permissionListStyles.content}>
      {PERMISSIONS.map((permission) => (
        <PermissionRow
          key={permission.id}
          permission={permission}
          granted={status[permission.id] ?? false}
          onGrant={() => gate?.openPermission(permission.id)}
        />
      ))}
    </ScrollView>
  );
}
