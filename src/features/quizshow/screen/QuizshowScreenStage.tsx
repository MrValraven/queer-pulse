import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  I18nContext,
  type I18nContextValue,
} from "../../../app/providers/i18nContext";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse, Spinner } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_OPEN_SESSION_STATUSES,
  type QuizshowGivingLink,
  type QuizshowLanguage,
  type QuizshowNextEvent,
  type QuizshowScreenState,
  type QuizshowSessionEnd,
} from "../../../shared/contracts/quizshow";
import { isQuizRoundKind } from "../quizshowWheel";
import {
  isScreenState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { QuizshowLeaderboard } from "../stage/QuizshowLeaderboard";
import { QuizshowPausedNote } from "../stage/QuizshowPausedNote";
import { QuizshowPodium } from "../stage/QuizshowPodium";
import { QuizshowPracticeBadge } from "../stage/QuizshowPracticeBadge";
import { QuizshowRoundCard } from "../stage/QuizshowRoundCard";
import { primaryLanguageOf } from "../stage/quizshowText";
import {
  EmphasisText,
  QuizshowScreenJoinChip,
  StageReadingProvider,
  StageScreenLanguageProvider,
} from "./QuizshowScreenChrome";
import { QuizshowScreenLobby } from "./QuizshowScreenLobby";
import { QuizshowScreenParty } from "./QuizshowScreenParty";
import { QuizshowScreenQuestion } from "./QuizshowScreenQuestion";
import { QuizshowScreenWheel } from "./QuizshowScreenWheel";
import { QuizshowScreenWheelBonus } from "./QuizshowScreenWheelBonus";
import { SCREEN_EASE } from "./quizshowScreenMotion";
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
 * its catalog loads). Null keeps the site language. Under screen language
 * Both the caller passes the lead language (`primaryLanguageOf`, EN): UI copy
 * reads in it, while quiz texts show both lines through QuizshowStageText.
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
  giving,
}: {
  isAbandoned: boolean;
  nextEvent: QuizshowNextEvent | null;
  /** The event's community takes gifts (item 66): a text line, since nobody taps a TV. */
  giving: QuizshowGivingLink | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <div className={styles.thanks}>
      <div className={styles.thanksCard}>
        <h1 className={styles.thanksTitle}>
          {isAbandoned ? (
            t("quizshow:stage.abandoned")
          ) : (
            <EmphasisText i18nKey="quizshow:stage.thanksTitleEm" />
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
        {giving !== null && (
          <p className={styles.thanksGiving}>
            {t("quizshow:stage.givingLine", { name: giving.communityName })}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The scores board's heading. After a question it reads "Leaderboard"; at the
 * end of a round it names the round just played by the rounds played so far
 * and how many are left, so the room sees the step from one to the other when
 * the host moves on. A wheel bonus just awarded folds in under the title.
 */
function ScoresBoardTitle({
  session,
  leaderboardTitle,
}: {
  session: QuizshowScreenState;
  leaderboardTitle: string;
}) {
  const { t } = useTranslation();
  const { phase, roundIndex, roundNumber, roundCount } = session.cursor;
  const wheelBonus = (
    <QuizshowScreenWheelBonus
      bonus={session.wheelBonus}
      rounds={session.rounds}
      language={primaryLanguageOf(session.screenLanguage)}
      variant="board"
    />
  );
  if (phase !== "leaderboard" || roundIndex === null) {
    return (
      <>
        <h1 className={styles.boardTitle}>{leaderboardTitle}</h1>
        {wheelBonus}
      </>
    );
  }
  const roundsLeft = Math.max(0, roundCount - roundNumber);
  return (
    <div className={styles.boardHeading}>
      {roundsLeft > 0 && (
        <p className={styles.boardEyebrow}>
          {t("quizshow:stage.roundsToGo", { count: roundsLeft })}
        </p>
      )}
      <h1 className={styles.boardTitle}>
        <EmphasisText
          i18nKey="quizshow:stage.afterRoundEm"
          values={{ number: roundNumber, total: roundCount }}
        />
      </h1>
      {wheelBonus}
    </div>
  );
}

/**
 * The body for this phase, and the key that swaps it: phases of one question
 * share a body, and so do the spins of one wheel, so a new spin never fades
 * the wheel out.
 */
function viewFor(
  session: QuizshowScreenState,
  clockOffsetMs: number,
  size: QuizshowScreenStageSize,
  leaderboardTitle: string,
  isJoinHidden = false,
  isFixedCanvas = false,
  /** The last entrant count the stage saw, kept across phases (the podium reads it). */
  lastEntrantCount: number | null = null,
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
            roundNumber={cursor.roundNumber}
            roundCount={cursor.roundCount}
            language={screenLanguage}
            size={size}
          />
        </div>
      ),
    };
  }
  if (phase === "wheel" && session.wheel !== null) {
    // A spin of null draws the wheel at rest: the studio's wheel slide. The
    // view sizes itself in cqw of the stage, so a fixed canvas needs no prop.
    return {
      viewKey: `wheel-${session.wheel.wheelRoundIndex ?? "unplanned"}`,
      body: (
        <QuizshowScreenWheel
          wheel={session.wheel}
          wheelBonus={session.wheelBonus}
          rounds={session.rounds}
          // Locked: the wheel's bar drops the code and the join chip says so (C6.15).
          joinCode={
            isJoinHidden || session.isJoinLocked ? null : session.joinCode
          }
          language={primaryLanguageOf(screenLanguage)}
          playMode={session.playMode}
          clockOffsetMs={clockOffsetMs}
          size={size}
        />
      ),
    };
  }
  if (question !== null) {
    const isPartyQuestion =
      question.roundKind !== "wheel" && !isQuizRoundKind(question.roundKind);
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
            isFixedCanvas={isFixedCanvas}
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
        <div
          className={`${styles.board} ${styles.scoresBoard}`}
          data-scope={phase === "leaderboard" ? "round" : "question"}
        >
          <ScoresBoardTitle
            session={session}
            leaderboardTitle={leaderboardTitle}
          />
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
        <div className={`${styles.board} ${styles.podiumBoard}`}>
          <h1 className={styles.boardTitle}>
            <EmphasisText i18nKey="quizshow:stage.podiumTitleEm" />
          </h1>
          {/* Only the revealed places arrive (C6.7); the podium paces itself from them. */}
          <QuizshowPodium
            entries={session.podium ?? []}
            size={size}
            entrantCount={lastEntrantCount}
          />
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
          giving={session.giving}
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
        giving={sessionEnd.giving}
      />
    ),
  };
}

/** The phases whose chip opens with the QR (item 13). */
const JOIN_CHIP_EXPANDED_PHASES: ReadonlySet<string> = new Set([
  "round_intro",
  "leaderboard",
]);

/**
 * Whether the join chip shows (item 13): every phase after the lobby while
 * the session is open. The wheel's own top bar already carries the join
 * line, so the chip stays out of the wheel unless joining is locked, when it
 * says so there too.
 */
function isJoinChipShown(
  session: QuizshowScreenState,
  isJoinHidden: boolean,
): boolean {
  if (isJoinHidden) return false;
  const { phase, status } = session.cursor;
  const isOpen = (QUIZSHOW_OPEN_SESSION_STATUSES as readonly string[]).includes(
    status,
  );
  if (!isOpen || phase === "lobby" || phase === "ended") return false;
  return phase !== "wheel" || session.isJoinLocked;
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
  // The podium's empty steps read the entrant count; a phase without scores
  // keeps the last one seen for this session (adjusted while rendering,
  // React's derived-state pattern). A new session starts from none.
  const [lastEntrantCountOf, setLastEntrantCountOf] = useState<{
    sessionId: string;
    count: number;
  } | null>(null);
  const sessionId = session?.sessionId ?? null;
  const entrantCount = session?.scores?.entrantCount ?? null;
  if (
    sessionId !== null &&
    entrantCount !== null &&
    (lastEntrantCountOf?.sessionId !== sessionId ||
      lastEntrantCountOf.count !== entrantCount)
  ) {
    setLastEntrantCountOf({ sessionId, count: entrantCount });
  }
  const lastEntrantCount =
    lastEntrantCountOf !== null && lastEntrantCountOf.sessionId === sessionId
      ? lastEntrantCountOf.count
      : null;
  // The reveal of a quiz answer tints the stage toward jade: a still field
  // under the content that fades in and out by opacity alone.
  const isRightAnswerShown =
    session?.cursor.phase === "reveal" &&
    session.reveal !== null &&
    session.reveal.correct !== null;
  const { viewKey, body } =
    session === null
      ? viewWithoutSession(sessionEnd)
      : viewFor(
          session,
          clockOffsetMs,
          size,
          t("quizshow:stage.leaderboard"),
          isJoinHidden,
          isFixedCanvas,
          entrantCount ?? lastEntrantCount,
        );
  const isPractice = session?.isPractice ?? sessionEnd?.isPractice ?? false;
  // The session the chip reads, when the chip shows (item 13).
  const joinChipSession =
    session !== null && isJoinChipShown(session, isJoinHidden) ? session : null;
  // Locked, the chip holds its one line: no QR, so not expanded (C6.15).
  const isJoinChipExpanded =
    joinChipSession !== null &&
    !joinChipSession.isJoinLocked &&
    JOIN_CHIP_EXPANDED_PHASES.has(joinChipSession.cursor.phase);
  let joinChipState: "expanded" | "compact" | undefined;
  if (joinChipSession !== null)
    joinChipState = isJoinChipExpanded ? "expanded" : "compact";
  return (
    <div
      className={`${styles.stage} ${styles[size]}`}
      // Copy on the stage reads in the screen's lead language; each quiz text
      // sets its own `lang` where it differs (item 41).
      lang={
        session === null ? undefined : primaryLanguageOf(session.screenLanguage)
      }
      data-fixed-canvas={isFixedCanvas ? "true" : undefined}
      data-join-chip={joinChipState}
      // The lobby fills the screen: the practice badge leaves the flow there.
      data-view={session?.cursor.phase === "lobby" ? "lobby" : undefined}
      data-practice={isPractice ? "true" : undefined}
    >
      <div
        className={styles.revealGlow}
        data-shown={isRightAnswerShown ? "true" : "false"}
        aria-hidden="true"
      />
      {/* C6.9: a practice session wears the badge in the stage's top corner. */}
      <Collapse isOpen={isPractice} className={styles.practiceCorner}>
        <QuizshowPracticeBadge tone="stage" className={styles.practiceBadge} />
      </Collapse>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={viewKey}
          className={styles.view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.25,
            ease: SCREEN_EASE,
          }}
        >
          {body}
        </m.div>
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {joinChipSession !== null && (
          <m.div
            key="join-chip"
            className={styles.joinChipSlot}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.25,
              ease: SCREEN_EASE,
            }}
          >
            <QuizshowScreenJoinChip
              joinCode={joinChipSession.joinCode}
              isJoinLocked={joinChipSession.isJoinLocked}
              isExpanded={isJoinChipExpanded}
              size={size}
            />
          </m.div>
        )}
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
    <ScreenLanguageScope
      language={
        session === null ? null : primaryLanguageOf(session.screenLanguage)
      }
    >
      <StageScreenLanguageProvider
        screenLanguage={session === null ? null : session.screenLanguage}
      >
        <StageReadingProvider isReading={session?.cursor.phase === "read"}>
          <QuizshowScreenStageBody
            session={session}
            sessionEnd={state.sessionEnd}
            clockOffsetMs={clockOffsetMs}
            size={size}
            isJoinHidden={isJoinHidden}
            isFixedCanvas={isFixedCanvas}
          />
        </StageReadingProvider>
      </StageScreenLanguageProvider>
    </ScreenLanguageScope>
  );
}
