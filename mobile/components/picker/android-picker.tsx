import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { gate, type InstalledApp } from "@/enforcement/gate";
import { useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

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

export function AndroidPicker() {
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
