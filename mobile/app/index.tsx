import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
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

function clock(millis: number) {
  const total = Math.max(0, Math.round(millis / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

const childHomeStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(8),
    flex: 1,
    paddingHorizontal: "8%",
  },
  count: {
    ...StyleUtils.flexColumnCenterAll(2),
  },
  next: {
    ...StyleUtils.flexColumnCenterAll(2),
    paddingTop: "14%",
  },
  quiet: {
    position: "absolute",
    right: "6%",
    bottom: "6%",
    padding: "4%",
  },
});

function ChildHome() {
  const router = useRouter();
  const background = useColor(AppColor.background);
  const muted = useColor(AppColor.muted);
  const solvedCorrect = useSetupStore((s) => s.solvedCorrect);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const native = gate;
    if (!native) {
      return;
    }
    const read = () => {
      const usage = native.getUsage();
      setLeft(usage ? Math.max(0, usage.quotaMillis - usage.usedMillis) : null);
    };
    read();
    const timer = setInterval(read, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[childHomeStyles.container, { backgroundColor: background }]}>
      <View style={childHomeStyles.count}>
        <Text superhuge black>
          {solvedCorrect}
        </Text>
        <Text neutral muted>
          {solvedCorrect === 1 ? "problem solved" : "problems solved"}
        </Text>
      </View>

      {left === null ? null : (
        <View style={childHomeStyles.next}>
          <Text large bold mono>
            {clock(left)}
          </Text>
          <Text small muted>
            until the next check
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push("/setup")}
        style={childHomeStyles.quiet}
      >
        <Text small style={{ color: muted }}>
          •••
        </Text>
      </Pressable>
    </View>
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
  const hydrated = useSetupStore((s) => s.hydrated);
  const role = useSetupStore((s) => s.role);
  const selection = useSetupStore((s) => s.selection);
  const gatedPackages = useSetupStore((s) => s.gatedPackages);
  const gatedCategories = useSetupStore((s) => s.gatedCategories);
  const isIOS = Platform.OS === "ios";
  const status = useQuotaStore((s) => s.status);

  // Without this the role reads null for a frame and we bounce a set-up phone
  // back to the "who is setting this up" screen.
  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: background }} />;
  }

  if (status === "reached") {
    return <Redirect href="/blocked" />;
  }

  if (role === null) {
    return <Redirect href="/role" />;
  }

  if (role === "child") {
    return <ChildHome />;
  }

  const isSetUp = isIOS
    ? (selection?.categoryCount ?? 0) > 0
    : gatedPackages.length + gatedCategories.length > 0;

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
            {isIOS
              ? describeSelection(selection)
              : describeGatedPackages(gatedPackages, gatedCategories)}
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
