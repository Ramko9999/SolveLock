import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useQuotaStore } from "@/store/quota";
import { describeSelection, useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

/** Wall-clock since arming. NOT quota consumed -- iOS never reports a running
 *  total, so a phone in a pocket accrues elapsed time but no usage. */
function useElapsed(since: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (since === null) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [since]);

  if (since === null) {
    return null;
  }
  const seconds = Math.max(0, Math.floor((now - since) / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

const actionButtonStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "5%",
    borderRadius: Radius.xxl,
  },
});

type ActionButtonProps = {
  label: string;
  filled: boolean;
  onPress: () => void;
};

function ActionButton({ label, filled, onPress }: ActionButtonProps) {
  const accent = useColor(AppColor.accent);
  const fill = useColor(AppColor.fill);

  return (
    <Pressable
      onPress={onPress}
      style={[
        actionButtonStyles.container,
        { backgroundColor: filled ? accent : fill },
      ]}
    >
      <Text large extrabold onFilled={filled}>
        {label}
      </Text>
    </Pressable>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(8),
    flex: 1,
    paddingHorizontal: "8%",
  },
  status: {
    ...StyleUtils.flexColumnCenterAll(3),
    paddingTop: "2%",
  },
  actions: {
    ...StyleUtils.flexColumn(10),
    width: "100%",
    paddingTop: "10%",
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const background = useColor(AppColor.background);
  const selection = useSetupStore((s) => s.selection);
  const status = useQuotaStore((s) => s.status);
  const armedAt = useSetupStore((s) => s.armedAt);
  const elapsed = useElapsed(status === "running" ? armedAt : null);

  if (status === "reached") {
    return <Redirect href="/blocked" />;
  }

  const isSetUp = (selection?.categoryCount ?? 0) > 0;

  return (
    <View style={[homeStyles.container, { backgroundColor: background }]}>
      <Text huge bold>
        SolveLock
      </Text>
      <View style={homeStyles.status}>
        <Text small muted>
          {!isSetUp
            ? "Not set up yet"
            : status === "running"
              ? "Watching"
              : "Gating"}
        </Text>
        {isSetUp ? (
          <Text sneutral semibold>
            {describeSelection(selection)}
          </Text>
        ) : null}
        {elapsed ? (
          <Text small muted mono>
            armed {elapsed} ago
          </Text>
        ) : null}
      </View>

      <View style={homeStyles.actions}>
        <ActionButton
          label={isSetUp ? "Change setup" : "Set up"}
          filled={!isSetUp}
          onPress={() => router.push("/setup")}
        />
        <ActionButton
          label="Settings"
          filled={false}
          onPress={() => router.push("/settings")}
        />
      </View>
    </View>
  );
}
