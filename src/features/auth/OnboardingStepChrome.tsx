import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./OnboardingPage.module.css";

export interface StepProps {
  stepLabel: string;
  onNext: () => void;
  onBack: () => void;
}

/** A clearly-styled "skip for now" affordance for non-critical steps. */
export function SkipLink({
  onSkip,
  label,
}: {
  onSkip: () => void;
  label?: string;
}) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.skip} onClick={onSkip}>
      {label ?? t("auth:onboarding.stepPhoto.skip")} <FiArrowRight aria-hidden />
    </button>
  );
}
