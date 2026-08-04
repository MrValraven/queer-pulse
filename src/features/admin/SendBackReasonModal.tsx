import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingQueueRow } from "./api/adminListings.api";

/**
 * A lightweight reason prompt for sending a listing back to review — not a
 * destructive action (so the default `ConfirmDialog` tone, unlike
 * `RemoveListingConfirmModal`), but still worth a beat to let a moderator leave
 * the submitter a note on what needs fixing. The reason is optional: a moderator
 * can send back with a bare click through, same as before this modal existed.
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
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={() => onConfirm(reason.trim() || undefined)}
      title={t("admin:adminListings.sendBack.confirm.title", {
        name: row.name,
      })}
      description={t("admin:adminListings.sendBack.confirm.body", {
        name: row.name,
      })}
      loading={pending}
      confirmLabel={t("admin:adminListings.sendBack.confirm.confirmCta")}
      cancelLabel={t("admin:common.cancel")}
      reason={{
        value: reason,
        onChange: setReason,
        label: t("admin:adminListings.sendBack.confirm.reasonLabel"),
        placeholder: t(
          "admin:adminListings.sendBack.confirm.reasonPlaceholder",
        ),
      }}
    />
  );
}
