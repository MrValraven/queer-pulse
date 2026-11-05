import { useMemo, useState, type ReactNode } from "react";
import { QuizshowStudioPortalContext } from "./quizshowStudioPortal";
import { AnimatePresence } from "motion/react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowScopeContext, type QuizshowScope } from "../quizshowScope";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { QuizshowStudioCanvas } from "./QuizshowStudioCanvas";
import {
  QuizshowStudioContext,
  useQuizshowStudio,
} from "./QuizshowStudioContext";
import { QuizshowStudioInspector } from "./QuizshowStudioInspector";
import type { QuizshowStudioMoreAction } from "./QuizshowStudioMoreMenu";
import { QuizshowStudioRail } from "./QuizshowStudioRail";
import {
  QuizshowStudioRemoveDialog,
  type QuizshowStudioRemoval,
} from "./QuizshowStudioRemoveDialog";
import {
  QuizshowStudioHintStrip,
  QuizshowStudioShortcutsSheet,
} from "./QuizshowStudioShortcutsSheet";
import {
  QuizshowStudioError,
  QuizshowStudioLoading,
} from "./QuizshowStudioStatus";
import {
  QuizshowStudioTopBar,
  type QuizshowStudioBackLink,
} from "./QuizshowStudioTopBar";
import { railItemSelectionAfter } from "./quizshowStudioDom";
import { useQuizshowStudioController } from "./useQuizshowStudioController";
import {
  STUDIO_ROOT_ATTRIBUTE,
  STUDIO_THUMBNAIL_ATTRIBUTE,
  useStudioShortcuts,
} from "./useStudioShortcuts";
import styles from "./QuizshowStudio.module.css";

export type { QuizshowStudioMoreAction } from "./QuizshowStudioMoreMenu";

/** The question a focused thumbnail stands for, read from its data attributes. */
function focusedThumbnailRemoval(): QuizshowStudioRemoval | null {
  const thumbnail = document.activeElement?.closest<HTMLElement>(
    `[${STUDIO_THUMBNAIL_ATTRIBUTE}]`,
  );
  const roundIndex = Number(thumbnail?.dataset.roundIndex);
  const questionIndex = Number(thumbnail?.dataset.questionIndex);
  if (!Number.isInteger(roundIndex) || !Number.isInteger(questionIndex)) {
    return null;
  }
  return { kind: "question", roundIndex, questionIndex };
}

interface QuizshowStudioWorkspaceProps {
  backLink: QuizshowStudioBackLink;
  moreActions: readonly QuizshowStudioMoreAction[];
}

