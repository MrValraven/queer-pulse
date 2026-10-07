import { FiHeart } from "react-icons/fi";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  ACCESSIBILITY_NOTE_MAX,
  accessibilityQuestionsFor,
  listingAnswerOf,
  normalizeAccessibilityDraft,
} from "../listingAccessibility.data";
import type { ListingForm } from "../useListingForm";
import { ListingAccessibilityQuestion } from "./ListingAccessibilityQuestion";
import styles from "./ListingAccessibility.module.css";

/**
 * The owner's accessibility answers: six fixed questions, three answers each,
 * plus the free-text note that carries what a checklist cannot. An online-only
 * listing answers four questions about using it online in place of the six
 * about a building.
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
  // Healed on read, so a listing saved before these questions existed edits
  // with every question unanswered, and never crashes on a missing map.
  const accessibility = normalizeAccessibilityDraft(draft.accessibility);
  const questions = accessibilityQuestionsFor(draft.online);
  // An online listing reads its own copy: there is no building to describe.
  const copy = draft.online
    ? {
        intro: "marketing:listBusiness.accessibility.introOnline",
        reassurance: "marketing:listBusiness.accessibility.reassuranceOnline",
        noteHint: "marketing:listBusiness.accessibility.noteHintOnline",
        notePlaceholder:
          "marketing:listBusiness.accessibility.notePlaceholderOnline",
      }
    : {
        intro: "marketing:listBusiness.accessibility.intro",
        reassurance: "marketing:listBusiness.accessibility.reassurance",
        noteHint: "marketing:listBusiness.accessibility.noteHint",
        notePlaceholder: "marketing:listBusiness.accessibility.notePlaceholder",
      };

  return (
    <div id={ANCHOR.accessibility}>
      <p className={styles.intro}>{t(copy.intro)}</p>
      <p className={styles.reassurance}>
        <span className={styles.reassuranceIcon} aria-hidden>
          <FiHeart />
        </span>
        <span>{t(copy.reassurance)}</span>
      </p>

      <div className={styles.questions}>
        {questions.map((question) => (
          <ListingAccessibilityQuestion
            key={question.slug}
            question={question}
            answer={listingAnswerOf(accessibility.answers, question.slug)}
            onChange={setAccessibilityAnswer}
          />
        ))}
      </div>

      <FormField
        className={styles.noteField}
        label={t("marketing:listBusiness.accessibility.noteLabel")}
        helper={t(copy.noteHint)}
        labelAside={
          <span aria-hidden>
            {accessibility.note.length}/{ACCESSIBILITY_NOTE_MAX}
          </span>
        }
      >
        <textarea
          rows={3}
          maxLength={ACCESSIBILITY_NOTE_MAX}
          placeholder={t(copy.notePlaceholder)}
          value={accessibility.note}
          onChange={(event) => setAccessibilityNote(event.target.value)}
        />
      </FormField>
    </div>
  );
}
