import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useClearStudioListening } from "./api/useClearStudioListening";

/**
 * Asks before clearing the listening history (the listening page and Studio
 * Settings). Confirm deletes every play on the server and empties this
 * device's recently played list; the hook toasts the result and names the
 * reason of a refusal. A failed clear keeps the dialog open so the member
 * can try again or cancel. Opening and closing animate through the shared
 * dialog's exit inside AnimatePresence.
 */
export function StudioClearListeningDialog({
  isOpen,
  onClose,
  onCleared,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** After a successful clear, before the dialog closes. */
  onCleared?: () => void;
}) {
  const { t } = useTranslation();
  const { clearHistory, isClearing } = useClearStudioListening();

  const handleConfirm = async () => {
    const isCleared = await clearHistory();
    if (!isCleared) return;
    onCleared?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ConfirmDialog
          key="clear-listening"
          open
          onClose={onClose}
          onConfirm={() => void handleConfirm()}
          tone="destructive"
          loading={isClearing}
          title={t("studio:listening.clear.title")}
          description={t("studio:listening.clear.body")}
          confirmLabel={t("studio:listening.clear.confirm")}
        />
      )}
    </AnimatePresence>
  );
}
