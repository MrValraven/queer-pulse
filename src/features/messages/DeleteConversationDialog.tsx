import { ConfirmDialog } from "../../shared/components/ui";
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
 *  message again. Escape/scrim/cancel all dismiss. Built on the shared
 *  {@link ConfirmDialog} (destructive tone); mounted only while it should show,
 *  so `open` is always true here. */
export function DeleteConversationDialog({
  name,
  onConfirm,
  onClose,
  pending = false,
}: DeleteConversationDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={pending}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("messages:deleteChat.confirmTitle")}
      description={
        name
          ? t("messages:deleteChat.confirmBody", { name })
          : t("messages:deleteChat.confirmBodyGeneric")
      }
      confirmLabel={t("messages:deleteChat.confirmCta")}
      cancelLabel={t("messages:deleteChat.cancelCta")}
    />
  );
}
