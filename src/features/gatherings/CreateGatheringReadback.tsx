import { FiArrowRight, FiHelpCircle, FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ACCESSIBILITY_ANSWER_BY_ID,
  ACCESSIBILITY_QUESTIONS,
} from "../marketing/listBusiness/listingAccessibility.data";
import type { GatheringForm } from "./useGatheringForm";
import styles from "./CreateGatheringReadback.module.css";

/**
 * The review chapter's accessibility readback: every answer with its icon and
 * the host's own word for it (the owner phrasing the Access chapter offers),
 * the host's note, and how many questions are still open as a way back to the
 * Access chapter.
 *
 * All six questions show, the unanswered ones included, in the words the host
 * picked from ("Yes", "No", "Not sure yet"). The preview card and the success
 * screen stay yes-only, so this is the one place a host sees every answer
 * back, right above the pledge that those answers are accurate.
 */
export function CreateGatheringAccessReadback({
  form,
  labelledById,
  onJumpToAccess,
}: {
  form: GatheringForm;
  /** The review group title that names the answer list. */
  labelledById: string;
  /** Open the Access chapter at its questions. */
  onJumpToAccess: () => void;
}) {
  const { t } = useTranslation();
  const note = form.accessNotes.trim();
  const unansweredCount = ACCESSIBILITY_QUESTIONS.filter(
    (question) => form.accessibilityAnswers[question.slug] === "unknown",
  ).length;
  return (
    <div className={styles.group}>
      <ul className={styles.answers} aria-labelledby={labelledById}>
        {ACCESSIBILITY_QUESTIONS.map((question) => {
          const answer = form.accessibilityAnswers[question.slug];
          const answerDefinition = ACCESSIBILITY_ANSWER_BY_ID[answer];
          const AnswerIcon = answerDefinition.icon;
          return (
            <li
              key={question.slug}
              className={styles.answer}
              data-answer={answer}
            >
              <span className={styles.mark} aria-hidden>
                <AnswerIcon />
              </span>
              <span>
                {t("gatherings:create.v2.ready.accessAnswer", {
                  question: t(question.labelKey),
                  answer: t(answerDefinition.ownerKey),
                })}
              </span>
            </li>
          );
        })}
      </ul>
      {note && (
        <p className={styles.note}>
          <FiMessageSquare aria-hidden />
          <span>
            <span className={styles.noteLabel}>
              {t("gatherings:create.v2.ready.accessNoteLabel")}
            </span>
            {note}
          </span>
        </p>
      )}
      {unansweredCount > 0 && (
        <button
          type="button"
          className={styles.unanswered}
          onClick={onJumpToAccess}
        >
          <FiHelpCircle aria-hidden />
          {t("gatherings:create.v2.ready.accessUnanswered", {
            count: unansweredCount,
          })}
          <FiArrowRight aria-hidden />
          <span className="visuallyHidden">
            {" "}
            {t("gatherings:create.v2.ready.jumpHint")}
          </span>
        </button>
      )}
    </div>
  );
}
