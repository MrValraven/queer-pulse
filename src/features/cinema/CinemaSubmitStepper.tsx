import { FiCheck } from "react-icons/fi";
import { useTablistKeys } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SUBMIT_STEPS } from "./cinemaSubmit.data";
import styles from "./CinemaSubmitPage.module.css";

interface StepperProps {
  step: number;
  /** Highest step reached — steps up to here are clickable. */
  reached: number;
  onGo: (n: number) => void;
}

/** Five-stage progress stepper. Done steps get a jade tick and jump back;
 * future steps are disabled until reached. */
export function CinemaSubmitStepper({ step, reached, onGo }: StepperProps) {
  const { t } = useTranslation();
  // APG tablist keys, skipping steps the member has not reached yet: arrowing
  // onto a disabled step would park focus somewhere that cannot be activated.
  const { tabProps } = useTablistKeys(
    SUBMIT_STEPS.length,
    onGo,
    (index) => index <= reached,
  );
  return (
    <div
      className={styles.stepper}
      role="tablist"
      aria-label={t("cinema:submit.stepper.ariaLabel")}
    >
      {SUBMIT_STEPS.map((s, i) => {
        const active = i === step;
        const done = i < step;
        const reachable = i <= reached;
        return (
          <button
            key={s.labelKey}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={!reachable}
            {...tabProps(i, active)}
            onClick={() => reachable && onGo(i)}
            className={[
              styles.step,
              active && styles.stepActive,
              done && styles.stepDone,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles.stepNum}>
              {done ? <FiCheck size={14} aria-hidden /> : i + 1}
            </span>
            <span>
              <span className={styles.stepLabel}>{t(s.labelKey)}</span>
              <span className={styles.stepSub}>{t(s.subKey)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
