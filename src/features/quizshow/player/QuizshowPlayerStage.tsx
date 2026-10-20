import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { Collapse } from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowPhase,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowLeaderboard } from "../stage/QuizshowLeaderboard";
import { QuizshowPausedNote } from "../stage/QuizshowPausedNote";
import { QuizshowPodium } from "../stage/QuizshowPodium";
import { QuizshowRoundCard } from "../stage/QuizshowRoundCard";
import { pickQuizshowText } from "../stage/quizshowText";
import styles from "./QuizshowPlayer.module.css";
import { QuizshowJokerButton } from "./QuizshowJokerButton";
import { QuizshowPartyReveal } from "./QuizshowPartyReveal";
import { QuizshowPlayerParty } from "./QuizshowPlayerParty";
import { QuizshowPlayerQuestion } from "./QuizshowPlayerQuestion";
import { QuizshowPlayerReveal } from "./QuizshowPlayerReveal";
import { phoneScoresOf } from "./quizshowPhoneScores";
import { entrantTotalOf, outcomeKeyOf } from "./quizshowRevealOutcome";
import { vibrateForReveal } from "./quizshowVibrate";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";

const ANNOUNCED_PHASES: readonly QuizshowPhase[] = [
  "round_intro",
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
    <>
      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        {pickQuizshowText(question.prompt, language)}
      </h1>
      <p className={styles.note}>{t("quizshow:player.getReady")}</p>
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
  useRevealVibration(
    phaseId,
    isRevealResultIn,
    myReveal?.isCorrect ?? null,
    reducedMotion,
  );
  if (player === null || phase === null) return null;

  const { question, round } = player;
  const isParty = question !== null && question.roundKind !== "quiz";
  const isPaused = player.cursor.status === "paused";
  const outcomeKey =
    isRevealResultIn && myReveal ? outcomeKeyOf(myReveal) : null;
  let phaseLine = ANNOUNCED_PHASES.includes(phase)
    ? t(`quizshow:player.announce.${phase}`)
    : "";
  // While paused the region says so; on resume the phase line comes back and is read again.
  if (isPaused) phaseLine = t("quizshow:stage.paused");
  const announcement = [phaseLine, outcomeKey === null ? "" : t(outcomeKey)]
    .filter(Boolean)
    .join(". ");

  let body: ReactNode = null;
  if (phase === "round_intro" && round !== null) {
    body = (
      <>
        <QuizshowRoundCard
          round={round}
          roundCount={player.cursor.roundCount}
          language={language}
          size="phone"
        />
        {round.isJokerAllowed && (
          <QuizshowJokerButton
            controller={controller}
            roundIndex={round.roundIndex}
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
    const { myScores } = player;
    // The top ten, plus the viewer's own row when they rank below it.
    const scores = phoneScoresOf(player);
    body = (
      <>
        <Collapse isOpen={myScores !== null}>
          {myScores !== null && (
            <h1 className={styles.subheading}>
              {t(
                player.playMode === "teams"
                  ? "quizshow:player.teamPlace"
                  : "quizshow:player.place",
                {
                  place: myScores.rank,
                  total: scores?.entrantCount ?? entrantTotalOf(player),
                },
              )}
            </h1>
          )}
        </Collapse>
        <Collapse isOpen={scores !== null}>
          {scores !== null && (
            <QuizshowLeaderboard
              scores={scores}
              highlightEntrantId={
                player.playMode === "teams"
                  ? (player.me?.teamId ?? null)
                  : (player.me?.playerId ?? null)
              }
              size="phone"
            />
          )}
        </Collapse>
      </>
    );
  } else if (phase === "podium") {
    // The podium frame can land a moment after the phase change.
    body =
      player.podium === null ? (
        <p className={styles.note}>{t("quizshow:player.getReady")}</p>
      ) : (
        <QuizshowPodium entries={player.podium} size="phone" />
      );
  }

  // Its own key while the podium is still on its way, so the podium fades in over the wait.
  const bodyKey =
    phase === "podium" && player.podium === null
      ? `${phaseId}:waiting`
      : phaseId;
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
    </div>
  );
}
