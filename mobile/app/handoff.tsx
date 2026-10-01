import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

const handoffStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "8%",
    paddingTop: "30%",
    paddingBottom: "10%",
  },
  heading: {
    ...StyleUtils.flexColumn(8),
  },
  spacer: {
    flex: 1,
  },
  next: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "5%",
    borderRadius: Radius.xxl,
  },
});

export default function HandoffScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const accent = useColor(AppColor.accent);

  return (
    <View
      style={[
        handoffStyles.container,
        { backgroundColor: background, paddingTop: insets.top },
      ]}
    >
      <View style={handoffStyles.content}>
        <View style={handoffStyles.heading}>
          <Text huge bold>
            Pass the phone over
          </Text>
          <Text neutral muted>
            The next few screens are for whoever set this up. It takes about a
            minute, and then you get the phone back.
          </Text>
        </View>

        <View style={handoffStyles.spacer} />

        <Pressable
          onPress={() =>
            router.replace(
              Platform.OS === "android" ? "/step-permissions" : "/setup",
            )
          }
          style={[handoffStyles.next, { backgroundColor: accent }]}
        >
          <Text large extrabold onFilled>
            Ready
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
