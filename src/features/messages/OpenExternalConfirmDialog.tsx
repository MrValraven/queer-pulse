// src/features/messages/OpenExternalConfirmDialog.tsx
import type { ReactNode } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface OpenExternalConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  children: ReactNode;
}

/**
 * The one confirm step shared by every "this might not be what it looks
 * like" pause in messaging (PRD-371's suspicious-link warning, PRD-369's
 * inbound-document-from-a-stranger warning): built on the shared
 * `ConfirmDialog`, with the same two actions and the same order everywhere:
 * "Go back" first, "Open anyway" second, and `initialFocus="cancel"` so
 * "Go back" (the safer of the two) is where the dialog's focus actually
 * lands on open, rather than the head's close button that `useDismiss`
 * would otherwise pick as the first focusable element. Each caller supplies
 * its own `title`/`children` describing WHAT to look at and WHY (the real
 * host for a link, the file's name/type/size for a document).
 */
export function OpenExternalConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
}: OpenExternalConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      cancelLabel={t("messages:safety.confirmGoBack")}
      confirmLabel={t("messages:safety.confirmOpenAnyway")}
      initialFocus="cancel"
    >
      {children}
    </ConfirmDialog>
  );
}
