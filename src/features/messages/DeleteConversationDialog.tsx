import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface DeleteConversationDialogProps {
  /** Counterpart display name, when known — personalizes the body copy. */
  name?: string;
  /** PRD-357: a group is "cleared for you" (other members keep theirs),
   *  never "deleted", since the thread and its history keep existing for
   *  everyone else. Absent/false = the existing DM copy. */
  isGroup?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** True while the delete request is in flight — disables the confirm button. */
  pending?: boolean;
}

/** Confirm dialog for clearing a conversation for the current user only. The
 *  other member(s) keep their copy; a DM thread returns with fresh history if
 *  they message again (a group stays reachable from the thread list as long
 *  as the caller is still an active member). Escape/scrim/cancel all dismiss.
 *  Built on the shared {@link ConfirmDialog} (destructive tone); mounted only
 *  while it should show, so `open` is always true here. */
export function DeleteConversationDialog({
  name,
  isGroup = false,
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
      title={
        isGroup
          ? t("messages:deleteChat.confirmTitleGroup")
          : t("messages:deleteChat.confirmTitle")
      }
      description={
        isGroup
          ? t("messages:deleteChat.confirmBodyGroup")
          : name
            ? t("messages:deleteChat.confirmBody", { name })
            : t("messages:deleteChat.confirmBodyGeneric")
      }
      confirmLabel={
        isGroup
          ? t("messages:deleteChat.confirmCtaGroup")
          : t("messages:deleteChat.confirmCta")
      }
      cancelLabel={t("messages:deleteChat.cancelCta")}
    />
  );
}
