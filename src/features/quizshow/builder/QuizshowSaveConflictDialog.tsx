import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";

export function QuizshowSaveConflictDialog({
  isOpen,
  onLoadTheirs,
  onSaveMine,
  onClose,
}: {
  isOpen: boolean;
  onLoadTheirs: () => void;
  onSaveMine: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <ConfirmDialog
          key="quizshow-save-conflict"
          open
          onClose={onClose}
          onConfirm={onLoadTheirs}
          title={t("quizshow:save.conflictTitle")}
          description={t("quizshow:save.conflictBody")}
          confirmLabel={t("quizshow:save.conflictLoad")}
          cancelLabel={t("quizshow:common.cancel")}
          extraAction={{
            label: t("quizshow:save.conflictOverwrite"),
            onClick: onSaveMine,
          }}
        />
      )}
    </AnimatePresence>
  );
}
