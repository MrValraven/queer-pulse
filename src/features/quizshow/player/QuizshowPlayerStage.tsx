import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { Collapse } from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowPhase,
  type QuizshowPlayerState,
  type QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { useNow } from "../../gatherings/checkin/useNow";
import { isPlayerState } from "../realtime/quizshowClientStore";
import { serverNow } from "../realtime/quizshowClock";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowPausedNote } from "../stage/QuizshowPausedNote";
import { QuizshowPodium } from "../stage/QuizshowPodium";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import { useQuizshowCountdown } from "../stage/useQuizshowCountdown";
import { wheelBonusAwardCopy, wheelTitleOf } from "../stage/quizshowWheelCopy";
import { isMyWheelBonus } from "../stage/quizshowWheelView";
import { isQuizRoundKind, isWheelRoundKind } from "../quizshowWheel";
import styles from "./QuizshowPlayer.module.css";
import { QuizshowLeaveGame } from "./QuizshowLeaveGame";
import { QuizshowWaitDots } from "./QuizshowLockedPanel";
import { QuizshowPartyReveal } from "./QuizshowPartyReveal";
import { QuizshowPhaseHeading } from "./QuizshowPhaseHeading";
import { QuizshowPlayerParty } from "./QuizshowPlayerParty";
import {
  QuizshowPlayerQuestion,
  QuizshowQuestionPicture,
} from "./QuizshowPlayerQuestion";
import {
  QuizshowPlaceLine,
  QuizshowPlayerReveal,
} from "./QuizshowPlayerReveal";
import { QuizshowPlayerRoundIntro } from "./QuizshowPlayerRoundIntro";
import { QuizshowPlayerScores } from "./QuizshowPlayerScores";
import { QuizshowPlayerWheel } from "./QuizshowPlayerWheel";
import { QuizshowReactionBar } from "./QuizshowReactionBar";
import { QuizshowReportGameButton } from "./QuizshowReportGameButton";
import { outcomeKeyOf } from "./quizshowRevealOutcome";
import { isVibrationOn, vibrateForReveal } from "./quizshowVibrate";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";

const ANNOUNCED_PHASES: readonly QuizshowPhase[] = [
  "round_intro",
  "wheel",
  "read",
  "open",
  "write",
  "review",
  "vote",
  "reveal",
  "scores",
  "leaderboard",
  "podium",
];

const REPORTABLE_PHASES: readonly QuizshowPhase[] = [
  "read",
  "open",
  "write",
  "review",
  "vote",
  "reveal",
];

/**
 * Buzzes once per reveal phase, once the player's own result is in, while
 * this device keeps vibration on (item 43). Reduced motion has no say: the
 * "Vibration" switch is its own preference.
 */
function useRevealVibration(
  phaseId: string,
  isRevealResultIn: boolean,
  isCorrect: boolean | null,
) {
  const vibratedPhaseIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isRevealResultIn || !isVibrationOn()) return;
    if (vibratedPhaseIdRef.current === phaseId) return;
    vibratedPhaseIdRef.current = phaseId;
    vibrateForReveal(isCorrect);
  }, [phaseId, isRevealResultIn, isCorrect]);
}

const TALK_CLOCK_REFRESH_MS = 250;

/** "Get ready" with the breathing dots, while the phone waits for what comes next. */
function ReadyPill() {
  const { t } = useTranslation();
  return (
    <p className={styles.readyPill}>
      {t("quizshow:player.getReady")}
      <QuizshowWaitDots />
    </p>
  );
}

/**
 * Talk it over (C6.20), mounted only in teams play with `cursor.talkStartsAt`
 * set, so no clock runs otherwise. It opens once the server clock passes the
 * talk start and shows the seconds left until `read` ends. While paused the
 * talk start has not moved yet, so the frozen remainder decides: it is talk
 * time when no more than the round's talk seconds were left. The "Get ready"
 * pill folds away while the talk runs, so the phone asks one thing at a time.
 */
