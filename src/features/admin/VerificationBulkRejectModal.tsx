import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * The reason-required reject confirm dialog for the Review-queue segment —
 * shared by two callers with the same "reject needs a reason" contract:
 * `VerificationBulkActionBar`'s reject button (many ids) and the keyboard
 * `R` shortcut (one focused id, still routed through here as `ids: [id]` so
 * the copy and cap-respecting request shape stay identical either way).
 *
 * Deliberately a SEPARATE component from `BulkRemoveConfirmModal` (the
 * listings queue's own reason dialog) rather than a shared/parameterized
 * one, same reasoning that keeps that one apart from its own single-row
 * sibling — the two features' reject/remove copy and requiredness differ
 * (a listing bulk-remove reason is optional; a verification-request reject
 * reason is REQUIRED, mirroring the single-row drawer's own reject rule) and
 * should be free to evolve independently.
 *
 * Built on the shared `ConfirmDialog` for its focus trap, `document.body`
 * portal, and focus-restore — this can be opened from the floating bulk bar
 * or via a keyboard shortcut over an already-scrolled queue.
 */
export function VerificationBulkRejectModal({
  count,
  pending,
  onConfirm,
  onClose,
}: {
  count: number;
  pending: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={() => onConfirm(reason.trim())}
      title={t("admin:verifications.requests.bulk.confirmReject.title", {
        count,
      })}
      description={t("admin:verifications.requests.bulk.confirmReject.body", {
        count,
      })}
      tone="destructive"
      loading={pending}
      confirmLabel={t(
        "admin:verifications.requests.bulk.confirmReject.confirmCta",
      )}
      cancelLabel={t("admin:common.cancel")}
      reason={{
        value: reason,
        onChange: setReason,
        label: t("admin:verifications.requests.bulk.confirmReject.reasonLabel"),
        placeholder: t(
          "admin:verifications.requests.bulk.confirmReject.reasonPlaceholder",
        ),
        required: true,
      }}
    />
  );
}
