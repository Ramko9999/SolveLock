import { useRouter } from "expo-router";
import { ChoiceList } from "@/components/util/choice-list";
import { WizardStep } from "@/components/util/wizard-step";
import { PROBLEM_CHOICES, useSetupStore } from "@/store/setup";

export default function StepProblemsScreen() {
  const router = useRouter();
  const problemsPerCheck = useSetupStore((s) => s.problemsPerCheck);
  const setProblemsPerCheck = useSetupStore((s) => s.setProblemsPerCheck);

  return (
    <WizardStep
      step={4}
      total={5}
      title="How many problems"
      detail="A child who clears three in twelve seconds does not resent twelve seconds."
      nextLabel="Next"
      nextEnabled
      onNext={() => router.push("/step-confirm")}
    >
      <ChoiceList
        choices={PROBLEM_CHOICES.map((count) => ({
          value: count,
          label: `${count} ${count === 1 ? "problem" : "problems"}`,
        }))}
        selected={problemsPerCheck}
        onSelect={setProblemsPerCheck}
      />
    </WizardStep>
  );
}