function TalkLine({
  player,
  talkStartsAt,
  clockOffsetMs,
}: {
  player: QuizshowPlayerState;
  talkStartsAt: number;
  clockOffsetMs: number;
}) {
  const { t } = useTranslation();
  const { cursor } = player;
  const clientNow = useNow(TALK_CLOCK_REFRESH_MS).getTime();
  const countdown = useQuizshowCountdown(cursor, clockOffsetMs, {
    hasExtraTime: false,
  });
  const talkMs = (player.round?.talkSeconds ?? 0) * 1000;
  const isTalkTime =
    cursor.status === "paused"
      ? cursor.pausedRemainingMs !== null && cursor.pausedRemainingMs <= talkMs
      : serverNow(clientNow, clockOffsetMs) >= talkStartsAt;
  const secondsLeft =
    countdown.remainingMs === null
      ? null
      : Math.max(0, Math.ceil(countdown.remainingMs / 1000));
  return (
    <>
      <Collapse isOpen={isTalkTime}>
        <p className={styles.talkLine}>
          <span className={styles.talkTitle}>
            {t("quizshow:player.talkItOver")}
          </span>
          {secondsLeft !== null && (
            <span className={styles.talkSeconds}>
              {t("quizshow:stage.secondsLeft", { count: secondsLeft })}
            </span>
          )}
        </p>
      </Collapse>
      {/* Inline content of the fold's flow-root panel: the read body's
          centred text keeps the pill in the middle. */}
      <Collapse isOpen={!isTalkTime}>
        <ReadyPill />
      </Collapse>
    </>
  );
}

/** The question as it is read out, before answers open; the heading takes focus. The picture
 *  shows here too, on the TV's slow reveal window (C6.23). */
function ReadBody({
  question,
  language,
  player,
  clockOffsetMs,
}: {
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
  player: QuizshowPlayerState;
  clockOffsetMs: number;
}) {
  const headingRef = useQuizshowHeadingFocus(player.cursor.phaseId);
  const { talkStartsAt } = player.cursor;
  return (
    <div className={`${styles.screenBody} ${styles.readBody}`}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        <QuizshowStageText text={question.prompt} language={language} />
      </h1>
      {question.mediaUrl !== null && (
        <QuizshowQuestionPicture
          question={question}
          mediaUrl={question.mediaUrl}
          cursor={player.cursor}
          talkSeconds={player.round?.talkSeconds ?? 0}
          language={language}
          clockOffsetMs={clockOffsetMs}
        />
      )}
      {player.playMode === "teams" && talkStartsAt !== null ? (
        <TalkLine
          player={player}
          talkStartsAt={talkStartsAt}
          clockOffsetMs={clockOffsetMs}
        />
      ) : (
        <ReadyPill />
      )}
    </div>
  );
}

/** What the award sounds like: the winner's own line and detail, or the award sentence. */
function wheelBonusLineOf(
  player: QuizshowPlayerState,
  language: QuizshowLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  const { wheelBonus } = player;
  if (wheelBonus === null) return "";
  if (!isMyWheelBonus(wheelBonus, player.me, player.playMode)) {
    const award = wheelBonusAwardCopy(wheelBonus, player.rounds, language, t);
    return t(award.key, award.values);
  }
  const mineKey =
    player.playMode === "teams"
      ? "quizshow:player.wheel.bonusMineTeam"
      : "quizshow:player.wheel.bonusMine";
  const detail = t("quizshow:player.wheel.bonusMineDetail", {
    points: wheelBonus.points,
    title: wheelTitleOf(
      wheelBonus.sliceTitle,
      wheelBonus.sliceRoundIndex,
      player.rounds,
      language,
      t,
    ),
  });
  return `${t(mineKey)}. ${detail}`;
}

/**
 * What swaps the phone's body. The wheel keeps one key per wheel step, so a
 * spin again does not remount it; the podium has its own key while it is still
 * on its way, so it fades in over the wait.
 */
function bodyKeyOf(
  phase: QuizshowPhase,
  phaseId: string,
  player: QuizshowPlayerState,
): string {
  if (phase === "wheel") {
    return `wheel:${player.wheel?.wheelRoundIndex ?? "unplanned"}`;
  }
  // Each podium step is a new phase id (C6.7); one body holds them all, so
  // the podium stays mounted and paces itself, winner hold included.
  if (phase === "podium") {
    return player.podium === null ? `${phaseId}:waiting` : "podium";
  }
  return phaseId;
}

