import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { DeviceActivitySelectionView } from "react-native-device-activity";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { enforcement } from "@/enforcement";
import { type Selection, useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

const EMPTY: Selection = {
  categories: [],
  applicationCount: 0,
  categoryCount: 0,
  webDomainCount: 0,
  includeEntireCategory: true,
  token: null,
};

const unavailableStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(8),
    flex: 1,
    paddingHorizontal: "8%",
  },
});

function PickerUnavailable() {
  return (
    <View style={unavailableStyles.container}>
      <Text large bold>
        Not available here
      </Text>
      <Text small muted style={{ textAlign: "center" }}>
        Choosing apps needs Apple's Screen Time picker, which only exists in a
        development build. Run one to pick what to gate.
      </Text>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    ...StyleUtils.flexColumn(4),
    paddingHorizontal: "6%",
    paddingTop: "6%",
    paddingBottom: "4%",
  },
  selector: {
    flex: 1,
  },
  footer: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "6%",
    paddingTop: "4%",
  },
  done: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "4.5%",
    borderRadius: Radius.xxl,
  },
});

export default function PickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const accent = useColor(AppColor.accent);
  const fill = useColor(AppColor.fill);
  const setSelection = useSetupStore((s) => s.setSelection);
  const saved = useSetupStore((s) => s.selection);
  const [count, setCount] = useState(
    (saved?.categoryCount ?? 0) + (saved?.applicationCount ?? 0),
  );

  const native = enforcement.kind === "native";

  return (
    <View style={[pickerStyles.container, { backgroundColor: background }]}>
      <View style={pickerStyles.heading}>
        <Text huge bold>
          Choose what to gate
        </Text>
        <Text small muted>
          A category also covers apps installed later.
        </Text>
      </View>

      {native ? (
        <DeviceActivitySelectionView
          style={pickerStyles.selector}
          familyActivitySelection={saved?.token ?? null}
          onSelectionChange={(event) => {
            const next = event.nativeEvent;
            enforcement.setSelection(next.familyActivitySelection);
            setSelection({
              categories: [],
              applicationCount: next.applicationCount,
              categoryCount: next.categoryCount,
              webDomainCount: next.webDomainCount,
              includeEntireCategory: true,
              token: next.familyActivitySelection,
            });
            setCount(next.applicationCount + next.categoryCount);
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <PickerUnavailable />
        </ScrollView>
      )}

      <View
        style={[pickerStyles.footer, { paddingBottom: insets.bottom + 16 }]}
      >
        <Pressable
          onPress={() => {
            if (!native) {
              setSelection(EMPTY);
            }
            router.back();
          }}
          style={[
            pickerStyles.done,
            { backgroundColor: count > 0 ? accent : fill },
          ]}
        >
          <Text large extrabold onFilled={count > 0} muted={count === 0}>
            {count > 0 ? "Done" : "Close"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