/** The loaded studio: top bar, rail, canvas with its hint strip, inspector, and the keyboard. */
function QuizshowStudioWorkspace({
  backLink,
  moreActions,
}: QuizshowStudioWorkspaceProps) {
  const { t } = useTranslation();
  const { hasQuiz, actions, save, select } = useQuizshowStudio();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [removal, setRemoval] = useState<QuizshowStudioRemoval | null>(null);
  // The start panel has no rounds to act on, so only Save and ? stay live there.
  useStudioShortcuts({
    onNewQuestion: () => {
      if (hasQuiz) actions.addQuestionAfterSelection();
    },
    onPrevious: actions.selectPrevious,
    onNext: actions.selectNext,
    onDuplicate: () => {
      if (hasQuiz) actions.duplicateSelectedQuestion();
    },
    onDelete: () => {
      const target = focusedThumbnailRemoval();
      if (hasQuiz && target !== null) setRemoval(target);
    },
    onSave: save.saveNow,
    onShowShortcuts: () => setIsShortcutsOpen(true),
    // In the rail the arrows (and Home, End) walk every item, settings row and round headers too.
    onRailStep: (step) => {
      const target = railItemSelectionAfter(step);
      if (target !== null) select(target);
    },
  });
  return (
    <div className={styles.workspace} data-has-quiz={hasQuiz}>
      <h1 className={styles.visuallyHidden}>{t("quizshow:studio.heading")}</h1>
      <QuizshowStudioTopBar
        backLink={backLink}
        moreActions={moreActions}
        onShowShortcuts={() => setIsShortcutsOpen(true)}
      />
      {hasQuiz && (
        <QuizshowStudioRail
          onRequestRemoveQuestion={(roundIndex, questionIndex) =>
            setRemoval({ kind: "question", roundIndex, questionIndex })
          }
          onRequestRemoveRound={(roundIndex) =>
            setRemoval({ kind: "round", roundIndex })
          }
        />
      )}
      <div className={styles.canvasCell}>
        <div className={styles.canvasSlot}>
          <QuizshowStudioCanvas />
        </div>
        {hasQuiz && <QuizshowStudioHintStrip />}
      </div>
      {hasQuiz && (
        <div className={styles.inspectorCell}>
          <QuizshowStudioInspector />
        </div>
      )}
      <QuizshowStudioRemoveDialog
        removal={removal}
        onClose={() => setRemoval(null)}
      />
      <AnimatePresence>
        {isShortcutsOpen && (
          <QuizshowStudioShortcutsSheet
            key="studio-shortcuts"
            onClose={() => setIsShortcutsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export interface QuizshowStudioProps {
  scope: QuizshowScope;
  backLink: QuizshowStudioBackLink;
  moreActions?: QuizshowStudioMoreAction[];
  /** Opens the copy-from picker once on mount (`?start=copy` from My games). */
  initialImportPicker?: boolean;
  /** The event's start (ISO), for the import's series shortcut. */
  eventStartAt?: string | null;
  /** Page overlays, such as the game's results panel. */
  children?: ReactNode;
}

const NO_MORE_ACTIONS: readonly QuizshowStudioMoreAction[] = [];

/**
 * The full-screen, always-dark quiz editor for an event, a game or a
 * template: a top bar, a rail of rounds and slide thumbnails, the slide on
 * the canvas and the inspector. Frameless (no navbar or footer). The scope
 * kind is fixed for the life of one studio; the page remounts it on a change.
 */
export function QuizshowStudio({
  scope,
  backLink,
  moreActions,
  initialImportPicker = false,
  eventStartAt = null,
  children,
}: QuizshowStudioProps) {
  useQuizshowFramelessPage();
  // Menus portal into the root (kept in state so the portal target is never read during render).
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const eventStart = useMemo(
    () => (eventStartAt ? new Date(eventStartAt) : null),
    [eventStartAt],
  );
  const result = useQuizshowStudioController(scope, {
    eventStartAt: eventStart,
    initialImportPicker: initialImportPicker ? "sources" : null,
  });
  let body: ReactNode;
  if (result.status === "ready" && result.value !== null) {
    body = (
      <QuizshowStudioContext.Provider value={result.value}>
        <QuizshowStudioWorkspace
          backLink={backLink}
          moreActions={moreActions ?? NO_MORE_ACTIONS}
        />
      </QuizshowStudioContext.Provider>
    );
  } else if (result.status === "error") {
    body = (
      <QuizshowStudioError
        backLink={backLink}
        reasonKey={result.errorReasonKey}
        onRetry={result.retry}
        isRetrying={result.isRetrying}
      />
    );
  } else {
    body = <QuizshowStudioLoading backLink={backLink} />;
  }
  return (
    <QuizshowScopeContext.Provider value={scope}>
      <div
        ref={setRootElement}
        className={styles.root}
        data-theme="dark"
        data-qs-theme="dark"
        {...{ [STUDIO_ROOT_ATTRIBUTE]: "" }}
      >
        <QuizshowBackdrop variant="studio" />
        <QuizshowStudioPortalContext.Provider value={rootElement}>
          {body}
        </QuizshowStudioPortalContext.Provider>
        {result.conflictDialog}
        {children}
      </div>
    </QuizshowScopeContext.Provider>
  );
}
