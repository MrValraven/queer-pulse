import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FiPlus, FiSliders } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useRowDragReorder } from "../../subprofiles/useRowDragReorder";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { QuizshowStudioMenu } from "./QuizshowStudioMenu";
import { useStudioMenuAnchor } from "./useStudioMenuAnchor";
import { problemSpotsOf, STUDIO_PRESS_FOCUS } from "./quizshowStudioRailView";
import {
  railMenuEntriesOf,
  railMenuKeyOf,
  roundCountLineOf,
  type StudioRailMenuOpenMode,
  type StudioRailMenuTarget,
} from "./quizshowStudioRailMenus";
import { QuizshowStudioRailRows } from "./QuizshowStudioRailRows";
import {
  STUDIO_QUIZ_ROW_ATTRIBUTE as QUIZ_ROW_ATTRIBUTE,
  STUDIO_RAIL_ITEM_ATTRIBUTE,
} from "./quizshowStudioDom";
import {
  isSameStudioSelection,
  QUIZ_SELECTION,
  type QuizshowStudioSelection,
} from "./quizshowStudioSelection";
import { useStudioRailFollow } from "./useStudioRailFollow";
import { STUDIO_RAIL_ATTRIBUTE } from "./useStudioShortcuts";
import { useStudioStableCallback } from "./useStudioStableCallback";
import styles from "./QuizshowStudioRail.module.css";

/**
 * The rail's one shared menu: what it is open for, and the entry a menu
 * swapped into its place focuses (Back lands on "Move to round").
 */
function useRailMenuTarget() {
  const menu = useStudioMenuAnchor();
  const [menuTarget, setMenuTarget] = useState<StudioRailMenuTarget | null>(
    null,
  );
  const [menuFocusKey, setMenuFocusKey] = useState<string | null>(null);
  /** A "..." press toggles; a right-click, Shift+F10 or the menu key only opens. */
  const openMenu = (
    target: StudioRailMenuTarget,
    element: HTMLElement,
    point: { x: number; y: number } | null,
    mode: StudioRailMenuOpenMode,
  ) => {
    if (mode === "toggle" && menu.anchor?.element === element) {
      menu.close(true);
      return;
    }
    setMenuTarget(target);
    setMenuFocusKey(null);
    menu.openAt(element, point);
  };
  /** Another menu in the open one's place, hanging from the same opener. */
  const swapMenuTarget = (
    target: StudioRailMenuTarget,
    focusKey: string | null = null,
  ) => {
    const { anchor } = menu;
    if (anchor === null) return;
    setMenuTarget(target);
    setMenuFocusKey(focusKey);
    menu.openAt(anchor.element, anchor.point);
  };
  return { menu, menuTarget, menuFocusKey, openMenu, swapMenuTarget };
}

