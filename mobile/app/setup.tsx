import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { describeSelection, QUOTA_MINUTES, useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

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

  const ready = (selection?.categoryCount ?? 0) > 0;

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
            Pick what to gate. After {QUOTA_MINUTES} minutes, three problems
            unlock {QUOTA_MINUTES} more.
          </Text>
        </View>

        <SettingRow
          label="Gated apps"
          value={describeSelection(selection)}
          onPress={() => router.push("/picker")}
        />
        <SettingRow label="Check every" value={`${QUOTA_MINUTES} minutes`} />
        <SettingRow label="Problems per check" value="3" />

        <View style={setupStyles.spacer} />

        <Pressable
          onPress={() => router.back()}
          disabled={!ready}
          style={[setupStyles.done, { backgroundColor: ready ? accent : fill }]}
        >
          <Text large extrabold onFilled={ready} muted={!ready}>
            {ready ? "Done" : "Pick what to gate first"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
