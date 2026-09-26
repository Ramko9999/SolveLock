import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

const blockedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "6%",
    paddingTop: "18%",
    paddingBottom: "10%",
  },
  heading: {
    ...StyleUtils.flexColumn(2),
  },
  spacer: {
    flex: 1,
  },
  solve: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "5.5%",
    borderRadius: Radius.xxl,
  },
});

export default function BlockedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const accent = useColor(AppColor.accent);
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);

  return (
    <View
      style={[
        blockedStyles.container,
        { backgroundColor: background, paddingTop: insets.top },
      ]}
    >
      <View style={blockedStyles.content}>
        <View style={blockedStyles.heading}>
          <Text huger black>
            {quotaMinutes} minutes.
          </Text>
          <Text larger semibold muted>
            Solve 3 and you're back in.
          </Text>
        </View>

        <View style={blockedStyles.spacer} />

        <Pressable
          onPress={() => router.push("/solve")}
          style={[blockedStyles.solve, { backgroundColor: accent }]}
        >
          <Text big extrabold onFilled>
            Start
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
