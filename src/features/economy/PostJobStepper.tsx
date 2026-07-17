import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STEP_LABEL_KEYS } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobStepper({
  step,
  onGo,
}: {
  step: number;
  /** Jump to a step (only allowed backwards / to visited steps by the caller). */
  onGo: (i: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.stepper}>
      {STEP_LABEL_KEYS.map((labelKey, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={labelKey} style={{ display: "contents" }}>
            <button
              type="button"
              className={[
                styles.stepNode,
                active && styles.stepActive,
                done && styles.stepDone,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={active ? "step" : undefined}
              onClick={() => onGo(i)}
            >
              <span className={styles.stepDot}>
                {done ? <FiCheck aria-hidden /> : i + 1}
              </span>
              <span className={styles.stepName}>{t(labelKey)}</span>
            </button>
            {i < STEP_LABEL_KEYS.length - 1 && (
              <span
                className={[styles.stepLine, done && styles.stepLineDone]
                  .filter(Boolean)
                  .join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
