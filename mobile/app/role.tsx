import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type Role, useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

const choiceStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(4),
    width: "100%",
    paddingVertical: "6%",
    paddingHorizontal: "6%",
    borderRadius: Radius.xxl,
  },
});

type ChoiceProps = {
  label: string;
  detail: string;
  onPress: () => void;
};

function Choice({ label, detail, onPress }: ChoiceProps) {
  const fill = useColor(AppColor.fill);

  return (
    <Pressable
      onPress={onPress}
      style={[choiceStyles.container, { backgroundColor: fill }]}
    >
      <Text large bold>
        {label}
      </Text>
      <Text small muted>
        {detail}
      </Text>
    </Pressable>
  );
}

const roleStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "6%",
    paddingBottom: "10%",
    gap: 12,
  },
  heading: {
    ...StyleUtils.flexColumn(6),
    paddingBottom: "8%",
  },
  spacer: {
    flex: 1,
  },
});

export default function RoleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const setRole = useSetupStore((s) => s.setRole);

  const choose = (role: Role) => {
    setRole(role);
    router.replace(role === "child" ? "/handoff" : "/setup");
  };

  return (
    <View
      style={[
        roleStyles.container,
        { backgroundColor: background, paddingTop: insets.top },
      ]}
    >
      <View style={[roleStyles.content, { paddingTop: "14%" }]}>
        <View style={roleStyles.heading}>
          <Text huge bold>
            Who is setting this up?
          </Text>
          <Text small muted>
            A parent does the setup either way. This decides who the phone
            belongs to afterwards.
          </Text>
        </View>

        <Choice
          label="I'm the parent"
          detail="Set up this phone now."
          onPress={() => choose("self")}
        />
        <Choice
          label="I'm the child"
          detail="Hand the phone to a parent to set it up."
          onPress={() => choose("child")}
        />

        <View style={roleStyles.spacer} />
      </View>
    </View>
  );
}
