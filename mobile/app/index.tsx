import { Redirect, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { enforcement } from "@/enforcement";
import { useQuotaStore } from "@/store/quota";
import { describeSelection, useSetupStore } from "@/store/setup";
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
  testing: {
    ...StyleUtils.flexColumn(8),
    width: "100%",
    paddingTop: "12%",
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const background = useColor(AppColor.background);
  const selection = useSetupStore((s) => s.selection);
  const token = useSetupStore((s) => s.selection?.token ?? null);
  const status = useQuotaStore((s) => s.status);
  const startQuota = useQuotaStore((s) => s.startQuota);
  const stopQuota = useQuotaStore((s) => s.stopQuota);
  const tripForTesting = useQuotaStore((s) => s.tripForTesting);

  if (status === "reached") {
    return <Redirect href="/blocked" />;
  }

  const isSetUp = (selection?.categoryCount ?? 0) > 0;
  const isRunning = status === "running";

  return (
    <View style={[homeStyles.container, { backgroundColor: background }]}>
      <Text huge bold>
        SolveLock
      </Text>
      <View style={homeStyles.status}>
        <Text small muted>
          {!isSetUp ? "Not set up yet" : isRunning ? "Quota running" : "Gating"}
        </Text>
        {isSetUp ? (
          <Text sneutral semibold>
            {describeSelection(selection)}
          </Text>
        ) : null}
      </View>

      <View style={homeStyles.actions}>
        <ActionButton
          label={isSetUp ? "Change setup" : "Set up"}
          filled={!isSetUp}
          onPress={() => router.push("/setup")}
        />
      </View>

      {enforcement.kind === "fake" ? (
        <View style={homeStyles.testing}>
          <Text tiny bold muted>
            NO SCREEN TIME HERE
          </Text>
          <ActionButton
            label={isRunning ? "Stop quota" : "Start quota"}
            filled={false}
            onPress={() => (isRunning ? stopQuota() : startQuota(token))}
          />
          <ActionButton
            label="Trip the quota now"
            filled={false}
            onPress={tripForTesting}
          />
        </View>
      ) : null}
    </View>
  );
}
