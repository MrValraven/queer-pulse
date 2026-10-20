import type { PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { IconButton } from "../../../shared/components/ui/IconButton";
import type { QuizshowContentLabel } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowDraftController } from "./useQuizshowDraft";
import type { QuizshowDraftRound } from "./quizshowDraft";
import type { QuizshowLocalProblem } from "./quizshowValidation";
import { QuizshowQuestionList } from "./QuizshowQuestionList";
import { QuizshowReorderControls } from "./QuizshowReorderControls";
import { QuizshowRoundEditor } from "./QuizshowRoundEditor";
import styles from "./QuizshowRounds.module.css";

/** The round's content label chip; a change of label fades the old chip out and the new one in. */
function QuizshowContentLabelChip({
  contentLabel,
}: {
  contentLabel: QuizshowContentLabel;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="wait" initial={false}>
      {contentLabel !== "none" && (
        <m.span
          key={contentLabel}
          className={styles.chip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          {t(`quizshow:contentLabel.${contentLabel}`)}
        </m.span>
      )}
    </AnimatePresence>
  );
}

interface QuizshowRoundRowProps {
  controller: QuizshowDraftController;
  round: QuizshowDraftRound;
  roundIndex: number;
  roundCount: number;
  title: string;
  isOpen: boolean;
  isAdultsEvent: boolean;
  problems: readonly QuizshowLocalProblem[];
  openQuestionIndex: number | null;
  gripHandlers: { onPointerDown: (event: ReactPointerEvent) => void };
  onMove: (fromIndex: number, toIndex: number) => void;
  /** Opens the closed round, or closes the open one. */
  onToggle: () => void;
  /** Opens one question of this round (null closes the open question). */
  onOpenQuestion: (questionIndex: number | null) => void;
  onRemove: () => void;
}

/** One round of the list: its head (reorder, title, summary, actions) and its editor panel. */
export function QuizshowRoundRow({
  controller,
  round,
  roundIndex,
  roundCount,
  title,
  isOpen,
  isAdultsEvent,
  problems,
  openQuestionIndex,
  gripHandlers,
  onMove,
  onToggle,
  onOpenQuestion,
  onRemove,
}: QuizshowRoundRowProps) {
  const { t } = useTranslation();
  const { languages } = controller.draft;
  const titleId = `round-title-${round.draftKey}`;
  return (
    <div className={styles.row}>
      <div className={styles.rowHead}>
        <QuizshowReorderControls
          index={roundIndex}
          count={roundCount}
          moveUpLabel={t("quizshow:rounds.moveUp", { title })}
          moveDownLabel={t("quizshow:rounds.moveDown", { title })}
          dragLabel={t("quizshow:rounds.drag", { title })}
          onMove={onMove}
          gripHandlers={gripHandlers}
        />
        <div className={styles.rowText}>
          <p id={titleId} className={styles.rowTitle}>
            {title}
          </p>
          <p className={styles.rowSummary}>
            {t("quizshow:rounds.summary", {
              kind: t(`quizshow:kind.${round.kind}.name`),
              count: round.questions.length,
            })}
          </p>
          <QuizshowContentLabelChip contentLabel={round.contentLabel} />
        </div>
        <div className={styles.rowActions}>
          <Button
            variant="ghost"
            size="md"
            aria-expanded={isOpen}
            aria-describedby={titleId}
            onClick={onToggle}
          >
            {isOpen ? <FiX aria-hidden /> : <FiEdit2 aria-hidden />}{" "}
            {t(isOpen ? "quizshow:rounds.close" : "quizshow:rounds.edit")}
          </Button>
          <IconButton
            aria-label={t("quizshow:rounds.remove")}
            aria-describedby={titleId}
            onClick={onRemove}
          >
            <FiTrash2 aria-hidden />
          </IconButton>
        </div>
      </div>
      <Collapse isOpen={isOpen}>
        <div className={styles.panel}>
          <QuizshowRoundEditor
            round={round}
            roundIndex={roundIndex}
            isAdultsEvent={isAdultsEvent}
            languages={languages}
            onChange={(patch) => controller.updateRound(roundIndex, patch)}
            onChangeKind={(kind) =>
              controller.changeRoundKind(roundIndex, kind)
            }
          />
          <QuizshowQuestionList
            controller={controller}
            roundIndex={roundIndex}
            languages={languages}
            problems={problems}
            openQuestionIndex={openQuestionIndex}
            onOpenQuestion={onOpenQuestion}
          />
        </div>
      </Collapse>
    </div>
  );
}
