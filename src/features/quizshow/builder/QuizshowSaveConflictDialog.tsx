import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowScopeKind } from "../quizshowScope";

/** A game has one owner, so its copy speaks of another tab or device. */
const CONFLICT_KEYS = {
  event: {
    title: "quizshow:save.conflictTitle",
    body: "quizshow:save.conflictBody",
    load: "quizshow:save.conflictLoad",
    overwrite: "quizshow:save.conflictOverwrite",
  },
  game: {
    title: "quizshow:save.conflictTitleGame",
    body: "quizshow:save.conflictBodyGame",
    load: "quizshow:save.conflictLoadGame",
    overwrite: "quizshow:save.conflictOverwriteGame",
  },
  template: {
    title: "quizshow:save.conflictTitleTemplate",
    body: "quizshow:save.conflictBodyTemplate",
    load: "quizshow:save.conflictLoad",
    overwrite: "quizshow:save.conflictOverwrite",
  },
} as const;

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
  const keys = CONFLICT_KEYS[useQuizshowScopeKind()];
  return (
    <AnimatePresence>
      {isOpen && (
        <ConfirmDialog
          key="quizshow-save-conflict"
          open
          onClose={onClose}
          onConfirm={onLoadTheirs}
          title={t(keys.title)}
          description={t(keys.body)}
          confirmLabel={t(keys.load)}
          cancelLabel={t("quizshow:common.cancel")}
          extraAction={{
            label: t(keys.overwrite),
            onClick: onSaveMine,
          }}
        />
      )}
    </AnimatePresence>
  );
}
