import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
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
  actions: {
    ...StyleUtils.flexColumn(),
    width: "100%",
    paddingTop: "10%",
  },
  solveButton: {
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

  return (
    <View style={[homeStyles.container, { backgroundColor: background }]}>
      <Text huge bold>
        SolveLock
      </Text>
      <Text small muted>
        Nothing here yet.
      </Text>
      <View style={homeStyles.actions}>
        <Pressable
          onPress={() => router.push("/solve")}
          style={[homeStyles.solveButton, { backgroundColor: accent }]}
        >
          <Text large extrabold onFilled>
            Solve
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
