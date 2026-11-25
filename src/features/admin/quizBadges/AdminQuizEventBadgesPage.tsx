import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { useToast } from "../../../shared/components/feedback/useToast";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import {
  Button,
  Collapse,
  EmptyState,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import type {
  QuizBadgeDefinitionDTO,
  QuizEventBadgeSetupDTO,
} from "../../../shared/contracts/quizWinBadges";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowPickerFade } from "../../quizshow/builder/QuizshowPickerFade";
import {
  quizWinBadgeErrorText,
  quizWinBadgeReasonOf,
} from "../../quizshow/winBadges/quizWinBadgeErrors";
import { AdminPageHeader } from "../ui";
import { quizBadgesAdminKeys } from "./api/quizBadgesAdminKeys";
import { useQuizBadgeLibrary } from "./api/useQuizBadgeLibrary";
import {
  useQuizEventBadgeSetup,
  useSaveQuizEventBadgeSetup,
} from "./api/useQuizEventBadges";
import { AdminQuizFinishedGames } from "./AdminQuizFinishedGames";
import {
  AdminQuizGameSlotEditor,
  type QuizSlotLibraryStatus,
} from "./AdminQuizGameSlotEditor";
import {
  attachableBadges,
  draftChipsOfGame,
  draftFromSetup,
  hasRemovedFromPlayedGameNumber,
  isDraftChanged,
  knownDefinitionIdsOf,
  QUIZ_EVENT_GAME_NUMBERS,
  saveBodyFromDraft,
  type QuizEventSetupDraft,
} from "./quizEventSetup.model";
import styles from "./AdminQuizEventBadges.module.css";

/** Load refusals that no retry can mend: each shows its own line. */
const MISSING_EVENT_REASONS: readonly string[] = [
  "quiz_badge_event_not_found",
  "quiz_badge_event_has_no_quiz",
];

/**
 * `/admin/quizshow/events/:eventId/badges`: the badges each of the event's
 * first five games gives its winners, and every finished game with its
 * winners and Revoke win.
 */
export function AdminQuizEventBadgesPage() {
  const { t } = useTranslation();
  const { eventId = "" } = useParams<{ eventId: string }>();
  const setupQuery = useQuizEventBadgeSetup(eventId);
  const setup = setupQuery.data;
  // Until the event is read the title names the quiz events it sits under,
  // and a failed read says so.
  const title =
    setup !== undefined
      ? t("quizshow:winBadges.admin.setup.title", { event: setup.event.title })
      : setupQuery.isPending
        ? t("quizshow:winBadges.admin.events.title")
        : t("quizshow:winBadges.admin.setup.loadError");

  return (
    <AdminShell
      title={title}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
        {
          label: t("shared:adminNav.items.quizEvents"),
          to: routes.adminQuizshowEvents,
        },
      ]}
    >
      <FadeIn>
        <Button
          variant="quiet"
          size="sm"
          className={styles.back}
          to={routes.adminQuizshowEvents}
        >
          <FiArrowLeft aria-hidden fill="none" />
          {t("quizshow:winBadges.admin.setup.back")}
        </Button>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.editorial")}
          title={title}
          sub={t("quizshow:winBadges.admin.setup.sub")}
        />
        <Collapse isOpen={setup !== undefined}>
          <p className={styles.nextGame}>
            {t("quizshow:winBadges.admin.setup.nextGame", {
              number: setup?.nextGameNumber ?? 1,
            })}
          </p>
        </Collapse>
      </FadeIn>
      <FadeIn delay={60}>
        <SetupBody eventId={eventId} setupQuery={setupQuery} />
      </FadeIn>
    </AdminShell>
  );
}

