import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * The bulk counterpart to `RemoveListingConfirmModal` — deliberately a SEPARATE
 * dialog (not a shared/parameterized one) so the two can evolve independently.
 * Built on the shared `ConfirmDialog` for the same reason
 * `RemoveListingConfirmModal` is — a Tab focus-trap, `document.body` portal, and
 * focus-restore, since this can be opened from the bulk bar over an
 * already-scrolled queue.
 *
 * The reason is optional: the bulk-remove endpoint accepts one recorded against
 * every listing's moderation event, but a moderator clearing several rows at
 * once may not have one shared note that fits them all.
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
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={() => onConfirm(reason.trim() || undefined)}
      title={t("admin:adminListings.bulk.confirmRemove.title", { count })}
      description={t("admin:adminListings.bulk.confirmRemove.body", { count })}
      tone="destructive"
      loading={pending}
      confirmLabel={t("admin:adminListings.bulk.confirmRemove.confirmCta")}
      cancelLabel={t("admin:common.cancel")}
      reason={{
        value: reason,
        onChange: setReason,
        label: t("admin:adminListings.bulk.confirmRemove.reasonLabel"),
        placeholder: t(
          "admin:adminListings.bulk.confirmRemove.reasonPlaceholder",
        ),
      }}
    />
  );
}
