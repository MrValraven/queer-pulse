import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import type {
  QuizshowQuizProblem,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ApiError } from "../../../shared/api/client";
import {
  quizshowErrorCodeOf,
  quizshowErrorKeyOf,
  quizshowProblemsOf,
} from "../api/quizshowErrors";
import { useSaveQuizshowQuiz } from "../api/useQuizshowMutations";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { draftToInput, type QuizshowDraft } from "./quizshowDraft";
import {
  isStructuralProblem,
  quizshowProblemsFor,
  quizshowProblemsFromServer,
  type QuizshowLocalProblem,
} from "./quizshowValidation";
import { QuizshowBuilderEditor } from "./QuizshowBuilderEditor";
import { QuizshowDryRun } from "./QuizshowDryRun";
import { QuizshowEmptyState } from "./QuizshowEmptyState";
import { QuizshowImportButtons } from "./QuizshowImportButtons";
import { QuizshowLiveSessionPanel } from "./QuizshowLiveSessionPanel";
import { QuizshowOpenLobbyButton } from "./QuizshowOpenLobbyButton";
import { QuizshowProblemList } from "./QuizshowProblemList";
import type { QuizshowOpenTarget } from "./QuizshowRoundList";
import { QuizshowSaveBar } from "./QuizshowSaveBar";
import { QuizshowSaveConflictDialog } from "./QuizshowSaveConflictDialog";
import {
  useQuizshowDraft,
  type QuizshowDraftController,
} from "./useQuizshowDraft";
import styles from "./QuizshowBuilder.module.css";