function SetupBody({
  eventId,
  setupQuery,
}: {
  eventId: string;
  setupQuery: ReturnType<typeof useQuizEventBadgeSetup>;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const libraryQuery = useQuizBadgeLibrary();
  const setup = setupQuery.data;
  const reason = quizWinBadgeReasonOf(setupQuery.error);
  const isMissing = reason !== null && MISSING_EVENT_REASONS.includes(reason);
  // A failed background refetch keeps the setup already on screen. The
  // pickers wait for the first library read, so a game never flashes the
  // empty library line; a failed library read leaves the pickers empty.
  const bodyState =
    setup !== undefined && !libraryQuery.isPending
      ? "setup"
      : setupQuery.isPending || setup !== undefined
        ? "loading"
        : isMissing
          ? "missing"
          : "error";
  const library = libraryQuery.data?.items ?? [];
  const isLibraryFailed =
    libraryQuery.isError && libraryQuery.data === undefined;
  const libraryStatus: QuizSlotLibraryStatus = isLibraryFailed
    ? "failed"
    : library.some((definition) => !definition.isArchived)
      ? "loaded"
      : "empty";

  return (
    <QuizshowPickerFade stateKey={bodyState}>
      {setup !== undefined && bodyState === "setup" ? (
        <>
          <Collapse isOpen={isLibraryFailed}>
            <LibraryLoadAlert libraryQuery={libraryQuery} />
          </Collapse>
          <SetupEditor
            key={setup.event.id}
            eventId={eventId}
            setup={setup}
            library={library}
            libraryStatus={libraryStatus}
          />
          <AdminQuizFinishedGames
            eventId={eventId}
            games={setup.finishedGames}
          />
        </>
      ) : bodyState === "loading" ? (
        <div className={styles.games} aria-hidden>
          {QUIZ_EVENT_GAME_NUMBERS.map((gameNumber) => (
            <SkeletonLine
              key={gameNumber}
              height={160}
              style={{ borderRadius: "var(--radius-card)" }}
            />
          ))}
        </div>
      ) : bodyState === "missing" ? (
        <EmptyState
          className={styles.panel}
          compact
          headingLevel={2}
          icon={<FiAlertCircle aria-hidden fill="none" />}
          title={quizWinBadgeErrorText(setupQuery.error, t, fmt)}
        />
      ) : (
        <LoadErrorState
          className={styles.panel}
          headingLevel={2}
          title={t("quizshow:winBadges.admin.setup.loadError")}
          description={quizWinBadgeErrorText(setupQuery.error, t, fmt)}
          onRetry={() => void setupQuery.refetch()}
          isRetrying={setupQuery.isFetching}
        />
      )}
    </QuizshowPickerFade>
  );
}

/** The badge library could not be read: the pickers stay empty until a retry works. */
function LibraryLoadAlert({
  libraryQuery,
}: {
  libraryQuery: ReturnType<typeof useQuizBadgeLibrary>;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${styles.refusal} ${styles.libraryAlert}`} role="alert">
      <FiAlertCircle aria-hidden fill="none" className={styles.refusalIcon} />
      <div className={styles.libraryAlertText}>
        <p className={styles.libraryAlertTitle}>
          {t("quizshow:winBadges.admin.library.loadError")}
        </p>
        <p className={styles.libraryAlertCause}>
          {quizWinBadgeErrorText(libraryQuery.error, t, fmt)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        aria-busy={libraryQuery.isFetching || undefined}
        onClick={() => {
          if (!libraryQuery.isFetching) void libraryQuery.refetch();
        }}
      >
        {libraryQuery.isFetching
          ? t("shared:loadError.retryingCta")
          : t("shared:loadError.retryCta")}
      </Button>
    </div>
  );
}

/** The save refusal text stays put while its row folds away. */
interface SaveRefusal {
  text: string;
  isShown: boolean;
}

/**
 * The local draft of the five games and its save, reseeded from each save's
 * answer. The save sends only badges the setup or the library still knows,
 * and a badge deleted elsewhere reseeds the draft from a fresh setup.
 */
function useSetupDraft(
  eventId: string,
  setup: QuizEventBadgeSetupDTO,
  library: readonly QuizBadgeDefinitionDTO[],
) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const saveSetup = useSaveQuizEventBadgeSetup(eventId);
  const [draft, setDraft] = useState<QuizEventSetupDraft>(() =>
    draftFromSetup(setup),
  );
  const [refusal, setRefusal] = useState<SaveRefusal>({
    text: "",
    isShown: false,
  });
  const isChanged = isDraftChanged(draft, setup);

  const changeGame = (
    gameNumber: number,
    nextIdsOf: (ids: readonly string[]) => readonly string[],
  ) =>
    setDraft((previous) => ({
      ...previous,
      [gameNumber]: nextIdsOf(previous[gameNumber] ?? []),
    }));

  // Rereads the setup and the library, so the draft drops the badge that went.
  const reseedFromFreshSetup = async () => {
    await queryClient.invalidateQueries({ queryKey: quizBadgesAdminKeys.root });
    const freshSetup = queryClient.getQueryData<QuizEventBadgeSetupDTO>(
      quizBadgesAdminKeys.eventSetup(eventId, demoMode),
    );
    if (freshSetup !== undefined) setDraft(draftFromSetup(freshSetup));
  };

  const save = async () => {
    if (!isChanged || saveSetup.isPending) return;
    setRefusal((previous) => ({ ...previous, isShown: false }));
    try {
      const result = await saveSetup.mutateAsync(
        saveBodyFromDraft(draft, knownDefinitionIdsOf(setup, library)),
      );
      setDraft(draftFromSetup(result.setup));
      showToast(
        result.awardedWinCount > 0
          ? t("quizshow:winBadges.admin.setup.awardedAfter", {
              count: result.awardedWinCount,
            })
          : t("quizshow:winBadges.admin.setup.saved"),
        "success",
      );
    } catch (error) {
      setRefusal({ text: quizWinBadgeErrorText(error, t, fmt), isShown: true });
      if (quizWinBadgeReasonOf(error) === "quiz_badge_not_found") {
        await reseedFromFreshSetup();
      }
    }
  };

  return {
    draft,
    isChanged,
    isSaving: saveSetup.isPending,
    refusal,
    attach: (gameNumber: number, definitionId: string) =>
      changeGame(gameNumber, (ids) =>
        ids.includes(definitionId) ? ids : [...ids, definitionId],
      ),
    remove: (gameNumber: number, definitionId: string) =>
      changeGame(gameNumber, (ids) => ids.filter((id) => id !== definitionId)),
    save: () => void save(),
  };
}

function SetupEditor({
  eventId,
  setup,
  library,
  libraryStatus,
}: {
  eventId: string;
  setup: QuizEventBadgeSetupDTO;
  library: readonly QuizBadgeDefinitionDTO[];
  libraryStatus: QuizSlotLibraryStatus;
}) {
  const { t } = useTranslation();
  const editor = useSetupDraft(eventId, setup, library);

  return (
    <>
      <div className={styles.games}>
        {QUIZ_EVENT_GAME_NUMBERS.map((gameNumber) => (
          <AdminQuizGameSlotEditor
            key={gameNumber}
            gameNumber={gameNumber}
            badges={draftChipsOfGame(editor.draft, gameNumber, setup, library)}
            isFinished={
              setup.games.find((game) => game.gameNumber === gameNumber)
                ?.isFinished ?? false
            }
            attachable={attachableBadges(library, editor.draft, gameNumber)}
            limit={setup.limits.badgesPerGameMax}
            libraryStatus={libraryStatus}
            hasRemovedFromPlayedGame={hasRemovedFromPlayedGameNumber(
              editor.draft,
              setup,
              gameNumber,
            )}
            onAttach={(definitionId) => editor.attach(gameNumber, definitionId)}
            onRemove={(definitionId) => editor.remove(gameNumber, definitionId)}
          />
        ))}
      </div>
      <div className={styles.saveBar}>
        <Collapse isOpen={editor.refusal.isShown}>
          <p className={styles.refusal} role="alert">
            <FiAlertCircle
              aria-hidden
              fill="none"
              className={styles.refusalIcon}
            />
            {editor.refusal.text}
          </p>
        </Collapse>
        <Button
          variant="primary"
          disabled={!editor.isChanged}
          aria-busy={editor.isSaving || undefined}
          onClick={editor.save}
        >
          {t("quizshow:winBadges.admin.setup.save")}
        </Button>
      </div>
    </>
  );
}
