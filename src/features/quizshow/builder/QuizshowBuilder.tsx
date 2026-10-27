import { useId, useRef, useState, type ReactNode } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { LoadErrorState, SkeletonLine } from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import { cx } from "../../../shared/lib/cx";
import type { QuizshowQuizResponse } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import {
  isQuizshowSessionScope,
  QuizshowScopeContext,
  useQuizshowScopeKind,
  type QuizshowScope,
} from "../quizshowScope";
import { QuizshowTemplateDetails } from "../templates/QuizshowTemplateDetails";
import { quizshowTemplateErrorKeyOf } from "../templates/quizshowTemplateErrors";
import { templateMetaOf } from "../templates/quizshowTemplateResponse";
import { useQuizshowTemplateDraft } from "../templates/useQuizshowTemplateDraft";
import {
  isStructuralProblem,
  type QuizshowLocalProblem,
} from "./quizshowValidation";
import { QuizshowAdultsSwitch } from "./QuizshowAdultsSwitch";
import { QuizshowBuilderEditor } from "./QuizshowBuilderEditor";
import { QuizshowBuilderToolbar } from "./QuizshowBuilderToolbar";
import { QuizshowEmptyState } from "./QuizshowEmptyState";
import type { QuizshowImportPicker } from "./QuizshowImportButtons";
import { QuizshowLiveSessionPanel } from "./QuizshowLiveSessionPanel";
import { QuizshowProblemList } from "./QuizshowProblemList";
import type { QuizshowOpenTarget } from "./QuizshowRoundList";
import { QuizshowSaveBar } from "./QuizshowSaveBar";
import { QuizshowSaveConflictDialog } from "./QuizshowSaveConflictDialog";
import { useQuizshowAdultsDraft } from "./useQuizshowAdultsDraft";
import { useQuizshowBuilderProblems } from "./useQuizshowBuilderProblems";
import { useQuizshowDraft } from "./useQuizshowDraft";
import { useQuizshowSave } from "./useQuizshowSave";
import styles from "./QuizshowBuilder.module.css";

interface QuizshowBuilderProps {
  scope: QuizshowScope;
  /** The event's start, for the series shortcut; null on a game or a template. */
  eventStartAt: Date | null;
  /** Opens this import picker on mount, once (the "Copy" hand-off from My games). */
  initialImportPicker?: QuizshowImportPicker | null;
}

/** Write the quiz of an event, a game or a template, save it, and open the lobby on an event or a game. */
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
        title={t(
          scope.kind === "template"
            ? quizshowTemplateErrorKeyOf(query.error)
            : quizshowErrorKeyOf(quizshowErrorCodeOf(query.error)),
        )}
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

/** The list of what to fix, titled for what it gates: the lobby, or a template's publish. */
function QuizshowBuilderProblems({
  problems,
  onJump,
}: {
  problems: readonly QuizshowLocalProblem[];
  onJump: (target: QuizshowOpenTarget) => void;
}) {
  const { t } = useTranslation();
  const isTemplate = useQuizshowScopeKind() === "template";
  return (
    <Collapse isOpen={problems.length > 0}>
      <section className={styles.problems}>
        <h3 className={styles.problemsTitle}>
          {t(
            isTemplate
              ? "quizshow:templates.problemsTitle"
              : "quizshow:problems.title",
          )}
        </h3>
        <QuizshowProblemList problems={problems} onJump={onJump} />
      </section>
    </Collapse>
  );
}

/**
 * The builder's column. A game page clears the save bar itself, and a
 * template moves the bar beside the admin rail.
 */
function tabClassNameOf(kind: QuizshowScope["kind"]): string {
  return cx(
    styles.tab,
    kind === "game" && styles.tabGame,
    kind === "template" && styles.tabTemplate,
  );
}

interface QuizshowBuilderLoadedProps {
  scope: QuizshowScope;
  eventStartAt: Date | null;
  initialImportPicker: QuizshowImportPicker | null;
  data: QuizshowQuizResponse;
  isRefreshFailed?: boolean;
  refetch: () => Promise<QuizshowQuizResponse | null>;
}

