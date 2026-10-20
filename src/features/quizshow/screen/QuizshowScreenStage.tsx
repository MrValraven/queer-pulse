import { useMemo, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  I18nContext,
  type I18nContextValue,
} from "../../../app/providers/i18nContext";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Spinner } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowNextEvent,
  QuizshowScreenState,
  QuizshowSessionEnd,
} from "../../../shared/contracts/quizshow";
import {
  isScreenState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { QuizshowLeaderboard } from "../stage/QuizshowLeaderboard";
import { QuizshowPausedNote } from "../stage/QuizshowPausedNote";
import { QuizshowPodium } from "../stage/QuizshowPodium";
import { QuizshowRoundCard } from "../stage/QuizshowRoundCard";
import { QuizshowScreenLobby } from "./QuizshowScreenLobby";
import { QuizshowScreenParty } from "./QuizshowScreenParty";
import { QuizshowScreenQuestion } from "./QuizshowScreenQuestion";
import styles from "./QuizshowScreen.module.css";

/** Where the presenter stage is drawn: the big screen, or the remote's small preview. */
export type QuizshowScreenStageSize = "screen" | "preview";

export interface QuizshowScreenStageProps {
  state: QuizshowClientState;
  clockOffsetMs: number;
  size: QuizshowScreenStageSize;
  /** The builder's try-out: the lobby leaves out the join code, QR and join line. */
  isJoinHidden?: boolean;
  /**
   * Drawn on a fixed 1280x720 canvas scaled into a frame (the remote's
   * preview, Try it): the stage takes its 720p sizes and desktop columns
   * whatever the window. A real screen leaves it off.
   */
  isFixedCanvas?: boolean;
}

/**
 * The stage's copy, numbers and dates in the big screen language: `t` reads
 * that language and falls back to the site's `t` for a key it lacks (or while
 * its catalog loads). Null keeps the site language.
 */
function ScreenLanguageScope({
  language,
  children,
}: {
  language: QuizshowLanguage | null;
  children: ReactNode;
}) {
  const site = useTranslation();
  const { t: siteTranslate, translateIn, setLanguage } = site;
  const value = useMemo<I18nContextValue>(() => {
    if (language === null) {
      return {
        language: site.language,
        setLanguage,
        t: siteTranslate,
        translateIn,
      };
    }
    return {
      language,
      setLanguage,
      translateIn,
      t: (key, options) =>
        translateIn(language, key, options) ?? siteTranslate(key, options),
    };
  }, [language, site.language, setLanguage, siteTranslate, translateIn]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function QuizshowScreenThanks({
  isAbandoned,
  nextEvent,
}: {
  isAbandoned: boolean;
  nextEvent: QuizshowNextEvent | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <div className={styles.thanks}>
      <h1 className={styles.thanksTitle}>
        {t(
          isAbandoned
            ? "quizshow:stage.abandoned"
            : "quizshow:stage.thanksTitle",
        )}
      </h1>
      {nextEvent !== null && (
        <p className={styles.thanksNext}>
          {t("quizshow:stage.nextEvent", {
            event: nextEvent.title,
            date: format.date(new Date(nextEvent.startAt)),
          })}
        </p>
      )}
    </div>
  );
}

/** The body for this phase, and the key that swaps it: phases of one question share a body. */
function viewFor(
  session: QuizshowScreenState,
  clockOffsetMs: number,
  size: QuizshowScreenStageSize,
  titles: { leaderboard: string; podium: string },
  isJoinHidden = false,
  isFixedCanvas = false,
): { viewKey: string; body: ReactNode } {
  const { cursor, question, round, screenLanguage } = session;
  const phase = cursor.phase;
  if (phase === "lobby") {
    return {
      viewKey: "lobby",
      body: (
        <QuizshowScreenLobby
          session={session}
          size={size}
          isJoinHidden={isJoinHidden}
          isFixedCanvas={isFixedCanvas}
        />
      ),
    };
  }
  if (phase === "round_intro" && round !== null) {
    return {
      viewKey: `round-${round.roundIndex}`,
      body: (
        <div className={styles.centred}>
          <QuizshowRoundCard
            round={round}
            roundCount={cursor.roundCount}
            language={screenLanguage}
            size={size}
          />
        </div>
      ),
    };
  }
  if (question !== null) {
    const isPartyQuestion = question.roundKind !== "quiz";
    const isQuizPhase =
      phase === "read" || phase === "open" || phase === "reveal";
    const isPartyPhase =
      phase === "write" ||
      phase === "review" ||
      phase === "vote" ||
      phase === "reveal";
    if (!isPartyQuestion && isQuizPhase) {
      return {
        viewKey: `question-${question.questionId}`,
        body: (
          <QuizshowScreenQuestion
            session={session}
            question={question}
            clockOffsetMs={clockOffsetMs}
            size={size}
          />
        ),
      };
    }
    if (isPartyQuestion && isPartyPhase) {
      return {
        viewKey: `party-${question.questionId}`,
        body: (
          <QuizshowScreenParty
            session={session}
            question={question}
            clockOffsetMs={clockOffsetMs}
            size={size}
          />
        ),
      };
    }
  }
  if (
    (phase === "scores" || phase === "leaderboard") &&
    session.scores !== null
  ) {
    return {
      viewKey: `${phase}-${cursor.phaseId}`,
      body: (
        <div className={`${styles.board} ${styles.scoresBoard}`}>
          <h1 className={styles.boardTitle}>{titles.leaderboard}</h1>
          <QuizshowLeaderboard
            scores={session.scores}
            highlightEntrantId={null}
            size={size}
          />
        </div>
      ),
    };
  }
  if (phase === "podium") {
    return {
      viewKey: "podium",
      body: (
        <div className={styles.board}>
          <h1 className={styles.boardTitle}>{titles.podium}</h1>
          <QuizshowPodium entries={session.podium ?? []} size={size} />
        </div>
      ),
    };
  }
  if (phase === "ended") {
    return {
      viewKey: "ended",
      body: (
        <QuizshowScreenThanks
          isAbandoned={cursor.status === "abandoned"}
          nextEvent={session.nextEvent}
        />
      ),
    };
  }
  return { viewKey: "waiting", body: <StageWaiting /> };
}

function StageWaiting() {
  return (
    <div className={styles.centred}>
      <Spinner />
    </div>
  );
}

/** No session to draw: the thank-you screen when the end arrived first (an attach after it), else a spinner. */
function viewWithoutSession(sessionEnd: QuizshowSessionEnd | null): {
  viewKey: string;
  body: ReactNode;
} {
  if (sessionEnd === null)
    return { viewKey: "waiting", body: <StageWaiting /> };
  return {
    viewKey: "ended",
    body: (
      <QuizshowScreenThanks
        isAbandoned={sessionEnd.status === "abandoned"}
        nextEvent={sessionEnd.nextEvent}
      />
    ),
  };
}

function QuizshowScreenStageBody({
  session,
  sessionEnd,
  clockOffsetMs,
  size,
  isJoinHidden,
  isFixedCanvas,
}: {
  session: QuizshowScreenState | null;
  sessionEnd: QuizshowSessionEnd | null;
  clockOffsetMs: number;
  size: QuizshowScreenStageSize;
  isJoinHidden: boolean;
  isFixedCanvas: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { viewKey, body } =
    session === null
      ? viewWithoutSession(sessionEnd)
      : viewFor(
          session,
          clockOffsetMs,
          size,
          {
            leaderboard: t("quizshow:stage.leaderboard"),
            podium: t("quizshow:stage.podiumTitle"),
          },
          isJoinHidden,
          isFixedCanvas,
        );
  return (
    <div
      className={`${styles.stage} ${styles[size]}`}
      data-fixed-canvas={isFixedCanvas ? "true" : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={viewKey}
          className={styles.view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.25,
            ease: [0.22, 0.68, 0.16, 1],
          }}
        >
          {body}
        </m.div>
      </AnimatePresence>
      {size === "screen" && (
        <QuizshowPausedNote isPaused={session?.cursor.status === "paused"} />
      )}
    </div>
  );
}

/** The big screen's content for the current phase, faded from one body to the next, in the big screen language. */
export function QuizshowScreenStage({
  state,
  clockOffsetMs,
  size,
  isJoinHidden = false,
  isFixedCanvas = false,
}: QuizshowScreenStageProps) {
  const session = isScreenState(state.session) ? state.session : null;
  return (
    <ScreenLanguageScope language={session?.screenLanguage ?? null}>
      <QuizshowScreenStageBody
        session={session}
        sessionEnd={state.sessionEnd}
        clockOffsetMs={clockOffsetMs}
        size={size}
        isJoinHidden={isJoinHidden}
        isFixedCanvas={isFixedCanvas}
      />
    </ScreenLanguageScope>
  );
}
