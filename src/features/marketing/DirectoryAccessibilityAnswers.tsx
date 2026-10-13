import { Fragment } from "react";
import type { IconType } from "react-icons";
import {
  FiCheck,
  FiHelpCircle,
  FiMessageSquare,
  FiMinusCircle,
} from "react-icons/fi";
import { intlLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ACCESSIBILITY_QUESTIONS,
  listingAnswerOf,
  type AccessibilityAnswer,
  type AccessibilityQuestionDefinition,
  type ListingAccessibilitySlug,
  type ListingAccessibilityView,
} from "./listBusiness/listingAccessibility.data";
import s from "./DirectoryAccessibility.module.css";

/**
 * The venue's accessibility answers, read by someone deciding whether they can
 * leave the house for this place.
 *
 * Three genuinely different states, and all three are information:
 *
 * - `yes`: leads, as a light two-column amenity list. Each item is a small
 *   jade tick, the question and its help line; the tick carries the state on
 *   its own, so no "Yes" word repeats down the list.
 * - `no`: one quiet line under the list, a muted "Not available" label
 *   followed by every no. An honest no is a service to the person reading it,
 *   so it reads as plain fact: no alarm colour, no strike-through, no apology.
 * - `unknown`: one quiet footnote, "Not mentioned yet" and every unanswered
 *   question, closed by a nudge to ask. It keeps its own line apart from the
 *   noes because "we have not been told" is a separate fact, one a member
 *   plans around by asking.
 *
 * The noes and the unknowns are always shown. Each takes a single line so the
 * section dwells on what the place offers. With no yeses at all the list is
 * left out and the quiet lines stand alone.
 *
 * The owner's free-text note leads, above the answers, because a sentence like
 * "two steps at the door, staff will help with the ramp" carries more than six
 * ticks can.
 *
 * `questions` picks the set: the six about a building by default, or the four
 * online ones (`accessibilityQuestionsFor`). An online answer a payload does
 * not carry reads as `unknown` through `listingAnswerOf`.
 */
export function DirectoryAccessibilityAnswers({
  accessibility,
  ownerFirstName,
  questions = ACCESSIBILITY_QUESTIONS,
}: {
  accessibility: ListingAccessibilityView;
  /** The questions to show, in order. Defaults to the six place questions. */
  questions?: readonly AccessibilityQuestionDefinition<ListingAccessibilitySlug>[];
  /** The owner's first name, for attributing the note. Empty for an anonymous
   *  or role-only listing, which falls back to unattributed wording. */
  ownerFirstName: string;
}) {
  const { t, language } = useTranslation();
  const note = accessibility.note?.trim() ?? "";
  const questionsAnswered = (answer: AccessibilityAnswer) =>
    questions.filter(
      (question) =>
        listingAnswerOf(accessibility.answers, question.slug) === answer,
    );
  const yesQuestions = questionsAnswered("yes");
  const noQuestions = questionsAnswered("no");
  const unknownQuestions = questionsAnswered("unknown");
  const labelsOf = (questionList: typeof questions) =>
    questionList.map((question) => t(question.labelKey));

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

      {yesQuestions.length > 0 && (
        <ul className={s.list}>
          {yesQuestions.map((question) => (
            <li key={question.slug} className={s.item}>
              <span className={s.mark} aria-hidden>
                <FiCheck />
              </span>
              <span className={s.text}>
                <span className={s.question}>{t(question.labelKey)}</span>
                <span className={s.help}>{t(question.helpKey)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {(noQuestions.length > 0 || unknownQuestions.length > 0) && (
        <div className={s.quietLines}>
          {noQuestions.length > 0 && (
            <QuietLine
              Icon={FiMinusCircle}
              label={t(
                "marketing:directory.detail.accessibility.notAvailableLabel",
              )}
              items={labelsOf(noQuestions)}
              language={language}
            />
          )}
          {unknownQuestions.length > 0 && (
            <QuietLine
              Icon={FiHelpCircle}
              label={t(
                "marketing:directory.detail.accessibility.notMentionedLabel",
              )}
              items={labelsOf(unknownQuestions)}
              hint={t(
                "marketing:directory.detail.accessibility.notMentionedHint",
              )}
              language={language}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * One muted line: a semibold label, then the question labels joined in the
 * reader's language. Each label is its own span in a stronger ink so a
 * two-word question like "Quiet, low-sensory hours" reads as one unit, while
 * the locale's own separators ("and", "e") stay plain text between them.
 */
function QuietLine({
  Icon,
  label,
  items,
  hint,
  language,
}: {
  Icon: IconType;
  label: string;
  items: string[];
  hint?: string;
  language: Parameters<typeof intlLocale>[0];
}) {
  const parts = new Intl.ListFormat(intlLocale(language), {
    style: "long",
    type: "conjunction",
  }).formatToParts(items);
  return (
    <div className={s.quietLine}>
      <Icon aria-hidden />
      <span>
        <span className={s.quietLabel}>{label}</span>{" "}
        {parts.map((part, index) =>
          part.type === "element" ? (
            <span key={index} className={s.quietItem}>
              {part.value}
            </span>
          ) : (
            <Fragment key={index}>{part.value}</Fragment>
          ),
        )}
        {hint && <span className={s.quietHint}>{hint}</span>}
      </span>
    </div>
  );
}
