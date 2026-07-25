// src/features/messages/DeleteMessageDialog.tsx
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface DeleteMessageDialogProps {
  onConfirm: () => void;
  onClose: () => void;
  /** True while the delete request is in flight — disables the confirm button. */
  pending?: boolean;
}

/** Confirm dialog for deleting a message. Soft-delete: the message becomes a
 *  tombstone for everyone in the thread. Escape/scrim/cancel all dismiss. */
export function DeleteMessageDialog({
  onConfirm,
  onClose,
  pending = false,
}: DeleteMessageDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("messages:delete.confirmTitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("messages:delete.cancelCta")}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={pending}>
            {t("messages:delete.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("messages:delete.confirmBody")}</p>
    </Modal>
  );
}
