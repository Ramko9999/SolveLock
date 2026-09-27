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
    paddingVertical: "3%",
    paddingLeft: "12%",
    paddingRight: "5%",
    borderRadius: Radius.lg,
    gap: 12,
  },
  icon: {
    width: "10%",
    aspectRatio: 1,
    borderRadius: Radius.sm,
  },
  label: {
    flex: 1,
  },
});

type AppRowProps = {
  app: InstalledApp;
  picked: boolean;
  /** Covered by its category, so the row reports rather than offers. */
  byCategory: boolean;
  onPress: () => void;
};

function AppRow({ app, picked, byCategory, onPress }: AppRowProps) {
  const fill = useColor(AppColor.fill);
  const accent = useColor(AppColor.accent);
  const muted = useColor(AppColor.muted);

  return (
    <Pressable
      onPress={onPress}
      disabled={byCategory}
      style={[
        appRowStyles.container,
        { backgroundColor: !byCategory && picked ? fill : "transparent" },
      ]}
    >
      {app.icon ? (
        <Image source={{ uri: app.icon }} style={appRowStyles.icon} />
      ) : (
        <View style={appRowStyles.icon} />
      )}
      <Text small semibold muted={byCategory} style={appRowStyles.label}>
        {app.label}
      </Text>
      <Text neutral bold style={{ color: picked ? accent : muted }}>
        {picked ? "\u2713" : ""}
      </Text>
    </Pressable>
  );
}

const groupRowStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    width: "100%",
    paddingVertical: "4%",
    paddingLeft: "4%",
    paddingRight: "2%",
    borderRadius: Radius.xl,
    gap: 10,
  },
  chevron: {
    width: "6%",
  },
  label: {
    flex: 1,
  },
  tick: {
    ...StyleUtils.flexRowCenterAll(),
    paddingVertical: "3%",
    paddingHorizontal: "5%",
  },
});

type Group = {
  category: number;
  label: string;
  apps: InstalledApp[];
};

type GroupRowProps = {
  group: Group;
  open: boolean;
  picked: boolean;
  chosen: number;
  onToggleOpen: () => void;
  onTogglePicked: () => void;
};

function GroupRow({
  group,
  open,
  picked,
  chosen,
  onToggleOpen,
  onTogglePicked,
}: GroupRowProps) {
  const fill = useColor(AppColor.fill);
  const accent = useColor(AppColor.accent);
  const muted = useColor(AppColor.muted);

  return (
    <Pressable
      onPress={onToggleOpen}
      style={[
        groupRowStyles.container,
        { backgroundColor: picked ? accent : fill },
      ]}
    >
      <Text neutral bold onFilled={picked} style={groupRowStyles.chevron}>
        {open ? "\u25be" : "\u25b8"}
      </Text>
      <Text neutral semibold onFilled={picked} style={groupRowStyles.label}>
        {group.label}
      </Text>
      <Text
        small
        onFilled={picked}
        style={picked ? undefined : { color: muted }}
      >
        {picked
          ? "all"
          : chosen > 0
            ? `${chosen} of ${group.apps.length}`
            : `${group.apps.length}`}
      </Text>
      <Pressable
        onPress={onTogglePicked}
        hitSlop={8}
        style={groupRowStyles.tick}
      >
        <Text
          large
          bold
          onFilled={picked}
          style={picked ? undefined : { color: accent }}
        >
          {picked ? "\u2713" : "\u25cb"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const androidPickerStyles = StyleSheet.create({
  list: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "6%",
    paddingBottom: "4%",
    gap: 6,
  },
  message: {
    ...StyleUtils.flexColumnCenterAll(8),
    flex: 1,
    paddingHorizontal: "8%",
    paddingVertical: "20%",
  },
});

const OTHER = -1;

/**
 * Every app lives in exactly one group. Games first because that is what a
 * parent came for, then the biggest groups, and the apps that declare no
 * category last.
 */
function groupByCategory(apps: InstalledApp[]): Group[] {
  const groups = new Map<number, Group>();
  for (const app of apps) {
    const category = app.category < 0 ? OTHER : app.category;
    const label =
      category === OTHER ? "Everything else" : (app.categoryLabel ?? "Other");
    const seen = groups.get(category);
    if (seen) {
      seen.apps.push(app);
    } else {
      groups.set(category, { category, label, apps: [app] });
    }
  }
  return [...groups.values()].sort((a, b) => {
    if (a.category === OTHER) {
      return 1;
    }
    if (b.category === OTHER) {
      return -1;
    }
    if (a.category === 0) {
      return -1;
    }
    if (b.category === 0) {
      return 1;
    }
    return b.apps.length - a.apps.length || a.label.localeCompare(b.label);
  });
}

function AndroidPicker() {
  const gatedPackages = useSetupStore((s) => s.gatedPackages);
  const gatedCategories = useSetupStore((s) => s.gatedCategories);
  const toggleGatedPackage = useSetupStore((s) => s.toggleGatedPackage);
  const toggleGatedCategory = useSetupStore((s) => s.toggleGatedCategory);
  const [apps, setApps] = useState<InstalledApp[] | null>(null);
  const [open, setOpen] = useState<number[]>([]);

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
      {groupByCategory(apps).map((group) => {
        const whole =
          group.category !== OTHER && gatedCategories.includes(group.category);
        const chosen = group.apps.filter((app) =>
          gatedPackages.includes(app.packageName),
        ).length;
        const isOpen = open.includes(group.category);

        return (
          <View key={group.category}>
            <GroupRow
              group={group}
              open={isOpen}
              picked={whole}
              chosen={chosen}
              onToggleOpen={() =>
                setOpen((current) =>
                  current.includes(group.category)
                    ? current.filter((one) => one !== group.category)
                    : [...current, group.category],
                )
              }
              onTogglePicked={() => {
                if (group.category !== OTHER) {
                  toggleGatedCategory(group.category);
                }
              }}
            />
            {isOpen
              ? group.apps.map((app) => (
                  <AppRow
                    key={app.packageName}
                    app={app}
                    picked={whole || gatedPackages.includes(app.packageName)}
                    byCategory={whole}
                    onPress={() => toggleGatedPackage(app.packageName)}
                  />
                ))
              : null}
          </View>
        );
      })}
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
  const gatedCount = useSetupStore(
    (s) => s.gatedPackages.length + s.gatedCategories.length,
  );
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
            ? "Tick a whole category, or open it and pick apps one by one."
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
