import { FiHelpCircle, FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ACCESSIBILITY_ANSWER_BY_ID,
  ACCESSIBILITY_QUESTIONS,
  type ListingAccessibilityView,
} from "./listBusiness/listingAccessibility.data";
import s from "./DirectoryAccessibility.module.css";

/**
 * The venue's accessibility answers, read by someone deciding whether they can
 * leave the house for this place.
 *
 * Three genuinely different states, and all three are information:
 *
 * - `yes`: a jade tick and the word "Yes".
 * - `no`: a plum cross and the word "No", on the same solid card as a yes.
 *   An honest no is a service to the person reading it, so nothing here treats
 *   it as a failure: no alarm colour, no strike-through, no apology.
 * - `unknown`: a question mark on a dashed, unfilled card, with its own
 *   wording ("Nobody has told us"), plus a line underneath spelling out what
 *   that means. It is never dropped and never drawn as a no: "we have not been
 *   told" is a fact a member plans around, usually by asking first.
 *
 * The owner's free-text note leads, above the answers, because a sentence like
 * "two steps at the door, staff will help with the ramp" carries more than six
 * ticks can.
 */
export function DirectoryAccessibilityAnswers({
  accessibility,
  ownerFirstName,
}: {
  accessibility: ListingAccessibilityView;
  /** The owner's first name, for attributing the note. Empty for an anonymous
   *  or role-only listing, which falls back to unattributed wording. */
  ownerFirstName: string;
}) {
  const { t } = useTranslation();
  const note = accessibility.note?.trim() ?? "";
  const unansweredCount = ACCESSIBILITY_QUESTIONS.filter(
    (question) => accessibility.answers[question.slug] === "unknown",
  ).length;

  return (
    <div>
      {note !== "" && (
        <div className={s.note}>
          <span className={s.noteIcon} aria-hidden>
            <FiMessageSquare />
          </span>
          <div className={s.noteBody}>
            <span className={s.noteLabel}>
              {t(
                ownerFirstName
                  ? "marketing:directory.detail.accessibility.noteLabelNamed"
                  : "marketing:directory.detail.accessibility.noteLabel",
                { name: ownerFirstName },
              )}
            </span>
            <p className={s.noteText}>{note}</p>
          </div>
        </div>
      )}

      <ul className={s.list}>
        {ACCESSIBILITY_QUESTIONS.map((question) => {
          const answer = accessibility.answers[question.slug];
          const definition = ACCESSIBILITY_ANSWER_BY_ID[answer];
          const AnswerIcon = definition.icon;
          return (
            <li key={question.slug} className={s.row} data-answer={answer}>
              <span className={s.mark} aria-hidden>
                <AnswerIcon />
              </span>
              <span className={s.text}>
                <span className={s.answer}>{t(definition.readerKey)}</span>
                <span className={s.question}>{t(question.labelKey)}</span>
                <span className={s.help}>{t(question.helpKey)}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {unansweredCount > 0 && (
        <p className={s.unansweredLine}>
          <FiHelpCircle aria-hidden />
          <span>
            {t("marketing:directory.detail.accessibility.unansweredLine", {
              count: unansweredCount,
            })}
          </span>
        </p>
      )}
    </div>
  );
}
