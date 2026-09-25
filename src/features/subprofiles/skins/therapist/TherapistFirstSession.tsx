import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TherapistSection } from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { RevealBlock, RevealList, RevealPop } from "./TherapistReveal";
import { useStableRowKeys } from "./useStableRowKeys";
import styles from "./TherapistSections.module.css";

/** Matches a fee-schedule label that names a 50-minute session
 *  ("50 min", "Individual, 50 minutes"). */
const FIFTY_MINUTES = /\b50\s*min/i;

/** The reading column's flex gap (TherapistBody.module.css `.main`). */
const COLUMN_GAP = 16;

/** "What actually happens": the first session as numbered steps. The eyebrow
 *  says "The first 50 minutes" only when the first fee-schedule row is a
 *  50-minute session. Grows in with its first step and folds away with its
 *  last. */
export function TherapistFirstSession({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const isFiftyMinutes = FIFTY_MINUTES.test(view.feeSchedule[0]?.label ?? "");
  const stepKeys = useStableRowKeys(
    view.firstSession.map((step) => step.title),
  );

  return (
    <RevealBlock isShown={view.firstSession.length > 0} parentGap={COLUMN_GAP}>
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
          <RevealList>
            {view.firstSession.map((step, stepIndex) => (
              // A grid cell cannot glide, so an added step pops in and a
              // removed one pops out; the steps after it close up once it
              // unmounts.
              <RevealPop
                key={stepKeys[stepIndex]}
                as="li"
                className={styles.step}
              >
                <span className={styles.stepNumber} aria-hidden="true">
                  {stepIndex + 1}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  {step.body !== "" && (
                    <p className={styles.stepBody}>{step.body}</p>
                  )}
                </div>
              </RevealPop>
            ))}
          </RevealList>
        </ol>
      </TherapistSection>
    </RevealBlock>
  );
}
