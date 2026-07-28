import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface DeleteConversationDialogProps {
  /** Counterpart display name, when known — personalizes the body copy. */
  name?: string;
  onConfirm: () => void;
  onClose: () => void;
  /** True while the delete request is in flight — disables the confirm button. */
  pending?: boolean;
}

/** Confirm dialog for deleting a conversation for the current user only. The
 *  other member keeps their copy; the thread returns with fresh history if they
 *  message again. Escape/scrim/cancel all dismiss. */
export function DeleteConversationDialog({
  name,
  onConfirm,
  onClose,
  pending = false,
}: DeleteConversationDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("messages:deleteChat.confirmTitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("messages:deleteChat.cancelCta")}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={pending}>
            {t("messages:deleteChat.confirmCta")}
          </Button>
        </>
      }
    >
      <p>
        {name
          ? t("messages:deleteChat.confirmBody", { name })
          : t("messages:deleteChat.confirmBodyGeneric")}
      </p>
    </Modal>
  );
}
