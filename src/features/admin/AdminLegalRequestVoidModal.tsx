import { useId, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import { useVoidLegalRequest } from "./api/useAdminLegalRequests";
import {
  MAX_LEGAL_REQUEST_TEXT_LENGTH,
  isLegalRequestConflict,
  type AdminLegalRequestDTO,
} from "./api/adminLegalRequests.api";
import styles from "./AdminLegalRequestsPage.module.css";

/**
 * Strike one record from the published figures.
 *
 * This is the register's only removal and its one irreversible move, so the
 * modal says both things plainly: the row stays and stays readable, the reason
 * is stored beside it, the count of voided records is itself published, and
 * nothing here can be undone. A record entered in error is struck rather than
 * deleted precisely so its absence never reads as a zero.
 *
 * The reason is required. Voiding with no reason is refused by the backend with
 * a 400, and a register that cannot say why a record left the figures is worth
 * less than one that never let it leave.
 */
export function AdminLegalRequestVoidModal({
  record,
  onClose,
  onVoided,
}: {
  record: AdminLegalRequestDTO;
  onClose: () => void;
  onVoided: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const fieldId = useId();
  const voidRecord = useVoidLegalRequest();
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();

  function handleVoid() {
    if (trimmedReason === "") return;
    voidRecord.mutate(
      { record, reason: trimmedReason },
      {
        onSuccess: () => {
          showToast(t("admin:legalRequests.toast.voided"), "success");
          // `onVoided` closes the detail pane this modal was opened from, which
          // takes the modal with it, so there is nothing left to close here.
          onVoided();
        },
        onError: (error) =>
          showToast(
            describeError(
              isLegalRequestConflict(error)
                ? t("admin:legalRequests.error.alreadyVoided")
                : t("admin:legalRequests.error.void"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:legalRequests.void.eyebrow")}
      title={t("admin:legalRequests.void.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:legalRequests.action.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleVoid}
            disabled={trimmedReason === "" || voidRecord.isPending}
          >
            {t("admin:legalRequests.action.void")}
          </Button>
        </>
      }
    >
      <p className={styles.voidWarning}>
        <FiAlertTriangle aria-hidden className={styles.noticeIcon} />
        {t("admin:legalRequests.void.warning")}
      </p>
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.void.body", {
          body: record.requestingBody,
        })}
      </p>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-reason`}>
        {t("admin:legalRequests.void.reasonLabel")}
      </label>
      <textarea
        id={`${fieldId}-reason`}
        className={styles.textarea}
        rows={4}
        value={reason}
        maxLength={MAX_LEGAL_REQUEST_TEXT_LENGTH}
        placeholder={t("admin:legalRequests.void.reasonPlaceholder")}
        onChange={(event) => setReason(event.target.value)}
      />
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.void.reasonHint")}
      </p>
    </AdminModal>
  );
}
