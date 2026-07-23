import { Stepper, type StepperStep } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STEP_LABEL_KEYS } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobStepper({
  step,
  onGo,
}: {
  step: number;
  /** Jump to a step (only allowed backwards / to visited steps by the caller). */
  onGo: (index: number) => void;
}) {
  const { t } = useTranslation();
  const steps: StepperStep[] = STEP_LABEL_KEYS.map((labelKey) => ({
    key: labelKey,
    label: t(labelKey),
  }));

  return (
    <div className={styles.stepper}>
      <Stepper
        steps={steps}
        current={step}
        size="md"
        marker="number"
        onStepClick={onGo}
        isStepClickable={() => true}
        ariaLabel={t("economy:postJob.stepLabels.ariaLabel")}
        className={styles.jobStepper}
      />
    </div>
  );
}
