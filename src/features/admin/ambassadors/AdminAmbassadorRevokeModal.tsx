import { useState } from "react";
import { Button, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminModal } from "../ui";
import {
  AMBASSADOR_REASON_MAX_LENGTH,
  AMBASSADOR_REASON_MIN_LENGTH,
  isAmbassadorReasonValid,
} from "./adminAmbassadors.api";
import styles from "./AdminAmbassadorsPage.module.css";

/**
 * The revoke confirm. The reason is required: every revoke is logged with who,
 * when and why, so Revoke stays disabled until it reaches the backend's
 * minimum length (`AMBASSADOR_REASON_MIN_LENGTH`, trimmed). The page hosts
 * it, because the row unmounts the moment the revoke lands.
 */
export function AdminAmbassadorRevokeModal({
  memberName,
  isPending,
  errorMessage,
  onSubmit,
  onClose,
}: {
  memberName: string;
  isPending: boolean;
  /** The mapped failure of the last attempt, shown inside the dialog. */
  errorMessage: string | null;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();

  return (
    <AdminModal
      eyebrow={t("admin:ambassadors.revoke.eyebrow")}
      title={t("admin:ambassadors.revoke.title", { name: memberName })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={isPending || !isAmbassadorReasonValid(reason)}
            onClick={() => onSubmit(trimmedReason)}
          >
            {isPending
              ? t("admin:ambassadors.revoke.pending")
              : t("admin:ambassadors.revoke.confirm")}
          </Button>
        </>
      }
    >
      <p className={styles.modalBody}>{t("admin:ambassadors.revoke.body")}</p>
      <FormField
        label={t("admin:ambassadors.revoke.reasonLabel")}
        required
        helper={t("admin:ambassadors.revoke.reasonHint", {
          min: AMBASSADOR_REASON_MIN_LENGTH,
        })}
        error={errorMessage ?? undefined}
        labelAside={`${reason.length}/${AMBASSADOR_REASON_MAX_LENGTH}`}
      >
        <textarea
          value={reason}
          maxLength={AMBASSADOR_REASON_MAX_LENGTH}
          rows={4}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>
    </AdminModal>
  );
}
