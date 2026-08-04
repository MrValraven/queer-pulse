import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

const REASON_MAX_LENGTH = 2000;

/**
 * The bulk counterpart to `RemoveListingConfirmModal` — deliberately a
 * SEPARATE dialog (not a shared/parameterized one) so the two can evolve
 * independently: W1-5 lands a reason textarea on the single-row modal
 * separately, and keeping them apart avoids that change colliding with this
 * one. Uses the shared `Modal` for the same reason `RemoveListingConfirmModal`
 * does — a Tab focus-trap, `document.body` portal, and focus-restore, since
 * this can be opened from the bulk bar over an already-scrolled queue.
 *
 * The reason is optional: the bulk-remove endpoint accepts one recorded
 * against every listing's moderation event, but a moderator clearing several
 * rows at once may not have one shared note that fits them all.
 */
export function BulkRemoveConfirmModal({
  count,
  pending,
  onConfirm,
  onClose,
}: {
  count: number;
  pending: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <Modal
      title={t("admin:adminListings.bulk.confirmRemove.title", { count })}
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
            {t("admin:adminListings.bulk.confirmRemove.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("admin:adminListings.bulk.confirmRemove.body", { count })}</p>
      <FormField
        label={t("admin:adminListings.bulk.confirmRemove.reasonLabel")}
        labelAside={`${reason.length}/${REASON_MAX_LENGTH}`}
      >
        <textarea
          value={reason}
          maxLength={REASON_MAX_LENGTH}
          rows={3}
          placeholder={t(
            "admin:adminListings.bulk.confirmRemove.reasonPlaceholder",
          )}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
