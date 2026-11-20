import { useId } from "react";
import { FiClock } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CulturalGuideStepDTO } from "./api/culturalProduction.types";
import { stepWhenOf } from "./taskDueState";
import styles from "./GuidePage.module.css";

/**
 * A section's checklist, read only: each step in order with when it falls
 * against the event day in a quiet chip. Progress lives on the tasks a
 * producer creates from the guide, so the steps carry no tick.
 */
export function GuideChecklist({ steps }: { steps: CulturalGuideStepDTO[] }) {
  const { t } = useTranslation();
  const headingId = useId();
  if (steps.length === 0) return null;
  return (
    <div className={styles.checklist}>
      <h3 id={headingId} className={styles.checklistHeading}>
        {t("admin:culturalProduction.guides.page.checklistHeading")}
      </h3>
      <ol className={styles.steps} aria-labelledby={headingId}>
        {steps.map((step, index) => {
          const when = stepWhenOf(step.daysBefore);
          return (
            <li key={step.id} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden>
                {index + 1}
              </span>
              <span className={styles.stepText}>{step.text}</span>
              <span className={styles.stepWhen}>
                <FiClock aria-hidden />
                {t(
                  when.key,
                  when.count === undefined ? undefined : { count: when.count },
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
