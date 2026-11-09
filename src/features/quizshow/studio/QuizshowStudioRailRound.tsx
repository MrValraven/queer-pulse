import {
  memo,
  useId,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react";
import { AnimatePresence } from "motion/react";
import { FiMoreHorizontal, FiPlus } from "react-icons/fi";
import { Button, Collapse, IconButton } from "../../../shared/components/ui";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import type { QuizshowLanguage } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useRowDragReorder } from "../../subprofiles/useRowDragReorder";
import type { QuizshowDraftRound } from "../builder/quizshowDraft";
import {
  isContextMenuKey,
  isPartyRoundKind,
  problemSpotKey,
  shownTextOf,
  STUDIO_PRESS_FOCUS,
} from "./quizshowStudioRailView";
import {
  STUDIO_RAIL_ITEM_ATTRIBUTE,
  STUDIO_ROUND_HEADER_ATTRIBUTE,
} from "./quizshowStudioDom";
import {
  addLimitNoteOf,
  type StudioRailMenuOpenMode,
} from "./quizshowStudioRailMenus";
import {
  QuizshowStudioThumbnail,
  type QuizshowStudioThumbnailProps,
} from "./QuizshowStudioThumbnail";
import { useStudioStableCallback } from "./useStudioStableCallback";
import styles from "./QuizshowStudioRail.module.css";

