import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingQueueRow } from "./api/adminListings.api";

const REASON_MAX_LENGTH = 500;

/**
 * The listings queue's one shared confirm dialog for the destructive Remove
 * action — mounted once by the caller (row or drawer), bound to the armed
 * row. Uses the shared `Modal` primitive rather than `AdminModal`: this
 * dialog is now sometimes opened from inside another dialog (the
 * `ListingPreviewDrawer`), and only `Modal` gives it a Tab focus-trap,
 * `document.body` portal, and focus-restore — `AdminModal` has none of
 * those, which would let a keyboard/screen-reader user Tab out into the
 * inert drawer behind it. Warns extra-firmly when the target is `live`,
 * since removing it also pulls a published entry off the public directory.
 *
 * The reason textarea is optional (a moderator may not always have a note
 * worth recording) — mirrors `BulkRemoveConfirmModal`'s, at a shorter cap
 * since this is a single-row note, not one shared across a batch.
 */
export function RemoveListingConfirmModal({
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
      title={t("admin:adminListings.remove.confirm.title", { name: row.name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={pending}
          >
            {t("admin:adminListings.remove.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("admin:adminListings.remove.confirm.body")}</p>
      {row.status === "live" && (
        <p>{t("admin:adminListings.remove.confirm.liveWarning")}</p>
      )}
      <FormField
        label={t("admin:adminListings.remove.confirm.reasonLabel")}
        labelAside={`${reason.length}/${REASON_MAX_LENGTH}`}
      >
        <textarea
          value={reason}
          maxLength={REASON_MAX_LENGTH}
          rows={3}
          placeholder={t("admin:adminListings.remove.confirm.reasonPlaceholder")}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
