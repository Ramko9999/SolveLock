import { Redirect, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";
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
  const gatedPackages = useSetupStore((s) => s.gatedPackages);
  const isIOS = Platform.OS === "ios";
  const status = useQuotaStore((s) => s.status);

  if (status === "reached") {
    return <Redirect href="/blocked" />;
  }

  const isSetUp = isIOS
    ? (selection?.categoryCount ?? 0) > 0
    : gatedPackages.length > 0;

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
              : describeGatedPackages(gatedPackages)}
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
