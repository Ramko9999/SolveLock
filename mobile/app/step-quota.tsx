import { useRouter } from "expo-router";
import { ChoiceList } from "@/components/util/choice-list";
import { WizardStep } from "@/components/util/wizard-step";
import { QUOTA_CHOICES, useSetupStore } from "@/store/setup";

export default function StepQuotaScreen() {
  const router = useRouter();
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);
  const setQuotaMinutes = useSetupStore((s) => s.setQuotaMinutes);

  return (
    <WizardStep
      step={3}
      total={5}
      title="How long between checks"
      detail="Time spent inside the gated apps, not time on the clock."
      nextLabel="Next"
      nextEnabled
      onNext={() => router.push("/step-problems")}
    >
      <ChoiceList
        choices={QUOTA_CHOICES.map((minutes) => ({
          value: minutes,
          label: `${minutes} ${minutes === 1 ? "minute" : "minutes"}`,
          detail: minutes < 10 ? "for testing" : undefined,
        }))}
        selected={quotaMinutes}
        onSelect={setQuotaMinutes}
      />
    </WizardStep>
  );
}
