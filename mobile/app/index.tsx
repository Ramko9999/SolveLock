import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { describeSelection, useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

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
  button: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "5%",
    borderRadius: Radius.xxl,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const background = useColor(AppColor.background);
  const accent = useColor(AppColor.accent);
  const fill = useColor(AppColor.fill);
  const selection = useSetupStore((s) => s.selection);

  const isSetUp = (selection?.categoryCount ?? 0) > 0;

  return (
    <View style={[homeStyles.container, { backgroundColor: background }]}>
      <Text huge bold>
        SolveLock
      </Text>
      <View style={homeStyles.status}>
        <Text small muted>
          {isSetUp ? "Gating" : "Not set up yet"}
        </Text>
        {isSetUp ? (
          <Text sneutral semibold>
            {describeSelection(selection)}
          </Text>
        ) : null}
      </View>

      <View style={homeStyles.actions}>
        <Pressable
          onPress={() => router.push("/setup")}
          style={[
            homeStyles.button,
            { backgroundColor: isSetUp ? fill : accent },
          ]}
        >
          <Text large extrabold onFilled={!isSetUp}>
            {isSetUp ? "Change setup" : "Set up"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/solve")}
          style={[
            homeStyles.button,
            { backgroundColor: isSetUp ? accent : fill },
          ]}
        >
          <Text large extrabold onFilled={isSetUp} muted={!isSetUp}>
            Solve
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
