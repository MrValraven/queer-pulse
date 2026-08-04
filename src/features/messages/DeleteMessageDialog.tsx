// src/features/messages/DeleteMessageDialog.tsx
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface DeleteMessageDialogProps {
  onConfirm: () => void;
  onClose: () => void;
  /** True while the delete request is in flight — disables the confirm button. */
  pending?: boolean;
}

/** Confirm dialog for deleting a message. Soft-delete: the message becomes a
 *  tombstone for everyone in the thread. Escape/scrim/cancel all dismiss. Built
 *  on the shared {@link ConfirmDialog} (destructive tone); mounted only while it
 *  should show, so `open` is always true here. */
export function DeleteMessageDialog({
  onConfirm,
  onClose,
  pending = false,
}: DeleteMessageDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={pending}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("messages:delete.confirmTitle")}
      description={t("messages:delete.confirmBody")}
      confirmLabel={t("messages:delete.confirmCta")}
      cancelLabel={t("messages:delete.cancelCta")}
    />
  );
}
