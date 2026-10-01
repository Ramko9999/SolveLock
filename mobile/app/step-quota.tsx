import { useRouter } from "expo-router";
import { useEffect } from "react";
import { DurationWheel } from "@/components/util/duration-wheel";
import { WizardStep } from "@/components/util/wizard-step";
import {
  DEFAULT_QUOTA_MINUTES,
  QUOTA_MINUTES,
  useSetupStore,
} from "@/store/setup";

export default function StepQuotaScreen() {
  const router = useRouter();
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);
  const setQuotaMinutes = useSetupStore((s) => s.setQuotaMinutes);

  // Diagnostics can leave a test value the wheel cannot show.
  useEffect(() => {
    if (!QUOTA_MINUTES.includes(quotaMinutes)) {
      setQuotaMinutes(DEFAULT_QUOTA_MINUTES);
    }
  }, [quotaMinutes, setQuotaMinutes]);

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
      <DurationWheel
        values={QUOTA_MINUTES}
        value={quotaMinutes}
        unit="minutes"
        onChange={setQuotaMinutes}
      />
    </WizardStep>
  );
}
