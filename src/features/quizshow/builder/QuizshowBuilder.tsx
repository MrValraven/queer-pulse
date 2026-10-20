import { useId, useRef, useState, type ReactNode } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { LoadErrorState, SkeletonLine } from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import type {
  QuizshowQuizProblem,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { QuizshowScopeContext, type QuizshowScope } from "../quizshowScope";
import { draftToInput } from "./quizshowDraft";
import {
  isStructuralProblem,
  quizshowProblemsFor,
  quizshowProblemsFromServer,
  type QuizshowLocalProblem,
} from "./quizshowValidation";
import { QuizshowAdultsSwitch } from "./QuizshowAdultsSwitch";
import { QuizshowBuilderEditor } from "./QuizshowBuilderEditor";
import { QuizshowBuilderHeading } from "./QuizshowBuilderHeading";
import { QuizshowEmptyState } from "./QuizshowEmptyState";
import {
  QuizshowImportButtons,
  type QuizshowImportPicker,
} from "./QuizshowImportButtons";
import { QuizshowLiveSessionPanel } from "./QuizshowLiveSessionPanel";
import { QuizshowOpenLobbyButton } from "./QuizshowOpenLobbyButton";
import { QuizshowProblemList } from "./QuizshowProblemList";
import type { QuizshowOpenTarget } from "./QuizshowRoundList";
import { QuizshowSaveBar } from "./QuizshowSaveBar";
import { QuizshowSaveConflictDialog } from "./QuizshowSaveConflictDialog";
import { QuizshowTryItButton } from "./QuizshowTryItButton";
import { useQuizshowAdultsDraft } from "./useQuizshowAdultsDraft";
import { useQuizshowDraft } from "./useQuizshowDraft";
import { useQuizshowSave } from "./useQuizshowSave";
import styles from "./QuizshowBuilder.module.css";

interface QuizshowBuilderProps {
  scope: QuizshowScope;
  /** The event's start, for the series shortcut; null on a game. */
  eventStartAt: Date | null;
  /** Opens this import picker on mount, once (the "Copy" hand-off from My games). */
  initialImportPicker?: QuizshowImportPicker | null;
}

/** Write the quiz of an event or a game, save it, open the lobby. */
export function QuizshowBuilder({
  scope,
  eventStartAt,
  initialImportPicker = null,
}: QuizshowBuilderProps) {
  const { t } = useTranslation();
  const query = useQuizshowQuiz(scope, { isEnabled: true });
  let body: ReactNode;
  if (query.isPending) {
    body = (
      <div className={styles.skeleton} aria-hidden>
        <SkeletonLine width="40%" height={32} />
        <SkeletonLine width="80%" height={16} />
        <SkeletonLine width="100%" height={160} />
      </div>
    );
  } else if (!query.data) {
    // A failed refresh keeps the last quiz and the host's unsaved draft on
    // screen; the full error state is for a first load that never arrived.
    body = (
      <LoadErrorState
        title={t(quizshowErrorKeyOf(quizshowErrorCodeOf(query.error)))}
        description={t("quizshow:builder.loadError")}
        onRetry={() => void query.refetch()}
        isRetrying={query.isRefetching}
      />
    );
  } else {
    body = (
      <QuizshowBuilderLoaded
        scope={scope}
        eventStartAt={eventStartAt}
        initialImportPicker={initialImportPicker}
        data={query.data}
        isRefreshFailed={query.isRefetchError}
        refetch={async () => (await query.refetch()).data ?? null}
      />
    );
  }
  // The round editor and the problem list read the kind for their copy.
  return (
    <QuizshowScopeContext.Provider value={scope}>
      {body}
    </QuizshowScopeContext.Provider>
  );
}

/** A quiet line under the heading while a refresh of a loaded quiz has failed. */
function QuizshowRefreshNote({
  isRefreshFailed,
}: {
  isRefreshFailed: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div role="status">
      <Collapse isOpen={isRefreshFailed}>
        <p className={styles.refreshNote}>
          {t("quizshow:builder.refreshError")}
        </p>
      </Collapse>
    </div>
  );
}

/**
 * The server's refusal first, then the draft's own problems while it is
 * unsaved, else the saved quiz's problems plus the adults check on the draft.
 */
function shownProblemsOf(options: {
  rejectedProblems: readonly QuizshowLocalProblem[];
  localProblems: readonly QuizshowLocalProblem[];
  serverProblems: readonly QuizshowQuizProblem[];
  isUnsaved: boolean;
}): readonly QuizshowLocalProblem[] {
  const { rejectedProblems, localProblems, serverProblems, isUnsaved } =
    options;
  if (rejectedProblems.length > 0) return rejectedProblems;
  if (isUnsaved) return localProblems;
  return [
    ...quizshowProblemsFromServer(serverProblems),
    ...localProblems.filter(
      (problem) => problem.code === "adults_round_needs_adults_event",
    ),
  ];
}

function QuizshowBuilderLoaded({
  scope,
  eventStartAt,
  initialImportPicker,
  data,
  isRefreshFailed = false,
  refetch,
}: {
  scope: QuizshowScope;
  eventStartAt: Date | null;
  initialImportPicker: QuizshowImportPicker | null;
  data: QuizshowQuizResponse;
  isRefreshFailed?: boolean;
  refetch: () => Promise<QuizshowQuizResponse | null>;
}) {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const controller = useQuizshowDraft(data.quiz);
  const adults = useQuizshowAdultsDraft({
    scope,
    data,
    draft: controller.draft,
  });
  const { isAdultsEvent } = adults;
  const [isBlankStarted, setIsBlankStarted] = useState(false);
  const [openTarget, setOpenTarget] = useState<QuizshowOpenTarget | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  // The panel keeps its last session while the Collapse folds away.
  const [lastLiveSession, setLastLiveSession] = useState(data.liveSession);
  if (data.liveSession && data.liveSession !== lastLiveSession) {
    setLastLiveSession(data.liveSession);
  }
  const shownLiveSession = data.liveSession ?? lastLiveSession;
  const saving = useQuizshowSave({
    scope,
    data,
    controller,
    refetch,
    isAdultsOnly: adults.isAdultsOnlyToSave,
    onReset: adults.resetTo,
  });

  const hasQuiz = data.quiz !== null || isBlankStarted;
  const isUnsaved =
    controller.isDirty ||
    (data.quiz === null && isBlankStarted) ||
    adults.isUnsaved;
  const localProblems = quizshowProblemsFor(
    draftToInput(controller.draft, null),
    { isAdultsEvent },
  );
  const problems = shownProblemsOf({
    rejectedProblems: saving.rejectedProblems,
    localProblems,
    serverProblems: data.problems,
    isUnsaved,
  });
  // The try-out plays the draft on screen now, so its own problems block it;
  // the adults-event check is about the event and leaves the try-out open.
  const dryRunProblems = localProblems.filter(
    (problem) => problem.code !== "adults_round_needs_adults_event",
  );
  // A game is listed by its title, so a blank one cannot be saved.
  const isGame = scope.kind === "game";
  const isGameTitleBlank = isGame && controller.draft.title.trim() === "";
  const isSaveBlocked =
    isGameTitleBlank ||
    problems.some((problem) => isStructuralProblem(problem.code));
  const isLobbyBlocked = isUnsaved || problems.length > 0;
  // While unsaved, the save bar's status line is the reason; the button points at it.
  const saveStatusId = useId();
  const blockedReason =
    !isUnsaved && problems.length > 0 ? t("quizshow:problems.title") : null;

  useUnsavedChangesGuard({
    active: isUnsaved,
    confirmMessage: t("quizshow:save.leaveConfirm"),
    onSaveAndLeave:
      saving.isSaving || isSaveBlocked ? undefined : saving.saveNow,
  });

  const jumpTo = (target: QuizshowOpenTarget) => {
    setOpenTarget(target);
    editorRef.current?.scrollIntoView?.({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };
  const discard = () => {
    controller.resetTo(data.quiz);
    adults.resetTo(data);
    setIsBlankStarted(false);
    setOpenTarget(null);
  };

  // The import parts read the saved switch, the one the server checks.
  if (!hasQuiz) {
    return (
      <QuizshowEmptyState
        scope={scope}
        eventStartAt={eventStartAt}
        isAdultsEvent={data.isAdultsEvent}
        initialOpenPicker={initialImportPicker}
        onStartBlank={() => {
          controller.startBlank(language);
          setIsBlankStarted(true);
        }}
      />
    );
  }
  return (
    <div className={isGame ? `${styles.tab} ${styles.tabGame}` : styles.tab}>
      <div className={styles.headingRow}>
        <QuizshowBuilderHeading scope={scope} />
        <div className={styles.headingActions}>
          <div className={styles.importActions}>
            <QuizshowImportButtons
              scope={scope}
              hasQuiz={(data.quiz?.rounds.length ?? 0) > 0 || isUnsaved}
              eventStartAt={eventStartAt}
              isAdultsEvent={data.isAdultsEvent}
              variant="toolbar"
              initialOpenPicker={initialImportPicker}
              onImported={(response) => {
                controller.resetTo(response.quiz);
                adults.resetTo(response);
              }}
            />
          </div>
          <QuizshowTryItButton
            draft={controller.draft}
            pickedPreviewUrls={controller.pickedPreviewUrls}
            problems={dryRunProblems}
          />
          <QuizshowOpenLobbyButton
            scope={scope}
            isBlocked={isLobbyBlocked}
            blockedReason={blockedReason}
            blockedDescriptionId={isUnsaved ? saveStatusId : undefined}
          />
        </div>
      </div>
      <QuizshowRefreshNote isRefreshFailed={isRefreshFailed} />
      <Collapse isOpen={data.liveSession !== null}>
        {shownLiveSession && (
          <QuizshowLiveSessionPanel
            scope={scope}
            liveSession={shownLiveSession}
          />
        )}
      </Collapse>
      <Collapse isOpen={problems.length > 0}>
        <section className={styles.problems}>
          <h3 className={styles.problemsTitle}>
            {t("quizshow:problems.title")}
          </h3>
          <QuizshowProblemList problems={problems} onJump={jumpTo} />
        </section>
      </Collapse>
      <div ref={editorRef}>
        <QuizshowBuilderEditor
          controller={controller}
          isAdultsEvent={isAdultsEvent}
          problems={problems}
          openTarget={openTarget}
          onOpen={setOpenTarget}
          titleLabelKey={isGame ? "quizshow:games.new.titleLabel" : undefined}
          isTitleRequired={isGame}
          settingsExtra={
            isGame ? (
              <QuizshowAdultsSwitch
                isOn={isAdultsEvent}
                adultsRoundNumbers={adults.adultsRoundNumbers}
                onChange={adults.setIsAdultsOnly}
              />
            ) : undefined
          }
        />
      </div>
      <QuizshowSaveBar
        isVisible={isUnsaved}
        isSaving={saving.isSaving}
        isSaveBlocked={isSaveBlocked}
        statusId={saveStatusId}
        onSave={() => void saving.saveNow()}
        onDiscard={discard}
      />
      <QuizshowSaveConflictDialog
        isOpen={saving.isConflictOpen}
        onLoadTheirs={() => void saving.loadTheirs()}
        onSaveMine={saving.saveMine}
        onClose={saving.closeConflict}
      />
    </div>
  );
}
