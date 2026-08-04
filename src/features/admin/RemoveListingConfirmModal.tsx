import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingQueueRow } from "./api/adminListings.api";

/**
 * The listings queue's one shared confirm dialog for the destructive Remove
 * action — mounted once by the caller (row or drawer), bound to the armed row.
 * Built on the shared `ConfirmDialog` (itself on `Modal`) so it gets the Tab
 * focus-trap, `document.body` portal, and focus-restore it needs when opened
 * from inside another dialog (the `ListingPreviewDrawer`) — without those a
 * keyboard/screen-reader user could Tab out into the inert drawer behind it.
 * Warns extra-firmly when the target is `live`, since removing it also pulls a
 * published entry off the public directory.
 *
 * The reason textarea is optional (a moderator may not always have a note worth
 * recording) — mirrors `BulkRemoveConfirmModal`'s.
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
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={() => onConfirm(reason.trim() || undefined)}
      title={t("admin:adminListings.remove.confirm.title", { name: row.name })}
      description={t("admin:adminListings.remove.confirm.body")}
      tone="destructive"
      loading={pending}
      confirmLabel={t("admin:adminListings.remove.confirm.confirmCta")}
      cancelLabel={t("admin:common.cancel")}
      reason={{
        value: reason,
        onChange: setReason,
        label: t("admin:adminListings.remove.confirm.reasonLabel"),
        placeholder: t("admin:adminListings.remove.confirm.reasonPlaceholder"),
      }}
    >
      {row.status === "live" && (
        <p>{t("admin:adminListings.remove.confirm.liveWarning")}</p>
      )}
    </ConfirmDialog>
  );
}
