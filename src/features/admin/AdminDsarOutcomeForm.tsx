import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isDsarTransitionConflict } from "./api/adminDsar.api";
import { useUpdateAdminDsarRequest } from "./api/useAdminDsar";
import type {
  AdminDsarRequestDTO,
  AdminDsarTargetStatus,
} from "./api/adminDsar.api";
import styles from "./AdminDsarPage.module.css";

/**
 * The one place a request moves. Lives in the detail pane's footer.
 *
 * The outcome note is REQUIRED before closing (resolve or reject) and the
 * backend refuses a closing move without one, so the buttons stay disabled
 * until the operator has written something. That is the whole point of the
 * feature: a statutory request must never be marked answered with no record of
 * what the answer was. Moving to "in review" needs no note, since there is
 * nothing to report yet.
 */
export function AdminDsarOutcomeForm({
  request,
  onUpdated,
}: {
  request: AdminDsarRequestDTO;
  /** The confirmed new row, so the open pane reflects the move. */
  onUpdated: (updated: AdminDsarRequestDTO) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const noteFieldId = useId();
  const [outcomeNote, setOutcomeNote] = useState(request.outcomeNote ?? "");
  const { mutate, isPending } = useUpdateAdminDsarRequest();

  const isClosed =
    request.status === "resolved" || request.status === "rejected";
  const hasNote = outcomeNote.trim().length > 0;

  const move = (status: AdminDsarTargetStatus) => {
    mutate(
      { request, status, outcomeNote: outcomeNote.trim() },
      {
        onSuccess: (updated) => {
          onUpdated(updated);
          showToast(t(`admin:adminDsar.toast.${status}`), "success");
        },
        onError: (error) => {
          showToast(
            isDsarTransitionConflict(error)
              ? t("admin:adminDsar.toast.movedOn")
              : t("admin:adminDsar.toast.error"),
            "error",
          );
        },
      },
    );
  };

  if (isClosed) {
    return (
      <p className={styles.outcomeHint}>
        {t("admin:adminDsar.outcome.closedHint")}
      </p>
    );
  }

  return (
    <div className={styles.outcomeForm}>
      <label className={styles.outcomeLabel} htmlFor={noteFieldId}>
        {t("admin:adminDsar.outcome.label")}
      </label>
      <textarea
        id={noteFieldId}
        className={styles.outcomeInput}
        value={outcomeNote}
        maxLength={4000}
        placeholder={t("admin:adminDsar.outcome.placeholder")}
        onChange={(event) => setOutcomeNote(event.target.value)}
      />
      <p className={styles.outcomeHint}>
        {t("admin:adminDsar.outcome.notifyHint")}
      </p>
      <div className={styles.footActions}>
        {request.status === "received" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => move("in_review")}
          >
            {t("admin:adminDsar.action.startReview")}
          </Button>
        )}
        <Button
          variant="jade"
          size="sm"
          disabled={isPending || !hasNote}
          onClick={() => move("resolved")}
        >
          {t("admin:adminDsar.action.resolve")}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={isPending || !hasNote}
          onClick={() => move("rejected")}
        >
          {t("admin:adminDsar.action.reject")}
        </Button>
      </div>
      {!hasNote && (
        <p className={styles.outcomeHint}>
          {t("admin:adminDsar.outcome.requiredHint")}
        </p>
      )}
    </div>
  );
}
