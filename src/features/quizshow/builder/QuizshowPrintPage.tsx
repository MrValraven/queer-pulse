import { AnimatePresence, m } from "motion/react";
import { FiArrowLeft, FiPrinter } from "react-icons/fi";
import { useParams, useSearchParams } from "react-router-dom";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type {
  QuizshowErrorCode,
  QuizshowQuiz,
} from "../../../shared/contracts/quizshow";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button, Spinner } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo";
import { useEvent } from "../../gatherings/api/useEvent";
import {
  gatheringPath,
  gatheringSlugFromParam,
} from "../../gatherings/gatheringPaths";
import {
  isQuizshowEventMissing,
  quizshowErrorCodeOf,
  quizshowErrorKeyOf,
  quizshowLoadFailureKeyOf,
} from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { QUIZSHOW_PRINT_SHEET_PARAM, quizshowGamePath } from "../quizshowPaths";
import { eventScope, gameScope } from "../quizshowScope";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { buildHostSheet, printSheetOf } from "./quizshowPrintModel";
import {
  QuizshowPrintAnswerSheets,
  QuizshowPrintHostSheet,
} from "./QuizshowPrintSheets";
import styles from "./QuizshowPrint.module.css";

/** Where the page's back control goes: the event page or the game page. */
interface QuizshowPrintBack {
  path: string;
  labelKey: "quizshow:screen.backToEvent" | "quizshow:screen.backToGame";
}

/** What the print view needs from the event or game behind the route. */
interface QuizshowPrintAccess {
  isLoading: boolean;
  /** Why the sheets cannot show (a load failure, a refusal, or a viewer outside the organisers); null when they can. */
  messageKey: string | null;
  quiz: QuizshowQuiz | null;
  /** Null while the event or game behind the page is unknown. */
  back: QuizshowPrintBack | null;
}

/** Load failures first, as the screen does: a scope that failed to load has no organiser to check. */
function printMessageKeyOf(failure: {
  errorCode: QuizshowErrorCode | null;
  hasLoadFailed: boolean;
  loadError: unknown;
  isOrganizer: boolean;
}): string | null {
  if (failure.errorCode !== null) return quizshowErrorKeyOf(failure.errorCode);
  if (failure.hasLoadFailed) return quizshowLoadFailureKeyOf(failure.loadError);
  if (!failure.isOrganizer) return "quizshow:errors.not_organiser";
  return null;
}

/** The event behind `:slug`: organisers only (demo: always), its quiz through the quiz read. */
function useEventPrintAccess(
  routeParam: string | undefined,
): QuizshowPrintAccess {
  const { demoMode } = useDemoMode();
  const eventQuery = useEvent(routeParam);
  const gathering = eventQuery.data?.gathering;
  const slug = gathering?.slug ?? gatheringSlugFromParam(routeParam ?? "");
  const isOrganizer = demoMode || gathering?.viewerIsOrganizer === true;
  const quizQuery = useQuizshowQuiz(eventScope(slug), {
    isEnabled: isOrganizer && gathering !== undefined,
  });
  const errorCode =
    quizshowErrorCodeOf(quizQuery.error) ??
    quizshowErrorCodeOf(eventQuery.error) ??
    (isQuizshowEventMissing(eventQuery.error)
      ? "quizshow_event_not_found"
      : null);
  const isLoading =
    eventQuery.isLoading || (isOrganizer && quizQuery.isLoading);
  return {
    isLoading,
    messageKey: isLoading
      ? null
      : printMessageKeyOf({
          errorCode,
          hasLoadFailed: eventQuery.isError || quizQuery.isError,
          loadError: quizQuery.error ?? eventQuery.error ?? undefined,
          isOrganizer,
        }),
    quiz: quizQuery.data?.quiz ?? null,
    back:
      slug === ""
        ? null
        : {
            path: gatheringPath(slug),
            labelKey: "quizshow:screen.backToEvent",
          },
  };
}

