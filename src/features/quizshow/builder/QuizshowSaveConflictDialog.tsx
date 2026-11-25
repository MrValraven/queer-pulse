import type { ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import type { QuizshowQuizChangedDetails } from "../../../shared/contracts/quizshow";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowScopeKind } from "../quizshowScope";
import { conflictBodyCopyOf } from "./useQuizshowSave";

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
  changedBy = null,
  children,
}: {
  isOpen: boolean;
  onLoadTheirs: () => void;
  onSaveMine: () => void;
  onClose: () => void;
  /** Additive. Who saved the newer version and when (item 54); the body names them when the 409 did. */
  changedBy?: QuizshowQuizChangedDetails | null;
  /** Additive. Rendered inside the dialog (the studio's dark stamp). */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const scopeKind = useQuizshowScopeKind();
  const keys = CONFLICT_KEYS[scopeKind];
  const body = conflictBodyCopyOf(changedBy, scopeKind, keys.body, (value) =>
    format.time(value),
  );
  return (
    <AnimatePresence>
      {isOpen && (
        <ConfirmDialog
          key="quizshow-save-conflict"
          open
          onClose={onClose}
          onConfirm={onLoadTheirs}
          title={t(keys.title)}
          description={t(body.key, body.values)}
          confirmLabel={t(keys.load)}
          cancelLabel={t("quizshow:common.cancel")}
          extraAction={{
            label: t(keys.overwrite),
            onClick: onSaveMine,
          }}
        >
          {children}
        </ConfirmDialog>
      )}
    </AnimatePresence>
  );
}
