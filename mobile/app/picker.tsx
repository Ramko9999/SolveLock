import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { DeviceActivitySelectionView } from "react-native-device-activity";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { enforcement } from "@/enforcement";
import { gate, type InstalledApp } from "@/enforcement/gate";
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

const appRowStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    width: "100%",
    paddingVertical: "3.5%",
    paddingHorizontal: "4%",
    borderRadius: Radius.xl,
    gap: 14,
  },
  icon: {
    width: "12%",
    aspectRatio: 1,
    borderRadius: Radius.md,
  },
  label: {
    flex: 1,
  },
});

type AppRowProps = {
  app: InstalledApp;
  picked: boolean;
  onPress: () => void;
};

function AppRow({ app, picked, onPress }: AppRowProps) {
  const fill = useColor(AppColor.fill);
  const accent = useColor(AppColor.accent);

  return (
    <Pressable
      onPress={onPress}
      style={[
        appRowStyles.container,
        { backgroundColor: picked ? accent : fill },
      ]}
    >
      {app.icon ? (
        <Image source={{ uri: app.icon }} style={appRowStyles.icon} />
      ) : (
        <View style={appRowStyles.icon} />
      )}
      <Text neutral semibold onFilled={picked} style={appRowStyles.label}>
        {app.label}
      </Text>
      <Text large bold onFilled={picked} muted={!picked}>
        {picked ? "✓" : ""}
      </Text>
    </Pressable>
  );
}

const androidPickerStyles = StyleSheet.create({
  list: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "6%",
    paddingBottom: "4%",
    gap: 8,
  },
  message: {
    ...StyleUtils.flexColumnCenterAll(8),
    flex: 1,
    paddingHorizontal: "8%",
    paddingVertical: "20%",
  },
});

function AndroidPicker() {
  const gatedPackages = useSetupStore((s) => s.gatedPackages);
  const toggleGatedPackage = useSetupStore((s) => s.toggleGatedPackage);
  const [apps, setApps] = useState<InstalledApp[] | null>(null);

  useEffect(() => {
    const native = gate;
    if (!native) {
      setApps([]);
      return;
    }
    native.getInstalledApps().then(setApps);
  }, []);

  if (apps === null) {
    return (
      <View style={androidPickerStyles.message}>
        <Text small muted>
          Reading the apps on this phone...
        </Text>
      </View>
    );
  }

  if (apps.length === 0) {
    return (
      <View style={androidPickerStyles.message}>
        <Text large bold>
          No apps found
        </Text>
        <Text small muted style={{ textAlign: "center" }}>
          Rebuild the app. Reading the list needs the native module.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={androidPickerStyles.list}>
      {apps.map((app) => (
        <AppRow
          key={app.packageName}
          app={app}
          picked={gatedPackages.includes(app.packageName)}
          onPress={() => toggleGatedPackage(app.packageName)}
        />
      ))}
    </ScrollView>
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
  const gatedCount = useSetupStore((s) => s.gatedPackages.length);
  const [iosCount, setIosCount] = useState(
    (saved?.categoryCount ?? 0) + (saved?.applicationCount ?? 0),
  );

  const isAndroid = Platform.OS === "android";
  const native = enforcement.kind === "native";
  const count = isAndroid ? gatedCount : iosCount;

  return (
    <View style={[pickerStyles.container, { backgroundColor: background }]}>
      <View style={[pickerStyles.heading, { paddingTop: insets.top + 16 }]}>
        <Text huge bold>
          Choose what to gate
        </Text>
        <Text small muted>
          {isAndroid
            ? "Tap an app to gate it. Tap again to let it through."
            : "A category also covers apps installed later."}
        </Text>
      </View>

      {isAndroid ? (
        <AndroidPicker />
      ) : native ? (
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
            setIosCount(next.applicationCount + next.categoryCount);
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
            if (!isAndroid && !native) {
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
