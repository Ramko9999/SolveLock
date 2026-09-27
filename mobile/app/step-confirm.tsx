import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { WizardStep } from "@/components/util/wizard-step";
import { useQuotaStore } from "@/store/quota";
import { describeGatedPackages, useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

const summaryRowStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(3),
    width: "100%",
    paddingVertical: "4.5%",
    paddingHorizontal: "5%",
    borderRadius: Radius.xxl,
  },
});

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  const fill = useColor(AppColor.fill);

  return (
    <View style={[summaryRowStyles.container, { backgroundColor: fill }]}>
      <Text small bold muted>
        {label}
      </Text>
      <Text large semibold>
        {value}
      </Text>
    </View>
  );
}

const confirmStyles = StyleSheet.create({
  content: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "6%",
  },
});

export default function StepConfirmScreen() {
  const router = useRouter();
  const gatedPackages = useSetupStore((s) => s.gatedPackages);
  const gatedCategories = useSetupStore((s) => s.gatedCategories);
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);
  const problemsPerCheck = useSetupStore((s) => s.problemsPerCheck);
  const setArmedAt = useSetupStore((s) => s.setArmedAt);
  const role = useSetupStore((s) => s.role);
  const startQuota = useQuotaStore((s) => s.startQuota);

  const finish = () => {
    setArmedAt(Date.now());
    startQuota(quotaMinutes, null);
    router.replace("/");
  };

  return (
    <WizardStep
      step={5}
      total={5}
      title="Ready"
      detail={
        role === "child"
          ? "Hand the phone back when you tap this."
          : "This phone starts being gated when you tap this."
      }
      nextLabel="Start"
      nextEnabled
      onNext={finish}
    >
      <View style={confirmStyles.content}>
        <SummaryRow
          label="Gated"
          value={describeGatedPackages(gatedPackages, gatedCategories)}
        />
        <SummaryRow
          label="Check every"
          value={`${quotaMinutes} ${quotaMinutes === 1 ? "minute" : "minutes"}`}
        />
        <SummaryRow label="Problems per check" value={`${problemsPerCheck}`} />
      </View>
    </WizardStep>
  );
}
