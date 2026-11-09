import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { Collapse } from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowPhase,
  QuizshowPlayerState,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowPausedNote } from "../stage/QuizshowPausedNote";
import { QuizshowPodium } from "../stage/QuizshowPodium";
import { QuizshowRoundCard } from "../stage/QuizshowRoundCard";
import { pickQuizshowText } from "../stage/quizshowText";
import { wheelBonusAwardCopy, wheelTitleOf } from "../stage/quizshowWheelCopy";
import { isMyWheelBonus } from "../stage/quizshowWheelView";
import { isQuizRoundKind, isWheelRoundKind } from "../quizshowWheel";
import styles from "./QuizshowPlayer.module.css";
import { QuizshowJokerButton } from "./QuizshowJokerButton";
import { QuizshowWaitDots } from "./QuizshowLockedPanel";
import { QuizshowPartyReveal } from "./QuizshowPartyReveal";
import { QuizshowPlayerParty } from "./QuizshowPlayerParty";
import { QuizshowPlayerQuestion } from "./QuizshowPlayerQuestion";
import { QuizshowPlayerReveal } from "./QuizshowPlayerReveal";
import { QuizshowPlayerScores } from "./QuizshowPlayerScores";
import { QuizshowPlayerWheel } from "./QuizshowPlayerWheel";
import { QuizshowReportGameButton } from "./QuizshowReportGameButton";
import { outcomeKeyOf } from "./quizshowRevealOutcome";
import { vibrateForReveal } from "./quizshowVibrate";
import { lobbyJokerTargetOf } from "./quizshowJokerTarget";
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

/** Buzzes once per reveal phase, once the player's own result is in, unless motion is reduced. */
function useRevealVibration(
  phaseId: string,
  isRevealResultIn: boolean,
  isCorrect: boolean | null,
  isReducedMotion: boolean,
) {
  const vibratedPhaseIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isRevealResultIn || isReducedMotion) return;
    if (vibratedPhaseIdRef.current === phaseId) return;
    vibratedPhaseIdRef.current = phaseId;
    vibrateForReveal(isCorrect);
  }, [phaseId, isRevealResultIn, isCorrect, isReducedMotion]);
}

/** The question as it is read out, before answers open; the heading takes focus. */
function ReadBody({
  question,
  language,
  phaseId,
}: {
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
  phaseId: string;
}) {
  const { t } = useTranslation();
  const headingRef = useQuizshowHeadingFocus(phaseId);
  return (
    <div className={`${styles.screenBody} ${styles.readBody}`}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        {pickQuizshowText(question.prompt, language)}
      </h1>
      <p className={styles.readyPill}>
        {t("quizshow:player.getReady")}
        <QuizshowWaitDots />
      </p>
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
  if (phase === "podium" && player.podium === null) return `${phaseId}:waiting`;
  return phaseId;
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
  useRevealVibration(
    phaseId,
    isRevealResultIn,
    myReveal?.isCorrect ?? null,
    reducedMotion,
  );
  if (player === null || phase === null) return null;

  const { question, round } = player;
  // A wheel step holds no questions; every other non-quiz kind is a party round.
  const isParty =
    question !== null &&
    !isQuizRoundKind(question.roundKind) &&
    !isWheelRoundKind(question.roundKind);
  const isPaused = player.cursor.status === "paused";
  const outcomeKey =
    isRevealResultIn && myReveal ? outcomeKeyOf(myReveal) : null;
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
    const jokerTarget = lobbyJokerTargetOf(player);
    body = (
      <>
        <QuizshowRoundCard
          round={round}
          roundNumber={player.cursor.roundNumber}
          roundCount={player.cursor.roundCount}
          language={language}
          size="phone"
        />
        {jokerTarget.kind === "round" && (
          <QuizshowJokerButton
            controller={controller}
            roundIndex={jokerTarget.round.roundIndex}
          />
        )}
      </>
    );
  } else if (phase === "read" && question !== null) {
    body = (
      <ReadBody question={question} language={language} phaseId={phaseId} />
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
      <QuizshowPlayerReveal state={player} />
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
      player.podium === null ? (
        <p className={styles.readyPill}>
          {t("quizshow:player.getReady")}
          <QuizshowWaitDots />
        </p>
      ) : (
        <div className={styles.podiumBody}>
          <QuizshowPodium entries={player.podium} size="phone" />
        </div>
      );
  }

  const bodyKey = bodyKeyOf(phase, phaseId, player);
  const isReportShown =
    player.kind === "game" &&
    player.me !== null &&
    REPORTABLE_PHASES.includes(phase);
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
      <Collapse isOpen={isReportShown} className={styles.reportRow}>
        <QuizshowReportGameButton
          sessionId={player.sessionId}
          quizTitle={player.quizTitle}
        />
      </Collapse>
    </div>
  );
}
