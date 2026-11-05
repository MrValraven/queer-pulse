import { Button } from "../../../shared/components/ui";
import type { TranslateOptions } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useQuizshowStudio,
  type QuizshowStudioSave,
} from "./QuizshowStudioContext";
import { STUDIO_SAVE_REASON_ID } from "./quizshowStudioDom";
import styles from "./QuizshowStudioTopBar.module.css";

type Translate = ReturnType<typeof useTranslation>["t"];

/** A problem sentence's values as translate options (an interface has no index signature). */
function translateOptionsOf(
  values: QuizshowStudioSave["reasonValues"],
): TranslateOptions {
  if (values === null) return {};
  return { round: values.round, question: values.question, max: values.max };
}

/** The statuses worth interrupting for; the others change every few seconds. */
const ANNOUNCED_STATUSES: ReadonlySet<QuizshowStudioSave["status"]> = new Set([
  "held",
  "failed",
  "conflict",
]);

/** The status word and, when it has one, the reason after it. */
function statusCopyOf(
  save: QuizshowStudioSave,
  t: Translate,
): { label: string; reason: string | null } {
  switch (save.status) {
    case "saving":
      return { label: t("quizshow:save.saving"), reason: null };
    case "unsaved":
      return { label: t("quizshow:save.unsaved"), reason: null };
    case "held":
      return {
        label: t("quizshow:save.unsaved"),
        reason: save.reasonKey
          ? t(save.reasonKey, translateOptionsOf(save.reasonValues))
          : null,
      };
    case "failed":
      return {
        label: t("quizshow:studio.save.failed"),
        reason: save.reasonKey ? t(save.reasonKey) : null,
      };
    case "conflict":
      return { label: t("quizshow:studio.save.conflict"), reason: null };
    default:
      return { label: t("quizshow:save.saved"), reason: null };
  }
}

/**
 * The top bar's save status: Saved, Saving, Unsaved changes (with the
 * problem that holds the save), Couldn't save (with its reason), or, while a
 * newer version from someone else waits, a line saying so and "Review
 * changes", which reopens the conflict dialog. Autosaves show no toast, so
 * this is their only feedback. Only what needs the host (held, failed,
 * conflict) is announced; the steady Saving and Saved stay quiet.
 */
export function QuizshowStudioSaveStatus() {
  const { t } = useTranslation();
  const { save } = useQuizshowStudio();
  const { label, reason } = statusCopyOf(save, t);
  const isAnnounced = ANNOUNCED_STATUSES.has(save.status);
  return (
    <div className={styles.saveStatus} data-status={save.status}>
      <p className={styles.saveLine} title={label}>
        <span className={styles.saveDot} aria-hidden />
        <span className={styles.saveLabel}>{label}</span>
        {reason && (
          <span
            id={STUDIO_SAVE_REASON_ID}
            className={styles.saveReason}
            title={reason}
          >
            {reason}
          </span>
        )}
      </p>
      <p className={styles.visuallyHidden} role="status">
        {isAnnounced ? [label, reason].filter(Boolean).join(". ") : ""}
      </p>
      {save.status === "conflict" && (
        <Button
          variant="stage-ghost"
          size="sm"
          className={styles.reviewButton}
          onClick={save.reviewConflict}
        >
          {t("quizshow:studio.save.reviewChanges")}
        </Button>
      )}
    </div>
  );
}
