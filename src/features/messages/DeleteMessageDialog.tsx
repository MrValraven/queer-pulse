// src/features/messages/DeleteMessageDialog.tsx
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface DeleteMessageDialogProps {
  onConfirm: () => void;
  onClose: () => void;
  /** True while the delete request is in flight — disables the confirm button. */
  pending?: boolean;
  /** "everyone" (default) is the existing author/staff tombstone; "me"
   *  (PRD-227) hides the message from the caller's own view only — a SECOND,
   *  per-viewer thing that sits beside "everyone" without ever merging into
   *  it. Only the copy differs; both use the same destructive `ConfirmDialog`
   *  shell. */
  scope?: "everyone" | "me";
}

/** Confirm dialog for deleting a message — either "for everyone" (soft-delete
 *  tombstone, author/staff) or "for me" (PRD-227, any participant, hides it
 *  from just their own view). Escape/scrim/cancel all dismiss. Built on the
 *  shared {@link ConfirmDialog} (destructive tone); mounted only while it
 *  should show, so `open` is always true here. */
export function DeleteMessageDialog({
  onConfirm,
  onClose,
  pending = false,
  scope = "everyone",
}: DeleteMessageDialogProps) {
  const { t } = useTranslation();
  const forMe = scope === "me";
  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={pending}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t(
        forMe
          ? "messages:delete.confirmForMeTitle"
          : "messages:delete.confirmTitle",
      )}
      description={t(
        forMe
          ? "messages:delete.confirmForMeBody"
          : "messages:delete.confirmBody",
      )}
      confirmLabel={t(
        forMe
          ? "messages:delete.confirmForMeCta"
          : "messages:delete.confirmCta",
      )}
      cancelLabel={t("messages:delete.cancelCta")}
    />
  );
}
