import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingQueueRow } from "./api/adminListings.api";

const REASON_MAX_LENGTH = 500;

/**
 * A lightweight reason prompt for sending a listing back to review — not a
 * destructive action (so no `variant="danger"`, unlike
 * `RemoveListingConfirmModal`), but still worth a beat to let a moderator
 * leave the submitter a note on what needs fixing. The reason is optional: a
 * moderator can send back with a bare click through, same as before this
 * modal existed.
 */
export function SendBackReasonModal({
  row,
  pending,
  onConfirm,
  onClose,
}: {
  row: ListingQueueRow;
  pending: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <Modal
      title={t("admin:adminListings.sendBack.confirm.title", {
        name: row.name,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="jade"
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={pending}
          >
            {t("admin:adminListings.sendBack.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("admin:adminListings.sendBack.confirm.body", { name: row.name })}</p>
      <FormField
        label={t("admin:adminListings.sendBack.confirm.reasonLabel")}
        labelAside={`${reason.length}/${REASON_MAX_LENGTH}`}
      >
        <textarea
          value={reason}
          maxLength={REASON_MAX_LENGTH}
          rows={3}
          placeholder={t(
            "admin:adminListings.sendBack.confirm.reasonPlaceholder",
          )}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