/** The settings row at the top of the rail, then every round, then Add round. */
export function QuizshowStudioRail({
  onRequestRemoveQuestion,
  onRequestRemoveRound,
}: {
  onRequestRemoveQuestion: (roundIndex: number, questionIndex: number) => void;
  onRequestRemoveRound: (roundIndex: number) => void;
}) {
  const { t } = useTranslation();
  const {
    controller,
    selection,
    select,
    problems,
    actions,
    viewLanguage,
    isWide,
  } = useQuizshowStudio();
  const { rounds } = controller.draft;
  const railRef = useRef<HTMLElement>(null);
  const { menu, menuTarget, menuFocusKey, openMenu, swapMenuTarget } =
    useRailMenuTarget();
  const { skipNextScroll } = useStudioRailFollow(railRef, selection);
  const isQuizSelected = selection.kind === "quiz";

  // A string key, so the memoised rounds see a new set only when a dot moves.
  const spotsKey = [...problemSpotsOf(problems)].sort().join("|");
  const problemSpots = useMemo(() => new Set(spotsKey.split("|")), [spotsKey]);
  const hasQuizProblem = problems.some(
    (problem) => problem.roundIndex === null,
  );
  const quizQuestionCount = rounds.reduce(
    (total, round) => total + round.questions.length,
    0,
  );

  const { containerRef: roundsRef, gripHandlers: roundGripHandlers } =
    useRowDragReorder(actions.moveRound);
  /** Focus and a context menu select their item without scrolling the rail (the menu would close on the scroll). */
  const selectQuietly = (next: QuizshowStudioSelection) => {
    if (isSameStudioSelection(next, selection)) return;
    skipNextScroll();
    select(next);
  };
  const handlers = {
    onSelectRound: useStudioStableCallback((roundIndex: number) =>
      select({ kind: "round", roundIndex }),
    ),
    onSelectQuestion: useStudioStableCallback(
      (roundIndex: number, questionIndex: number) =>
        select({ kind: "question", roundIndex, questionIndex }),
    ),
    onFocusRound: useStudioStableCallback((roundIndex: number) =>
      selectQuietly({ kind: "round", roundIndex }),
    ),
    onFocusQuestion: useStudioStableCallback(
      (roundIndex: number, questionIndex: number) =>
        selectQuietly({ kind: "question", roundIndex, questionIndex }),
    ),
    onOpenQuestionMenu: useStudioStableCallback(
      (
        roundIndex: number,
        questionIndex: number,
        element: HTMLElement,
        point: { x: number; y: number } | null,
        mode: StudioRailMenuOpenMode,
      ) => {
        if (mode === "open") {
          selectQuietly({ kind: "question", roundIndex, questionIndex });
        }
        openMenu(
          { kind: "question", roundIndex, questionIndex },
          element,
          point,
          mode,
        );
      },
    ),
    onOpenRoundMenu: useStudioStableCallback(
      (
        roundIndex: number,
        element: HTMLElement,
        mode: StudioRailMenuOpenMode,
      ) => {
        if (mode === "open") selectQuietly({ kind: "round", roundIndex });
        openMenu({ kind: "round", roundIndex }, element, null, mode);
      },
    ),
    onAddQuestion: useStudioStableCallback((roundIndex: number) =>
      actions.addQuestionToRound(roundIndex),
    ),
    onMoveQuestion: useStudioStableCallback(
      (roundIndex: number, fromIndex: number, toIndex: number) =>
        actions.moveQuestion(roundIndex, fromIndex, toIndex),
    ),
    onRoundDragPress: useStudioStableCallback(
      (roundIndex: number, event: ReactPointerEvent) =>
        roundGripHandlers(roundIndex).onPointerDown(event),
    ),
  };

  const menuEntries = railMenuEntriesOf({
    target: menuTarget,
    rounds,
    quizQuestionCount,
    viewLanguage,
    actions,
    onRequestRemoveQuestion,
    onRequestRemoveRound,
    // The submenu and the question menu take each other's place, from the same opener.
    onOpenMoveToRound: (roundIndex, questionIndex) =>
      swapMenuTarget({ kind: "moveQuestion", roundIndex, questionIndex }),
    onBackToQuestionMenu: (roundIndex, questionIndex) =>
      swapMenuTarget(
        { kind: "question", roundIndex, questionIndex },
        "moveToRound",
      ),
    t,
  });
  const isMoveToRoundMenu = menuTarget?.kind === "moveQuestion";
  const openMenuKey = menu.isOpen ? railMenuKeyOf(menuTarget) : null;

  return (
    <section
      ref={railRef}
      className={styles.rail}
      aria-label={t("quizshow:studio.rail.label")}
      {...{ [STUDIO_RAIL_ATTRIBUTE]: "" }}
    >
      <QuizshowStudioQuizRow
        isSelected={isQuizSelected}
        hasProblem={hasQuizProblem}
        onFocusSelect={() => selectQuietly(QUIZ_SELECTION)}
        onSelect={() => select(QUIZ_SELECTION)}
      />
      <QuizshowStudioRailRows
        rounds={rounds}
        selection={selection}
        problemSpots={problemSpots}
        viewLanguage={viewLanguage}
        isWide={isWide}
        quizQuestionCount={quizQuestionCount}
        openMenuKey={openMenuKey}
        roundsRef={roundsRef}
        handlers={handlers}
        isAddQuestionToRoundAllowed={actions.isAddQuestionToRoundAllowed}
      />
      <QuizshowStudioRailFooter
        countLine={roundCountLineOf(rounds, quizQuestionCount, t)}
        isAddAllowed={actions.isAddRoundAllowed || actions.isAddWheelAllowed}
        isMenuOpen={openMenuKey === "addRound"}
        onOpenKinds={(element) =>
          openMenu({ kind: "addRound" }, element, null, "toggle")
        }
      />
      <QuizshowStudioMenu
        // A new key mounts each menu fresh, so focus lands on its first entry.
        key={isMoveToRoundMenu ? "moveToRound" : "rail"}
        label={t(
          isMoveToRoundMenu
            ? "quizshow:studio.moveToRound"
            : "quizshow:studio.rail.menuLabel",
        )}
        entries={menuEntries}
        anchor={menu.anchor}
        initialFocusKey={menuFocusKey}
        placement={
          menuTarget?.kind === "addRound" ? "bottom-start" : "bottom-end"
        }
        onClose={(shouldReturnFocus) => menu.close(shouldReturnFocus)}
      />
    </section>
  );
}

/** The Quiz settings row at the top of the rail; one of the rail's roving tab stops. */
function QuizshowStudioQuizRow({
  isSelected,
  hasProblem,
  onFocusSelect,
  onSelect,
}: {
  isSelected: boolean;
  hasProblem: boolean;
  onFocusSelect: () => void;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.quizRow}
      {...{ [QUIZ_ROW_ATTRIBUTE]: "", [STUDIO_RAIL_ITEM_ATTRIBUTE]: "" }}
      tabIndex={isSelected ? 0 : -1}
      aria-current={isSelected ? "true" : undefined}
      onFocus={() => {
        if (!isSelected) onFocusSelect();
      }}
      onClick={(event) => {
        event.currentTarget.focus(STUDIO_PRESS_FOCUS);
        onSelect();
      }}
    >
      <FiSliders aria-hidden className={styles.quizRowIcon} />
      <span>{t("quizshow:studio.rail.quizSettings")}</span>
      {hasProblem && <span className={styles.roundDot} aria-hidden />}
    </button>
  );
}

/**
 * "Add round" (the kind picker, with the wheel last) and "3 of 10 rounds",
 * or the quiz-wide question limit when that is what blocks a round. The
 * picker opens while either a round or a wheel still fits.
 */
function QuizshowStudioRailFooter({
  countLine,
  isAddAllowed,
  isMenuOpen,
  onOpenKinds,
}: {
  countLine: string;
  isAddAllowed: boolean;
  isMenuOpen: boolean;
  onOpenKinds: (element: HTMLElement) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
      <Button
        variant="quiet"
        size="sm"
        className={styles.addRound}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-disabled={!isAddAllowed || undefined}
        onClick={(event) => {
          if (isAddAllowed) onOpenKinds(event.currentTarget);
        }}
      >
        <FiPlus aria-hidden />
        {t("quizshow:studio.rail.addRoundOrWheel")}
      </Button>
      <p className={styles.countLine} role="status">
        {countLine}
      </p>
    </div>
  );
}
