import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Diagnostics } from "@/enforcement";
import { enforcement } from "@/enforcement";
import { useQuotaStore } from "@/store/quota";
import { QUOTA_CHOICES, useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

const choiceStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
    paddingVertical: "3.5%",
    borderRadius: Radius.lg,
  },
});

type ChoiceProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Choice({ label, selected, onPress }: ChoiceProps) {
  const accent = useColor(AppColor.accent);
  const fill = useColor(AppColor.fill);

  return (
    <Pressable
      onPress={onPress}
      style={[
        choiceStyles.container,
        { backgroundColor: selected ? accent : fill },
      ]}
    >
      <Text small extrabold onFilled={selected}>
        {label}
      </Text>
    </Pressable>
  );
}

const actionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "4%",
    borderRadius: Radius.xl,
  },
});

type ActionProps = {
  label: string;
  onPress: () => void;
};

function Action({ label, onPress }: ActionProps) {
  const fill = useColor(AppColor.fill);

  return (
    <Pressable
      onPress={onPress}
      style={[actionStyles.container, { backgroundColor: fill }]}
    >
      <Text sneutral bold>
        {label}
      </Text>
    </Pressable>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(8),
    width: "100%",
    paddingTop: "7%",
  },
});

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={sectionStyles.container}>
      <Text tiny bold muted>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "6%",
    paddingBottom: "14%",
  },
  row: {
    ...StyleUtils.flexRow(8),
    width: "100%",
  },
  dump: {
    width: "100%",
    padding: "4%",
    borderRadius: Radius.lg,
  },
});

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const fill = useColor(AppColor.fill);
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);
  const setQuotaMinutes = useSetupStore((s) => s.setQuotaMinutes);
  const setArmedAt = useSetupStore((s) => s.setArmedAt);
  const token = useSetupStore((s) => s.selection?.token ?? null);
  const status = useQuotaStore((s) => s.status);
  const startQuota = useQuotaStore((s) => s.startQuota);
  const stopQuota = useQuotaStore((s) => s.stopQuota);
  const clearShield = useQuotaStore((s) => s.clearShield);
  const tripForTesting = useQuotaStore((s) => s.tripForTesting);
  const [report, setReport] = useState<Diagnostics | null>(null);

  return (
    <View
      style={[
        settingsStyles.container,
        { backgroundColor: background, paddingTop: insets.top },
      ]}
    >
      <ScrollView contentContainerStyle={settingsStyles.content}>
        <Section title="Quota">
          <View style={settingsStyles.row}>
            {QUOTA_CHOICES.map((minutes) => (
              <Choice
                key={minutes}
                label={`${minutes} min`}
                selected={minutes === quotaMinutes}
                onPress={() => setQuotaMinutes(minutes)}
              />
            ))}
          </View>
        </Section>

        <Section title={`Monitoring · ${status}`}>
          <Action
            label="Arm the quota"
            onPress={() => {
              setArmedAt(Date.now());
              startQuota(quotaMinutes, token);
            }}
          />
          <Action
            label="Stop monitoring"
            onPress={() => {
              setArmedAt(null);
              stopQuota();
            }}
          />
          <Action
            label="Clear the shield"
            onPress={() => {
              setArmedAt(null);
              clearShield();
            }}
          />
          {enforcement.kind === "fake" ? (
            <Action label="Trip the quota now" onPress={tripForTesting} />
          ) : null}
        </Section>

        <Section title="Apps">
          <Action
            label="Change what is gated"
            onPress={() => router.push("/picker")}
          />
        </Section>

        <Section title="Diagnostics">
          <Action
            label="Read the App Group"
            onPress={() => setReport(enforcement.diagnostics())}
          />
          {report ? (
            <View style={[settingsStyles.dump, { backgroundColor: fill }]}>
              <Text tiny mono>
                {JSON.stringify(report, null, 2)}
              </Text>
            </View>
          ) : null}
        </Section>
      </ScrollView>
    </View>
  );
}
