import { FiHeart } from "react-icons/fi";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  ACCESSIBILITY_NOTE_MAX,
  ACCESSIBILITY_QUESTIONS,
  normalizeAccessibilityDraft,
} from "../listingAccessibility.data";
import type { ListingForm } from "../useListingForm";
import { ListingAccessibilityQuestion } from "./ListingAccessibilityQuestion";
import styles from "./ListingAccessibility.module.css";

/**
 * The owner's accessibility answers: six fixed questions, three answers each,
 * plus the free-text note that carries what a checklist cannot.
 *
 * Two things this editor is built to do.
 *
 * First, make "no" ordinary. An owner telling someone there are two steps at
 * the door is doing right by that person, and a UI that made "no" the small,
 * red, guilty-looking option would quietly push owners toward silence instead.
 * So the three buttons are the same size and weight, and the panel above says
 * out loud that an honest no is useful.
 *
 * Second, keep "not answered" available and real. It is the starting state and
 * a legitimate final answer: a business genuinely may not know whether its
 * toilet meets the standard. Forcing a guess would put a fabricated yes in
 * front of someone who depends on the true one.
 */
export function ListingAccessibilityFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, setAccessibilityAnswer, setAccessibilityNote } = form;
  // Healed on read, so a listing saved before these questions existed edits as
  // six unanswered questions rather than crashing on a missing map.
  const accessibility = normalizeAccessibilityDraft(draft.accessibility);

  return (
    <div id={ANCHOR.accessibility}>
      <p className={styles.intro}>
        {t("marketing:listBusiness.accessibility.intro")}
      </p>
      <p className={styles.reassurance}>
        <span className={styles.reassuranceIcon} aria-hidden>
          <FiHeart />
        </span>
        <span>{t("marketing:listBusiness.accessibility.reassurance")}</span>
      </p>

      <div className={styles.questions}>
        {ACCESSIBILITY_QUESTIONS.map((question) => (
          <ListingAccessibilityQuestion
            key={question.slug}
            question={question}
            answer={accessibility.answers[question.slug]}
            onChange={setAccessibilityAnswer}
          />
        ))}
      </div>

      <FormField
        className={styles.noteField}
        label={t("marketing:listBusiness.accessibility.noteLabel")}
        helper={t("marketing:listBusiness.accessibility.noteHint")}
        labelAside={
          <span aria-hidden>
            {accessibility.note.length}/{ACCESSIBILITY_NOTE_MAX}
          </span>
        }
      >
        <textarea
          rows={3}
          maxLength={ACCESSIBILITY_NOTE_MAX}
          placeholder={t(
            "marketing:listBusiness.accessibility.notePlaceholder",
          )}
          value={accessibility.note}
          onChange={(event) => setAccessibilityNote(event.target.value)}
        />
      </FormField>
    </div>
  );
}