function QuizshowBuilderLoaded({
  scope,
  eventStartAt,
  initialImportPicker,
  data,
  isRefreshFailed = false,
  refetch,
}: QuizshowBuilderLoadedProps) {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const sessionScope = isQuizshowSessionScope(scope) ? scope : null;
  const controller = useQuizshowDraft(data.quiz);
  const adults = useQuizshowAdultsDraft({
    scope,
    data,
    draft: controller.draft,
  });
  const { isAdultsEvent } = adults;
  const templateDraft = useQuizshowTemplateDraft({ data });
  const templateMeta = templateMetaOf(data);
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
    templateFields: templateDraft.fieldsToSave,
    onReset: (response) => {
      adults.resetTo(response);
      templateDraft.resetTo(response);
    },
  });

  const hasQuiz = data.quiz !== null || isBlankStarted;
  const isUnsaved =
    controller.isDirty ||
    (data.quiz === null && isBlankStarted) ||
    adults.isUnsaved ||
    templateDraft.isUnsaved;
  const { problems, dryRunProblems, publishing } = useQuizshowBuilderProblems({
    scope,
    data,
    draft: controller.draft,
    isAdultsEvent,
    isUnsaved,
    saveRejectedProblems: saving.rejectedProblems,
    templateCard: templateDraft.card,
  });
  // A game is listed by its title and the server refuses a blank template title, so both need one.
  const isGame = scope.kind === "game";
  const isTitleRequired = scope.kind !== "event";
  const isTitleBlank = isTitleRequired && controller.draft.title.trim() === "";
  const isSaveBlocked =
    isTitleBlank ||
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
    templateDraft.resetTo(data);
    setIsBlankStarted(false);
    setOpenTarget(null);
  };

  // The import parts read the saved switch, the one the server checks.
  // The scope kind is fixed for the life of the builder, so this part mounts by kind.
  if (!hasQuiz && sessionScope) {
    return (
      <QuizshowEmptyState
        scope={sessionScope}
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
    <div className={tabClassNameOf(scope.kind)}>
      {/* A template's card leads, so the quiz heading sits next to its rounds. The kind is fixed, so this mounts by kind. */}
      {templateMeta && (
        <QuizshowTemplateDetails
          templateDraft={templateDraft}
          meta={templateMeta}
          languages={controller.draft.languages}
          publishing={publishing}
        />
      )}
      <QuizshowBuilderToolbar
        scope={scope}
        importProps={{
          hasQuiz: (data.quiz?.rounds.length ?? 0) > 0 || isUnsaved,
          eventStartAt,
          isAdultsEvent: data.isAdultsEvent,
          initialImportPicker,
          onImported: (response) => {
            controller.resetTo(response.quiz);
            adults.resetTo(response);
          },
        }}
        tryItProps={{
          draft: controller.draft,
          pickedPreviewUrls: controller.pickedPreviewUrls,
          problems: dryRunProblems,
        }}
        lobbyProps={{
          isBlocked: isLobbyBlocked,
          blockedReason,
          blockedDescriptionId: isUnsaved ? saveStatusId : undefined,
        }}
      />
      <QuizshowRefreshNote isRefreshFailed={isRefreshFailed} />
      <Collapse isOpen={sessionScope !== null && data.liveSession !== null}>
        {/* The scope kind is fixed for the life of the builder, so this part mounts by kind. */}
        {sessionScope && shownLiveSession && (
          <QuizshowLiveSessionPanel
            scope={sessionScope}
            liveSession={shownLiveSession}
          />
        )}
      </Collapse>
      <QuizshowBuilderProblems problems={problems} onJump={jumpTo} />
      <div ref={editorRef}>
        <QuizshowBuilderEditor
          controller={controller}
          isAdultsEvent={isAdultsEvent}
          problems={problems}
          openTarget={openTarget}
          onOpen={setOpenTarget}
          titleLabelKey={isGame ? "quizshow:games.new.titleLabel" : undefined}
          isTitleRequired={isTitleRequired}
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
        saveLabelKey={
          scope.kind === "template" ? "quizshow:templates.saveCta" : undefined
        }
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