/** The game behind `:gameId`: only its owner reads it, so a successful read is the organiser check. */
function useGamePrintAccess(gameId: string | undefined): QuizshowPrintAccess {
  const { demoMode } = useDemoMode();
  const gameQuery = useQuizshowQuiz(gameScope(gameId ?? ""), {
    isEnabled: gameId !== undefined,
  });
  const errorCode =
    gameId === undefined
      ? "quizshow_game_not_found"
      : quizshowErrorCodeOf(gameQuery.error);
  const isLoading = gameId !== undefined && gameQuery.isLoading;
  return {
    isLoading,
    messageKey: isLoading
      ? null
      : printMessageKeyOf({
          errorCode,
          hasLoadFailed: gameQuery.isError,
          loadError: gameQuery.error,
          isOrganizer: demoMode || gameQuery.isSuccess,
        }),
    quiz: gameQuery.data?.quiz ?? null,
    back:
      gameId === undefined || gameId === ""
        ? null
        : {
            path: quizshowGamePath(gameId),
            labelKey: "quizshow:screen.backToGame",
          },
  };
}

/** A state with nothing to print: its reason as the page heading and the way back. */
function QuizshowPrintMessage({
  messageKey,
  back,
}: {
  messageKey: string;
  back: QuizshowPrintBack | null;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.messageState}>
      <h1 className={styles.message}>{t(messageKey)}</h1>
      {back !== null && (
        <Button variant="ghost" to={back.path}>
          {t(back.labelKey)}
        </Button>
      )}
    </div>
  );
}

/** The quiz's message key when it holds nothing to print; null when it does. */
function emptyQuizKeyOf(quiz: QuizshowQuiz | null): string | null {
  if (quiz === null || quiz.rounds.length === 0)
    return "quizshow:builder.empty.title";
  return buildHostSheet(quiz).length === 0
    ? "quizshow:print.noQuestions"
    : null;
}

function QuizshowPrintBody({ access }: { access: QuizshowPrintAccess }) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sheet = printSheetOf(searchParams.get(QUIZSHOW_PRINT_SHEET_PARAM));
  const { quiz, back } = access;

  if (access.isLoading) {
    return (
      <div className={styles.spinnerSlot}>
        <Spinner />
      </div>
    );
  }
  const messageKey = access.messageKey ?? emptyQuizKeyOf(quiz);
  if (messageKey !== null || quiz === null) {
    return (
      <QuizshowPrintMessage
        messageKey={messageKey ?? "quizshow:builder.empty.title"}
        back={back}
      />
    );
  }
  return (
    <>
      <div className={styles.toolbar}>
        {back !== null && (
          <Button variant="ghost" size="sm" to={back.path}>
            <FiArrowLeft aria-hidden="true" />
            {t(back.labelKey)}
          </Button>
        )}
        <p className={styles.toolbarTitle}>
          {t(
            sheet === "host"
              ? "quizshow:print.hostTitle"
              : "quizshow:print.answersTitle",
          )}
        </p>
        <Button variant="primary" onClick={() => window.print()}>
          <FiPrinter aria-hidden="true" />
          {t("quizshow:print.print")}
        </Button>
      </div>
      {sheet === "host" ? (
        <QuizshowPrintHostSheet quiz={quiz} />
      ) : (
        <QuizshowPrintAnswerSheets quiz={quiz} />
      )}
    </>
  );
}

/**
 * The printable sheets of an event or a game (item 62): `?sheet=host` (the
 * default) lists every question with its answer, `?sheet=answers` gives each
 * team one page per round. Frameless and organisers only; the toolbar is
 * left off the paper. `data-print-root` lets the shared print sheets
 * (cards, tools) keep this page; QuizshowPrint.module.css undoes their
 * layout for it.
 */
function QuizshowPrintView({ access }: { access: QuizshowPrintAccess }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  useQuizshowFramelessPage();
  let viewKey = "sheets";
  if (access.isLoading) viewKey = "loading";
  else if (access.messageKey !== null) viewKey = `message-${access.messageKey}`;

  return (
    <div
      className={styles.page}
      data-theme="light"
      data-quizshow-print=""
      data-print-root=""
    >
      <PageMeta title={t("quizshow:print.metaTitle")} noIndex />
      <AnimatePresence mode="wait" initial={false}>
        <m.main
          key={viewKey}
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className={styles.main}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <QuizshowPrintBody access={access} />
        </m.main>
      </AnimatePresence>
    </div>
  );
}

/** The event's sheets at `/gatherings/:slug/quizshow/print`. */
export function QuizshowEventPrintPage() {
  const { slug } = useParams<{ slug: string }>();
  const access = useEventPrintAccess(slug);
  return <QuizshowPrintView access={access} />;
}

/** The game's sheets at `/play/games/:gameId/print`. */
export function QuizshowGamePrintPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const access = useGamePrintAccess(gameId);
  return <QuizshowPrintView access={access} />;
}