export interface QuizshowStudioRailRoundProps {
  round: QuizshowDraftRound;
  roundIndex: number;
  /** "Round 3": the round's place among the rows that are not wheels. */
  roundNumber: number;
  /** The wheel whose range holds this round; null outside every range. */
  wheelNumber: number | null;
  viewLanguage: QuizshowLanguage;
  /** The selected question's index in this round; null when none of its questions is selected. */
  selectedQuestionIndex: number | null;
  isRoundSelected: boolean;
  problemSpots: ReadonlySet<string>;
  isWide: boolean;
  isAddQuestionAllowed: boolean;
  quizQuestionCount: number;
  /** Which menu is open in the rail, as `round-1` or `question-1-2`; drives aria-expanded. */
  openMenuKey: string | null;
  onSelectRound: (roundIndex: number) => void;
  onSelectQuestion: (roundIndex: number, questionIndex: number) => void;
  onFocusRound: (roundIndex: number) => void;
  onFocusQuestion: (roundIndex: number, questionIndex: number) => void;
  onOpenQuestionMenu: QuizshowStudioThumbnailProps["onOpenMenu"];
  onOpenRoundMenu: (
    roundIndex: number,
    element: HTMLElement,
    mode: StudioRailMenuOpenMode,
  ) => void;
  onAddQuestion: (roundIndex: number) => void;
  onMoveQuestion: (
    roundIndex: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  /** Starts a drag of the whole round from its header (mouse and pen, wide rail). */
  onRoundDragPress: (roundIndex: number, event: ReactPointerEvent) => void;
}

/**
 * A round in the rail: its header (number, kind in coral for quiz or lilac
 * for party rounds, title, count and a problem dot), its question thumbnails
 * in a drag-reorderable list, and an add button.
 */
function QuizshowStudioRailRoundBase(props: QuizshowStudioRailRoundProps) {
  const { round, roundIndex, viewLanguage, isWide, onMoveQuestion } = props;
  const { roundNumber, wheelNumber } = props;
  const { t } = useTranslation();
  const limitId = useId();
  const problemId = useId();
  const inWheelId = useId();
  const { containerRef, gripHandlers } = useRowDragReorder((from, to) =>
    onMoveQuestion(roundIndex, from, to),
  );
  const onDragPress = useStudioStableCallback(
    (questionIndex: number, event: ReactPointerEvent) =>
      gripHandlers(questionIndex).onPointerDown(event),
  );
  const title =
    shownTextOf(round.title, viewLanguage) ||
    t("quizshow:rounds.untitled", { number: roundNumber });
  // Wheel rows render as QuizshowStudioRailWheel, so only playable kinds land here.
  const isParty = isPartyRoundKind(round.kind);
  const questionCount = round.questions.length;
  const hasRoundProblem = props.problemSpots.has(
    problemSpotKey(roundIndex, null),
  );
  const isInWheel = wheelNumber !== null;
  const describedByIds = [
    hasRoundProblem ? problemId : null,
    isInWheel ? inWheelId : null,
  ].filter((id) => id !== null);
  return (
    <div
      className={styles.round}
      data-party={isParty || undefined}
      data-in-wheel={isInWheel || undefined}
    >
      <div
        className={styles.roundHead}
        data-selected={props.isRoundSelected || undefined}
      >
        <button
          type="button"
          className={styles.roundButton}
          {...{
            [STUDIO_ROUND_HEADER_ATTRIBUTE]: "",
            [STUDIO_RAIL_ITEM_ATTRIBUTE]: "",
          }}
          data-round-index={roundIndex}
          tabIndex={props.isRoundSelected ? 0 : -1}
          aria-current={props.isRoundSelected ? "true" : undefined}
          aria-label={t("quizshow:studio.rail.roundLabel", {
            number: roundNumber,
            title,
            kind: t(`quizshow:kind.${round.kind}.name`),
            count: questionCount,
          })}
          aria-describedby={
            describedByIds.length > 0 ? describedByIds.join(" ") : undefined
          }
          onPointerDown={(event) => {
            if (isWide && event.pointerType !== "touch") {
              props.onRoundDragPress(roundIndex, event);
            }
          }}
          onFocus={() => {
            if (!props.isRoundSelected) props.onFocusRound(roundIndex);
          }}
          onClick={(event) => {
            event.currentTarget.focus(STUDIO_PRESS_FOCUS);
            props.onSelectRound(roundIndex);
          }}
          onKeyDown={(event) => {
            if (!isContextMenuKey(event)) return;
            event.preventDefault();
            props.onOpenRoundMenu(roundIndex, event.currentTarget, "open");
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            props.onOpenRoundMenu(roundIndex, event.currentTarget, "open");
          }}
        >
          <span className={styles.roundKind} aria-hidden>
            {t(`quizshow:kind.${round.kind}.name`)}
          </span>
          <span className={styles.roundTitleRow} aria-hidden>
            <span className={styles.roundNumber}>{roundNumber}</span>
            <span className={styles.roundTitle}>{title}</span>
            {hasRoundProblem && <span className={styles.roundDot} />}
            <span className={styles.roundCount}>{questionCount}</span>
          </span>
        </button>
        {hasRoundProblem && (
          <span id={problemId} className={styles.visuallyHidden}>
            {t("quizshow:studio.rail.needsFixing")}
          </span>
        )}
        {isInWheel && (
          <span id={inWheelId} className={styles.visuallyHidden}>
            {t("quizshow:studio.rail.inWheel", { number: wheelNumber })}
          </span>
        )}
        <IconButton
          size="sm"
          tone="dark"
          tabIndex={-1}
          className={styles.roundMore}
          aria-label={t("quizshow:studio.rail.roundMenu", { title })}
          aria-haspopup="menu"
          aria-expanded={props.openMenuKey === `round-${roundIndex}`}
          onClick={(event) =>
            props.onOpenRoundMenu(roundIndex, event.currentTarget, "toggle")
          }
        >
          <FiMoreHorizontal aria-hidden />
        </IconButton>
      </div>
      <ul
        className={styles.thumbs}
        ref={containerRef as unknown as Ref<HTMLUListElement>}
      >
        <AnimatePresence initial={false}>
          {round.questions.map((draftQuestion, questionIndex) => (
            <CollapseListItem key={draftQuestion.draftKey}>
              <QuizshowStudioThumbnail
                draftQuestion={draftQuestion}
                roundIndex={roundIndex}
                questionIndex={questionIndex}
                roundKind={round.kind}
                viewLanguage={viewLanguage}
                isSelected={props.selectedQuestionIndex === questionIndex}
                hasProblem={props.problemSpots.has(
                  problemSpotKey(roundIndex, questionIndex),
                )}
                isMenuOpen={
                  props.openMenuKey ===
                  `question-${roundIndex}-${questionIndex}`
                }
                isDraggable={isWide}
                onSelect={props.onSelectQuestion}
                onFocusSelect={props.onFocusQuestion}
                onOpenMenu={props.onOpenQuestionMenu}
                onDragPress={onDragPress}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      {/* Out of the tab order: the rail is one stop, and the round's menu and N add questions from the keyboard. */}
      <Button
        variant="quiet"
        size="sm"
        tabIndex={-1}
        className={styles.addQuestion}
        aria-disabled={!props.isAddQuestionAllowed || undefined}
        aria-describedby={props.isAddQuestionAllowed ? undefined : limitId}
        aria-label={t("quizshow:studio.rail.addQuestionTo", { title })}
        onClick={() => {
          if (props.isAddQuestionAllowed) props.onAddQuestion(roundIndex);
        }}
      >
        <FiPlus aria-hidden />
        <span aria-hidden>{t("quizshow:questions.add")}</span>
      </Button>
      <Collapse
        isOpen={!props.isAddQuestionAllowed}
        className={styles.limitWrap}
      >
        <p id={limitId} className={styles.limitNote}>
          {addLimitNoteOf(questionCount, props.quizQuestionCount, t)}
        </p>
      </Collapse>
    </div>
  );
}

export const QuizshowStudioRailRound = memo(QuizshowStudioRailRoundBase);
