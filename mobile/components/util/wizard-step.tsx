import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

const wizardStepStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    ...StyleUtils.flexColumn(6),
    paddingHorizontal: "6%",
    paddingBottom: "5%",
  },
  back: {
    ...StyleUtils.flexRow(4),
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: "2%",
    paddingRight: "8%",
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: "6%",
    paddingTop: "3%",
  },
  next: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "5%",
    borderRadius: Radius.xxl,
  },
});

type WizardStepProps = {
  step: number;
  total: number;
  title: string;
  detail?: string;
  nextLabel: string;
  nextEnabled: boolean;
  onNext: () => void;
  children: ReactNode;
};

export function WizardStep({
  step,
  total,
  title,
  detail,
  nextLabel,
  nextEnabled,
  onNext,
  children,
}: WizardStepProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const accent = useColor(AppColor.accent);
  const fill = useColor(AppColor.fill);

  return (
    <View
      style={[
        wizardStepStyles.container,
        { backgroundColor: background, paddingTop: insets.top + 8 },
      ]}
    >
      <View style={wizardStepStyles.header}>
        <Pressable
          onPress={() => router.back()}
          disabled={!router.canGoBack()}
          style={wizardStepStyles.back}
        >
          <Text small semibold muted>
            {router.canGoBack() ? "‹  " : ""}
            Step {step} of {total}
          </Text>
        </Pressable>
        <Text huge bold>
          {title}
        </Text>
        {detail ? (
          <Text small muted>
            {detail}
          </Text>
        ) : null}
      </View>

      <View style={wizardStepStyles.body}>{children}</View>

      <View
        style={[wizardStepStyles.footer, { paddingBottom: insets.bottom + 16 }]}
      >
        <Pressable
          onPress={onNext}
          disabled={!nextEnabled}
          style={[
            wizardStepStyles.next,
            { backgroundColor: nextEnabled ? accent : fill },
          ]}
        >
          <Text large extrabold onFilled={nextEnabled} muted={!nextEnabled}>
            {nextLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
