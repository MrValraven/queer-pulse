import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TherapistSection } from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { RevealBlock, RevealList } from "./TherapistReveal";
import { useRowReveal } from "./revealKeys";
import { useStableRowKeys } from "./useStableRowKeys";
import styles from "./TherapistSections.module.css";

/** The reading column's flex gap (TherapistBody.module.css `.main`). */
const COLUMN_GAP = 16;

/** One disclosure row. A question added by an edit grows in and a removed
 *  one folds away (the `.faq` column has no gap). A direct child of
 *  `RevealList`. */
function FaqRow({
  question,
  answer,
  isOpen,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
}) {
  const rowRef = useRowReveal<HTMLDetailsElement>(0);
  return (
    <details ref={rowRef} className={styles.faqItem} open={isOpen}>
      <summary className={styles.faqSummary}>
        <span>{question}</span>
        <FiPlus className={styles.faqIcon} aria-hidden="true" />
      </summary>
      {answer !== "" && <p className={styles.faqAnswer}>{answer}</p>}
    </details>
  );
}

/** "Answered before you have to ask": the therapist's FAQ as native
 *  disclosure rows, the first one open. Grows in with its first question
 *  and folds away with its last. */
export function TherapistFaq({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const entryKeys = useStableRowKeys(view.faq.map((entry) => entry.question));

  return (
    <RevealBlock isShown={view.faq.length > 0} parentGap={COLUMN_GAP}>
      <TherapistSection
        label={t("subprofiles:therapist.faq.label", { name: view.firstName })}
        heading={t("subprofiles:therapist.faq.heading")}
        editTarget={THERAPIST_EDIT_TARGETS.faq}
      >
        <div className={styles.faq}>
          <RevealList>
            {view.faq.map((entry, entryIndex) => (
              <FaqRow
                key={entryKeys[entryIndex]}
                question={entry.question}
                answer={entry.answer}
                isOpen={entryIndex === 0}
              />
            ))}
          </RevealList>
        </div>
      </TherapistSection>
    </RevealBlock>
  );
}