/** The last place the podium stands for: 3rd (C6.7). */
const PODIUM_LOWEST_PLACE = 3;

/**
 * The beat before the player's own win (C6.7): the same `podiumWinnerHoldMs`
 * the podium holds on "And the winner is", from the same mount, so the line
 * never names the winner ahead of the podium. Mounted with the win already in
 * (a reload), it shows at once.
 */
function useOwnWinnerHold(isOwnWin: boolean): boolean {
  const [isHoldDone, setIsHoldDone] = useState(isOwnWin);
  const isHolding = isOwnWin && !isHoldDone;
  useEffect(() => {
    if (!isHolding) return undefined;
    const timer = window.setTimeout(() => {
      setIsHoldDone(true);
    }, QUIZSHOW_LIMITS.podiumWinnerHoldMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isHolding]);
  return isHolding;
}

/**
 * The podium on the phone (C6.7): the revealed places only, as the podium
 * frame sends them, and the player's own place once it is shown. A place on
 * the podium reads from the revealed entries; a place below it from
 * `scores:mine`, which the server holds back while the player's step waits.
 */
function PodiumBody({ player }: { player: QuizshowPlayerState }) {
  const { podium, myScores, me, cursor } = player;
  const ownEntrantId =
    player.playMode === "teams" ? (me?.teamId ?? null) : (me?.playerId ?? null);
  const podiumPlace =
    podium?.find((entry) => entry.entrantId === ownEntrantId)?.place ?? null;
  const scoresRank =
    myScores !== null && myScores.phaseId === cursor.phaseId
      ? myScores.rank
      : null;
  // Each step is a new phase id, which clears `myScores` until the step's own
  // `scores:mine` lands: the last rank holds through that gap.
  const [heldRank, setHeldRank] = useState(scoresRank);
  if (scoresRank !== null && scoresRank !== heldRank) setHeldRank(scoresRank);
  const belowPodiumRank =
    heldRank !== null && heldRank > PODIUM_LOWEST_PLACE ? heldRank : null;
  const isOwnWinnerHold = useOwnWinnerHold(podiumPlace === 1);
  const ownRank = isOwnWinnerHold ? null : (podiumPlace ?? belowPodiumRank);
  // One body holds every podium step, so focus moves once, when the podium lands.
  const headingRef = useQuizshowHeadingFocus("podium");
  return (
    <div className={styles.podiumBody}>
      <QuizshowPhaseHeading headingRef={headingRef} phase="podium" />
      <QuizshowPodium
        entries={podium ?? []}
        size="phone"
        entrantCount={player.scores?.entrantCount ?? null}
        highlightEntrantId={ownEntrantId}
      />
      <Collapse isOpen={ownRank !== null} className={styles.podiumPlaceRow}>
        {ownRank !== null && (
          <p className={styles.podiumPlace}>
            <QuizshowPlaceLine
              state={player}
              rank={ownRank}
              total={player.scores?.entrantCount}
            />
          </p>
        )}
      </Collapse>
    </div>
  );
}

/** The foot of the running game: reactions between questions (C6.19), the
 *  report link on a member's game, and "Leave the game" (item 35). */
function StageFooter({
  controller,
  player,
}: {
  controller: QuizshowSessionController;
  player: QuizshowPlayerState;
}) {
  const isReportShown =
    player.kind === "game" &&
    player.me !== null &&
    REPORTABLE_PHASES.includes(player.cursor.phase);
  return (
    <>
      <QuizshowReactionBar controller={controller} />
      <Collapse isOpen={isReportShown} className={styles.reportRow}>
        <QuizshowReportGameButton
          sessionId={player.sessionId}
          quizTitle={player.quizTitle}
        />
      </Collapse>
      <Collapse isOpen={player.me !== null}>
        <QuizshowLeaveGame controller={controller} />
      </Collapse>
    </>
  );
}

/** The player's phone, swapped by phase. */
export function QuizshowPlayerStage({
  controller,
}: {
  controller: QuizshowSessionController;
}) {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { session } = controller.state;
  const player = isPlayerState(session) ? session : null;
  const phase = player?.cursor.phase ?? null;
  const phaseId = player?.cursor.phaseId ?? "";
  const myReveal = player?.myReveal ?? null;
  const isRevealResultIn =
    phase === "reveal" && myReveal !== null && myReveal.phaseId === phaseId;
  useRevealVibration(phaseId, isRevealResultIn, myReveal?.isCorrect ?? null);
  if (player === null || phase === null) return null;

  const { question, round } = player;
  // A wheel step holds no questions; every other non-quiz kind is a party round.
  const isParty =
    question !== null &&
    !isQuizRoundKind(question.roundKind) &&
    !isWheelRoundKind(question.roundKind);
  const isPaused = player.cursor.status === "paused";
  // A poll has no right or wrong, so its reveal says no outcome (C6.22).
  const outcomeKey =
    isRevealResultIn && myReveal && question?.type !== "poll"
      ? outcomeKeyOf(myReveal)
      : null;
  let phaseLine = ANNOUNCED_PHASES.includes(phase)
    ? t(`quizshow:player.announce.${phase}`)
    : "";
  // While paused the region says so; on resume the phase line comes back and is read again.
  if (isPaused) phaseLine = t("quizshow:stage.paused");
  // The bonus panel on the scores body mounts already filled, so its own status
  // region would stay silent: the stage's region says the award instead.
  const bonusLine =
    phase === "scores" || phase === "leaderboard"
      ? wheelBonusLineOf(player, language, t)
      : "";
  const announcement = [
    phaseLine,
    outcomeKey === null ? "" : t(outcomeKey),
    bonusLine,
  ]
    .filter(Boolean)
    .join(". ");

  let body: ReactNode = null;
  if (phase === "round_intro" && round !== null) {
    body = (
      <QuizshowPlayerRoundIntro
        controller={controller}
        player={player}
        round={round}
        language={language}
      />
    );
  } else if (phase === "read" && question !== null) {
    body = (
      <ReadBody
        question={question}
        language={language}
        player={player}
        clockOffsetMs={controller.clockOffsetMs}
      />
    );
  } else if (phase === "open" && question !== null) {
    body = (
      <QuizshowPlayerQuestion
        controller={controller}
        question={question}
        language={language}
      />
    );
  } else if (
    (phase === "write" || phase === "review" || phase === "vote") &&
    question !== null
  ) {
    body = (
      <QuizshowPlayerParty
        controller={controller}
        question={question}
        language={language}
      />
    );
  } else if (phase === "reveal") {
    body = isParty ? (
      <QuizshowPartyReveal state={player} language={language} />
    ) : (
      <QuizshowPlayerReveal
        state={player}
        ownRanks={controller.state.ownRanks}
      />
    );
  } else if (phase === "scores" || phase === "leaderboard") {
    body = <QuizshowPlayerScores player={player} controller={controller} />;
  } else if (phase === "wheel" && player.wheel !== null) {
    body = (
      <QuizshowPlayerWheel
        wheel={player.wheel}
        wheelBonus={player.wheelBonus}
        rounds={player.rounds}
        me={player.me}
        playMode={player.playMode}
        language={language}
        clockOffsetMs={controller.clockOffsetMs}
        phaseId={phaseId}
      />
    );
  } else if (phase === "podium") {
    // The podium frame can land a moment after the phase change.
    body =
      player.podium === null ? <ReadyPill /> : <PodiumBody player={player} />;
  }

  const bodyKey = bodyKeyOf(phase, phaseId, player);
  return (
    <div className={styles.stage}>
      <span role="status" className={styles.visuallyHidden}>
        {announcement}
      </span>
      <QuizshowPausedNote isPaused={isPaused} />
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={bodyKey}
          className={styles.screenBody}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.15 }}
        >
          {body}
        </m.div>
      </AnimatePresence>
      <StageFooter controller={controller} player={player} />
    </div>
  );
}
