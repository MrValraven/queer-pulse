import { memo, useId, type PointerEvent as ReactPointerEvent } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import type {
  QuizshowLanguage,
  QuizshowQuestionInput,
  QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowDraftQuestion } from "../builder/quizshowDraft";
import {
  contextMenuPointOf,
  isContextMenuKey,
  isPartyRoundKind,
  shownTextOf,
  STUDIO_PRESS_FOCUS,
  thumbnailCellsOf,
  thumbnailLayoutOf,
} from "./quizshowStudioRailView";
import { STUDIO_RAIL_ITEM_ATTRIBUTE } from "./quizshowStudioDom";
import type { StudioRailMenuOpenMode } from "./quizshowStudioRailMenus";
import { STUDIO_THUMBNAIL_ATTRIBUTE } from "./useStudioShortcuts";
import styles from "./QuizshowStudioRail.module.css";

/** The answer layout under the prompt: a sketch of the slide's tiles, the right one in jade. */
function QuizshowStudioThumbnailSketch({
  question,
  roundKind,
}: {
  question: QuizshowQuestionInput;
  roundKind: QuizshowRoundKind;
}) {
  const layout = thumbnailLayoutOf(question, roundKind);
  const { count, correctIndex } = thumbnailCellsOf(question);
  const cells = Array.from({ length: count }, (_unused, cellIndex) => (
    <span
      key={cellIndex}
      className={styles.cell}
      data-correct={cellIndex === correctIndex || undefined}
    />
  ));
  return (
    <span className={styles.sketch} data-layout={layout}>
      {cells}
      {layout === "typed" && <span className={styles.cell} />}
      {layout === "number" && <span className={styles.cell} />}
      {layout === "prompt" && <span className={styles.card} />}
      {layout === "picture" && <span className={styles.picture} />}
    </span>
  );
}

export interface QuizshowStudioThumbnailProps {
  draftQuestion: QuizshowDraftQuestion;
  roundIndex: number;
  questionIndex: number;
  roundKind: QuizshowRoundKind;
  viewLanguage: QuizshowLanguage;
  isSelected: boolean;
  hasProblem: boolean;
  isMenuOpen: boolean;
  /** Mouse and pen presses may start a drag (wide rail only); a finger scrolls the rail. */
  isDraggable: boolean;
  onSelect: (roundIndex: number, questionIndex: number) => void;
  /** Focus selects too, without scrolling the rail (the browser already shows what takes focus). */
  onFocusSelect: (roundIndex: number, questionIndex: number) => void;
  /** `open` for a right-click, Shift+F10 or the menu key (selects the slide too); `toggle` for the "..." button. */
  onOpenMenu: (
    roundIndex: number,
    questionIndex: number,
    element: HTMLElement,
    point: { x: number; y: number } | null,
    mode: StudioRailMenuOpenMode,
  ) => void;
  onDragPress: (questionIndex: number, event: ReactPointerEvent) => void;
}

/**
 * One question in the rail: a CSS miniature of its 16:9 velvet slide (the
 * number, two lines of prompt and a sketch of its answer layout), a problem
 * dot, and a "..." menu. Memoised, and cheap enough that a rail of 200 stays
 * smooth: no stage render, no motion of its own.
 */
function QuizshowStudioThumbnailBase({
  draftQuestion,
  roundIndex,
  questionIndex,
  roundKind,
  viewLanguage,
  isSelected,
  hasProblem,
  isMenuOpen,
  isDraggable,
  onSelect,
  onFocusSelect,
  onOpenMenu,
  onDragPress,
}: QuizshowStudioThumbnailProps) {
  const { t } = useTranslation();
  const problemId = useId();
  const { question } = draftQuestion;
  const number = questionIndex + 1;
  const prompt = shownTextOf(question.prompt, viewLanguage);
  const isParty = isPartyRoundKind(roundKind);
  // A blank prompt shows what the slide is, quietly: its type, or its party game.
  const shownPrompt =
    prompt ||
    t(
      isParty
        ? `quizshow:kind.${roundKind}.name`
        : `quizshow:type.${question.type}`,
    );
  const label = prompt
    ? t("quizshow:studio.rail.questionLabel", { number, prompt })
    : t("quizshow:questions.untitled", { number });
  const menuLabel = t("quizshow:studio.rail.questionMenu", { number });
  return (
    <div
      className={styles.thumb}
      data-selected={isSelected || undefined}
      data-party={isParty || undefined}
    >
      <button
        type="button"
        className={styles.slide}
        {...{
          [STUDIO_THUMBNAIL_ATTRIBUTE]: "",
          [STUDIO_RAIL_ITEM_ATTRIBUTE]: "",
        }}
        data-round-index={roundIndex}
        data-question-index={questionIndex}
        tabIndex={isSelected ? 0 : -1}
        aria-label={label}
        aria-current={isSelected ? "true" : undefined}
        aria-describedby={hasProblem ? problemId : undefined}
        onPointerDown={(event) => {
          if (isDraggable && event.pointerType !== "touch") {
            onDragPress(questionIndex, event);
          }
        }}
        onClick={(event) => {
          // A mouse press that may become a drag keeps focus where it was; the click takes it.
          event.currentTarget.focus(STUDIO_PRESS_FOCUS);
          onSelect(roundIndex, questionIndex);
        }}
        onFocus={() => {
          if (!isSelected) onFocusSelect(roundIndex, questionIndex);
        }}
        onKeyDown={(event) => {
          if (!isContextMenuKey(event)) return;
          event.preventDefault();
          onOpenMenu(
            roundIndex,
            questionIndex,
            event.currentTarget,
            null,
            "open",
          );
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          onOpenMenu(
            roundIndex,
            questionIndex,
            event.currentTarget,
            contextMenuPointOf(event),
            "open",
          );
        }}
      >
        <span className={styles.mini} aria-hidden>
          <span className={styles.head}>
            <span className={styles.number}>{number}</span>
            {hasProblem && <span className={styles.dot} />}
          </span>
          <span className={styles.prompt} data-empty={!prompt || undefined}>
            {shownPrompt}
          </span>
          <QuizshowStudioThumbnailSketch
            question={question}
            roundKind={roundKind}
          />
        </span>
      </button>
      {hasProblem && (
        <span id={problemId} className={styles.visuallyHidden}>
          {t("quizshow:studio.rail.needsFixing")}
        </span>
      )}
      <IconButton
        size="sm"
        tone="dark"
        className={styles.more}
        aria-label={menuLabel}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        tabIndex={-1}
        onClick={(event) =>
          onOpenMenu(
            roundIndex,
            questionIndex,
            event.currentTarget,
            null,
            "toggle",
          )
        }
      >
        <FiMoreHorizontal aria-hidden />
      </IconButton>
    </div>
  );
}

export const QuizshowStudioThumbnail = memo(QuizshowStudioThumbnailBase);
