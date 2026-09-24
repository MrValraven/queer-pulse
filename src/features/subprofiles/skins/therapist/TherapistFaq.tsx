import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TherapistSection } from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import styles from "./TherapistSections.module.css";

/** "Answered before you have to ask": the therapist's FAQ as native
 *  disclosure rows, the first one open. `null` without questions. */
export function TherapistFaq({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  if (view.faq.length === 0) return null;

  return (
    <TherapistSection
      label={t("subprofiles:therapist.faq.label", { name: view.firstName })}
      heading={t("subprofiles:therapist.faq.heading")}
      editTarget={THERAPIST_EDIT_TARGETS.faq}
    >
      <div className={styles.faq}>
        {view.faq.map((entry, entryIndex) => (
          <details
            key={`${entry.question}-${entryIndex}`}
            className={styles.faqItem}
            open={entryIndex === 0}
          >
            <summary className={styles.faqSummary}>
              <span>{entry.question}</span>
              <FiPlus className={styles.faqIcon} aria-hidden="true" />
            </summary>
            {entry.answer !== "" && (
              <p className={styles.faqAnswer}>{entry.answer}</p>
            )}
          </details>
        ))}
      </div>
    </TherapistSection>
  );
}
