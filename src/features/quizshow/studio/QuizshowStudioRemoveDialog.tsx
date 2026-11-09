import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { QuizshowStudioDarkStamp } from "./QuizshowStudioDarkStamp";
import { focusSelectedRailItem } from "./quizshowStudioDom";
import { displayRoundNumber, isWheelRoundKind } from "../quizshowWheel";
import { shownTextOf } from "./quizshowStudioRailView";

/** What the host asked to delete, from a rail menu or the Delete key. */
export type QuizshowStudioRemoval =
  | { kind: "question"; roundIndex: number; questionIndex: number }
  | { kind: "round"; roundIndex: number };

type Translate = ReturnType<typeof useTranslation>["t"];

function removalCopyOf(
  removal: QuizshowStudioRemoval,
  studio: ReturnType<typeof useQuizshowStudio>,
  t: Translate,
): {
  title: string;
  description: string | undefined;
  confirmLabel: string;
} | null {
  const round = studio.controller.draft.rounds[removal.roundIndex];
  if (round === undefined) return null;
  if (removal.kind === "round" && isWheelRoundKind(round.kind)) {
    return {
      title: t("quizshow:rounds.removeWheelConfirmTitle"),
      description: t("quizshow:rounds.removeWheelConfirmBody"),
      confirmLabel: t("quizshow:rounds.removeWheel"),
    };
  }
  if (removal.kind === "round") {
    const title =
      shownTextOf(round.title, studio.viewLanguage) ||
      t("quizshow:rounds.untitled", {
        number: displayRoundNumber(
          studio.controller.draft.rounds,
          removal.roundIndex,
        ),
      });
    return {
      title: t("quizshow:rounds.removeConfirmTitle", { title }),
      description: t("quizshow:rounds.removeConfirmBody", {
        count: round.questions.length,
      }),
      confirmLabel: t("quizshow:rounds.remove"),
    };
  }
  const draftQuestion = round.questions[removal.questionIndex];
  if (draftQuestion === undefined) return null;
  const prompt = shownTextOf(
    draftQuestion.question.prompt,
    studio.viewLanguage,
  );
  return {
    title: t("quizshow:studio.removeQuestionTitle", {
      number: removal.questionIndex + 1,
    }),
    description: prompt || undefined,
    confirmLabel: t("quizshow:questions.remove"),
  };
}

/**
 * The confirm before a question or a round goes, in the studio's dark. A
 * question's dialog quotes its prompt, so the host sees which one it is.
 */
export function QuizshowStudioRemoveDialog({
  removal,
  onClose,
}: {
  removal: QuizshowStudioRemoval | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const studio = useQuizshowStudio();
  const copy = removal === null ? null : removalCopyOf(removal, studio, t);
  // After a delete the opener is gone, so focus lands on the newly selected rail item.
  const isConfirmedRef = useRef(false);
  const confirm = () => {
    if (removal === null) return;
    isConfirmedRef.current = true;
    if (removal.kind === "question") {
      studio.actions.removeQuestion(removal.roundIndex, removal.questionIndex);
    } else {
      studio.actions.removeRound(removal.roundIndex);
    }
    onClose();
  };
  return (
    <AnimatePresence
      onExitComplete={() => {
        if (!isConfirmedRef.current) return;
        isConfirmedRef.current = false;
        requestAnimationFrame(focusSelectedRailItem);
      }}
    >
      {removal !== null && copy !== null && (
        <ConfirmDialog
          key="studio-remove"
          open
          tone="destructive"
          title={copy.title}
          description={copy.description}
          confirmLabel={copy.confirmLabel}
          cancelLabel={t("quizshow:common.cancel")}
          onClose={onClose}
          onConfirm={confirm}
        >
          <QuizshowStudioDarkStamp />
        </ConfirmDialog>
      )}
    </AnimatePresence>
  );
}