/** The Live game tab of the Manage page: write the quiz, save it, open the lobby. */
export function QuizshowBuilderTab({
  slug,
  eventStartAt,
}: {
  slug: string;
  eventStartAt: Date;
}) {
  const { t } = useTranslation();
  const query = useQuizshowQuiz(slug, { isEnabled: true });
  if (query.isPending) {
    return (
      <div className={styles.skeleton} aria-hidden>
        <SkeletonLine width="40%" height={32} />
        <SkeletonLine width="80%" height={16} />
        <SkeletonLine width="100%" height={160} />
      </div>
    );
  }
  // A failed refresh keeps the last quiz and the host's unsaved draft on
  // screen; the full error state is for a first load that never arrived.
  if (!query.data) {
    return (
      <LoadErrorState
        title={t(quizshowErrorKeyOf(quizshowErrorCodeOf(query.error)))}
        description={t("quizshow:builder.loadError")}
        onRetry={() => void query.refetch()}
        isRetrying={query.isRefetching}
      />
    );
  }
  return (
    <QuizshowBuilderLoaded
      slug={slug}
      eventStartAt={eventStartAt}
      data={query.data}
      isRefreshFailed={query.isRefetchError}
      refetch={async () => (await query.refetch()).data ?? null}
    />
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

function conflictUpdatedAtOf(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const { data } = error;
  if (typeof data !== "object" || data === null) return null;
  const { updatedAt } = data as { updatedAt?: unknown };
  return typeof updatedAt === "string" ? updatedAt : null;
}

function useQuizshowSave(options: {
  slug: string;
  data: QuizshowQuizResponse;
  controller: QuizshowDraftController;
  refetch: () => Promise<QuizshowQuizResponse | null>;
}) {
  const { slug, data, controller, refetch } = options;
  const { t } = useTranslation();
  const { showToast } = useToast();
  const saveQuiz = useSaveQuizshowQuiz(slug);
  const [conflictUpdatedAt, setConflictUpdatedAt] = useState<string | null>(
    null,
  );
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  // The server's refusal belongs to the draft it answered; any edit makes a
  // new draft object, which retires the list without an effect.
  const [rejected, setRejected] = useState<{
    draft: QuizshowDraftController["draft"];
    problems: QuizshowQuizProblem[];
  } | null>(null);

  async function save(expectedUpdatedAt: string | null): Promise<boolean> {
    const sentDraft = controller.draft;
    try {
      const response = await saveQuiz.mutateAsync(
        draftToInput(sentDraft, expectedUpdatedAt),
      );
      showToast(t("quizshow:save.saved"), "success");
      controller.resetTo(response.quiz);
      setRejected(null);
      return true;
    } catch (error) {
      const code = quizshowErrorCodeOf(error);
      if (code === "quizshow_quiz_changed") {
        setConflictUpdatedAt(conflictUpdatedAtOf(error));
        setIsConflictOpen(true);
      } else if (code === "quizshow_quiz_invalid") {
        setRejected({ draft: sentDraft, problems: quizshowProblemsOf(error) });
        showToast(t("quizshow:save.invalid"), "error");
      } else {
        showToast(t(quizshowErrorKeyOf(code)), "error");
      }
      return false;
    }
  }

  const rejectedProblems =
    rejected && rejected.draft === controller.draft
      ? quizshowProblemsFromServer(rejected.problems)
      : [];

  return {
    isSaving: saveQuiz.isPending,
    isConflictOpen,
    rejectedProblems,
    saveNow: () => save(data.quiz?.updatedAt ?? null),
    saveMine: () => {
      setIsConflictOpen(false);
      void save(conflictUpdatedAt);
    },
    loadTheirs: async () => {
      setIsConflictOpen(false);
      const fresh = await refetch();
      controller.resetTo(fresh?.quiz ?? null);
      setRejected(null);
    },
    closeConflict: () => setIsConflictOpen(false),
  };
}

/** Plays the draft with pretend players; blocked while the draft has problems (the questions need answers to play). */
function QuizshowTryItButton({
  draft,
  pickedPreviewUrls,
  problems,
}: {
  draft: QuizshowDraft;
  pickedPreviewUrls: ReadonlyMap<string, string>;
  problems: readonly QuizshowLocalProblem[];
}) {
  const { t } = useTranslation();
  const problemsId = useId();
  const [isDryRunOpen, setIsDryRunOpen] = useState(false);
  const isBlocked = problems.length > 0;
  return (
    <>
      <Button
        variant="ghost"
        type="button"
        aria-disabled={isBlocked}
        aria-describedby={isBlocked ? problemsId : undefined}
        onClick={() => {
          if (!isBlocked) setIsDryRunOpen(true);
        }}
      >
        {t("quizshow:dryRun.open")}
      </Button>
      {/* Read out as the button's description; the problems panel shows the same list on screen. */}
      <div id={problemsId} hidden>
        <QuizshowProblemList problems={problems} />
      </div>
      <AnimatePresence>
        {isDryRunOpen && (
          <QuizshowDryRun
            key="quizshow-dry-run"
            draft={draft}
            pickedPreviewUrls={pickedPreviewUrls}
            onClose={() => setIsDryRunOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function QuizshowBuilderLoaded({
  slug,
  eventStartAt,
  data,
  isRefreshFailed = false,
  refetch,
}: {
  slug: string;
  eventStartAt: Date;
  data: QuizshowQuizResponse;
  isRefreshFailed?: boolean;
  refetch: () => Promise<QuizshowQuizResponse | null>;
}) {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const controller = useQuizshowDraft(data.quiz);
  const [isBlankStarted, setIsBlankStarted] = useState(false);
  const [openTarget, setOpenTarget] = useState<QuizshowOpenTarget | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  // The panel keeps its last session while the Collapse folds away.
  const [lastLiveSession, setLastLiveSession] = useState(data.liveSession);
  if (data.liveSession && data.liveSession !== lastLiveSession) {
    setLastLiveSession(data.liveSession);
  }
  const shownLiveSession = data.liveSession ?? lastLiveSession;
  const saving = useQuizshowSave({ slug, data, controller, refetch });

  const hasQuiz = data.quiz !== null || isBlankStarted;
  const isUnsaved =
    controller.isDirty || (data.quiz === null && isBlankStarted);
  const localProblems = quizshowProblemsFor(
    draftToInput(controller.draft, null),
    { isAdultsEvent: data.isAdultsEvent },
  );
  let problems: readonly QuizshowLocalProblem[];
  if (saving.rejectedProblems.length > 0) problems = saving.rejectedProblems;
  else if (isUnsaved) problems = localProblems;
  else
    problems = [
      ...quizshowProblemsFromServer(data.problems),
      ...localProblems.filter(
        (problem) => problem.code === "adults_round_needs_adults_event",
      ),
    ];
  // The try-out plays the draft on screen now, so its own problems block it;
  // the adults-event check is about the event and leaves the try-out open.
  const dryRunProblems = localProblems.filter(
    (problem) => problem.code !== "adults_round_needs_adults_event",
  );
  const isSaveBlocked = problems.some((problem) =>
    isStructuralProblem(problem.code),
  );
  let blockedReason: string | null = null;
  if (isUnsaved) blockedReason = t("quizshow:save.unsaved");
  else if (problems.length > 0) blockedReason = t("quizshow:problems.title");

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
    setIsBlankStarted(false);
    setOpenTarget(null);
  };

  if (!hasQuiz) {
    return (
      <QuizshowEmptyState
        slug={slug}
        eventStartAt={eventStartAt}
        isAdultsEvent={data.isAdultsEvent}
        onStartBlank={() => {
          controller.startBlank(language);
          setIsBlankStarted(true);
        }}
      />
    );
  }
  return (
    <div className={styles.tab}>
      <div className={styles.headingRow}>
        <div className={styles.headingText}>
          <h2 className={styles.heading}>{t("quizshow:builder.heading")}</h2>
          <p className={styles.lead}>{t("quizshow:builder.lead")}</p>
        </div>
        <div className={styles.headingActions}>
          <div className={styles.importActions}>
            <QuizshowImportButtons
              slug={slug}
              hasQuiz
              eventStartAt={eventStartAt}
              isAdultsEvent={data.isAdultsEvent}
              variant="toolbar"
              onImported={(response) => controller.resetTo(response.quiz)}
            />
          </div>
          <QuizshowTryItButton
            draft={controller.draft}
            pickedPreviewUrls={controller.pickedPreviewUrls}
            problems={dryRunProblems}
          />
          <QuizshowOpenLobbyButton
            slug={slug}
            isBlocked={blockedReason !== null}
            blockedReason={blockedReason}
          />
        </div>
      </div>
      <QuizshowRefreshNote isRefreshFailed={isRefreshFailed} />
      <Collapse isOpen={data.liveSession !== null}>
        {shownLiveSession && (
          <QuizshowLiveSessionPanel
            slug={slug}
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
          isAdultsEvent={data.isAdultsEvent}
          problems={problems}
          openTarget={openTarget}
          onOpen={setOpenTarget}
        />
      </div>
      <QuizshowSaveBar
        isVisible={isUnsaved}
        isSaving={saving.isSaving}
        isSaveBlocked={isSaveBlocked}
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
