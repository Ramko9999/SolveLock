import { useRouter } from "expo-router";
import {
  PermissionList,
  usePermissionStatus,
} from "@/components/setup/permission-list";
import { WizardStep } from "@/components/util/wizard-step";

export default function StepPermissionsScreen() {
  const router = useRouter();
  const { status, remaining } = usePermissionStatus();

  return (
    <WizardStep
      step={1}
      total={5}
      title={remaining === 0 ? "All set" : "Three permissions"}
      detail="Android grants each one on its own screen. Tap, allow, then come back here."
      nextLabel={remaining === 0 ? "Next" : `${remaining} still needed`}
      nextEnabled={remaining === 0}
      onNext={() => router.push("/step-apps")}
    >
      <PermissionList status={status} />
    </WizardStep>
  );
}
