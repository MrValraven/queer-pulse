import { AnimatePresence } from "motion/react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowWheelPick } from "../../../shared/contracts/quizshow";
import { QuizshowStudioDarkStamp } from "../studio/QuizshowStudioDarkStamp";

export interface QuizshowRemoteFinishWheelProps {
  isOpen: boolean;
  /** What the wheel picks, which decides whether the body speaks of rounds or questions. */
  pick: QuizshowWheelPick;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Asks before Finish the wheel skips what is left on it. */
export function QuizshowRemoteFinishWheel({
  isOpen,
  pick,
  isPending,
  onConfirm,
  onClose,
}: QuizshowRemoteFinishWheelProps): ReactNode {
  const { t } = useTranslation();
  const bodyKey =
    pick === "question"
      ? "quizshow:remote.wheel.finishConfirmBodyQuestion"
      : "quizshow:remote.wheel.finishConfirmBodyRound";
  return (
    <AnimatePresence>
      {isOpen && (
        <ConfirmDialog
          key="quizshow-remote-finish-wheel"
          open
          onClose={onClose}
          onConfirm={onConfirm}
          title={t("quizshow:remote.wheel.finishConfirmTitle")}
          description={t(bodyKey)}
          confirmLabel={t("quizshow:remote.wheel.finish")}
          cancelLabel={t("quizshow:common.cancel")}
          tone="default"
          loading={isPending}
          initialFocus="cancel"
        >
          {/* The dialog portals to the body; the stamp keeps it in the remote's dark. */}
          <QuizshowStudioDarkStamp />
        </ConfirmDialog>
      )}
    </AnimatePresence>
  );
}
