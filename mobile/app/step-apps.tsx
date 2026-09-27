import { useRouter } from "expo-router";
import { AndroidPicker } from "@/components/picker/android-picker";
import { WizardStep } from "@/components/util/wizard-step";
import { useSetupStore } from "@/store/setup";

export default function StepAppsScreen() {
  const router = useRouter();
  const chosen = useSetupStore(
    (s) => s.gatedPackages.length + s.gatedCategories.length,
  );

  return (
    <WizardStep
      step={2}
      total={5}
      title="What to gate"
      detail="Tick a whole category, or open it and pick apps one by one."
      nextLabel={chosen > 0 ? "Next" : "Pick at least one"}
      nextEnabled={chosen > 0}
      onNext={() => router.push("/step-quota")}
    >
      <AndroidPicker />
    </WizardStep>
  );
}
