import { useId } from "react";
import { FiArrowRight, FiHelpCircle, FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ACCESSIBILITY_ANSWER_BY_ID,
  ACCESSIBILITY_QUESTIONS,
} from "../marketing/listBusiness/listingAccessibility.data";
import { hasAnyDetail } from "./gatheringCatalog";
import { GatheringGoodToKnowRows } from "./GatheringGoodToKnow";
import type { GatheringForm } from "./useGatheringForm";
import styles from "./CreateGatheringReadback.module.css";

/**
 * The ready panel's readback: what the host answered, right above the pledge
 * that those answers are accurate.
 *
 * The format's details show as the gathering page's own "Good to know" rows
 * while any of them is answered (`submittedFormatDetails`, so the rows match
 * what will be stored). All six accessibility questions follow with the
 * answer the host picked, in the words the host picked it from ("Yes", "No",
 * "Not sure yet"), the unanswered ones included. The preview card and the
 * success screen stay yes-only; this is the one place a host sees every
 * answer back.
 *
 * A plain group under an h3: the ready panel is already the named region.
 */
export function CreateGatheringReadback({
  form,
  onJumpToAccess,
}: {
  form: GatheringForm;
  /** Open the Access chapter at its questions, through the panel's jump. */
  onJumpToAccess: () => void;
}) {
  const { t } = useTranslation();
  const formatDetails = form.submittedFormatDetails;
  return (
    <div className={styles.readback}>
      <h3 className={styles.title}>
        {t("gatherings:create.v2.ready.readbackTitle")}
      </h3>
      {formatDetails && hasAnyDetail(formatDetails) && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>
            {t("gatherings:catalog.goodToKnow.title")}
          </p>
          <GatheringGoodToKnowRows details={formatDetails} />
        </div>
      )}
      <ReadbackAccessibility form={form} onJumpToAccess={onJumpToAccess} />
    </div>
  );
}

/**
 * Every accessibility answer with its icon and the host's own word for it
 * (the owner phrasing the Access chapter offers), the host's note, and how
 * many questions are still open as a way back to the Access chapter.
 */
function ReadbackAccessibility({
  form,
  onJumpToAccess,
}: {
  form: GatheringForm;
  onJumpToAccess: () => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const note = form.accessNotes.trim();
  const unansweredCount = ACCESSIBILITY_QUESTIONS.filter(
    (question) => form.accessibilityAnswers[question.slug] === "unknown",
  ).length;
  return (
    <div className={styles.group}>
      <p id={labelId} className={styles.groupLabel}>
        {t("gatherings:create.v2.ready.accessLabel")}
      </p>
      <ul className={styles.answers} aria-labelledby={labelId}>
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
