import { useId, useState } from "react";
import { Button, Modal, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { BlockOptions } from "../social/api/social.api";
import styles from "./BlockMemberModal.module.css";

/**
 * Confirmation dialog for the destructive "block" action taken from a member's
 * profile. Blocking severs any connection, so we always confirm first and let
 * the member optionally file a report and add context — the `{ reason, alsoReport }`
 * that `useSocial().toggleBlock` forwards to `POST /blocks/:slug`.
 */
export function BlockMemberModal({
  firstName,
  onCancel,
  onConfirm,
}: {
  firstName: string;
  onCancel: () => void;
  onConfirm: (options: BlockOptions) => void;
}) {
  const { t } = useTranslation();
  const [alsoReport, setAlsoReport] = useState(false);
  const [reason, setReason] = useState("");
  const reasonInputId = useId();

  return (
    <Modal
      title={t("safety:blockModal.title", { name: firstName })}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("safety:blockModal.cancelCta")}
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              onConfirm({
                reason: reason.trim() || undefined,
                alsoReport,
              })
            }
          >
            {t("safety:blockModal.confirmCta", { name: firstName })}
          </Button>
        </>
      }
    >
      <p className={styles.warn}>
        {t("safety:blockModal.body", { name: firstName })}
      </p>

      <label className={styles.reportRow}>
        <input
          type="checkbox"
          checked={alsoReport}
          onChange={(event) => setAlsoReport(event.target.checked)}
        />
        {t("safety:blockModal.reportCheckbox", { name: firstName })}
      </label>

      <FormField
        className={styles.reasonField}
        label={t("safety:blockModal.reasonLabel")}
      >
        <textarea
          id={reasonInputId}
          className={styles.reasonInput}
          value={reason}
          maxLength={500}
          placeholder={t("safety:blockModal.reasonPlaceholder")}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
