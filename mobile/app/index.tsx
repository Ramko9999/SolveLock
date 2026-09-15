import { StyleSheet } from "react-native";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { StyleUtils } from "@/theme/style-utils";

const homeStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(8),
    flex: 1,
    paddingHorizontal: "8%",
  },
});

export default function HomeScreen() {
  const background = useColor(AppColor.background);

  return (
    <View style={[homeStyles.container, { backgroundColor: background }]}>
      <Text huge bold>
        SolveLock
      </Text>
      <Text small muted>
        Nothing here yet.
      </Text>
    </View>
  );
}
