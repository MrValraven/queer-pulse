import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TherapistSection } from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import styles from "./TherapistSections.module.css";

/** Matches a fee-schedule label that names a 50-minute session
 *  ("50 min", "Individual, 50 minutes"). */
const FIFTY_MINUTES = /\b50\s*min/i;

/** "What actually happens": the first session as numbered steps. The eyebrow
 *  says "The first 50 minutes" only when the first fee-schedule row is a
 *  50-minute session. `null` without steps. */
export function TherapistFirstSession({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  if (view.firstSession.length === 0) return null;

  const isFiftyMinutes = FIFTY_MINUTES.test(view.feeSchedule[0]?.label ?? "");

  return (
    <TherapistSection
      label={t(
        isFiftyMinutes
          ? "subprofiles:therapist.firstSession.labelFifty"
          : "subprofiles:therapist.firstSession.label",
      )}
      heading={t("subprofiles:therapist.firstSession.heading")}
      editTarget={THERAPIST_EDIT_TARGETS.firstSession}
    >
      <ol className={styles.steps}>
        {view.firstSession.map((step, stepIndex) => (
          <li key={`${step.title}-${stepIndex}`} className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              {stepIndex + 1}
            </span>
            <div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              {step.body !== "" && (
                <p className={styles.stepBody}>{step.body}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </TherapistSection>
  );
}
