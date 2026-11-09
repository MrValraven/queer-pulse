import type { ReactNode } from "react";
import { Collapse } from "../../../shared/components/ui";
import type { QuizshowPlayerState } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowLeaderboard } from "../stage/QuizshowLeaderboard";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import styles from "./QuizshowPlayer.module.css";
import { QuizshowJokerButton } from "./QuizshowJokerButton";
import { QuizshowJokerWheelHint } from "./QuizshowJokerWheelHint";
import { QuizshowPhoneWheelBonus } from "./QuizshowPhoneWheelBonus";
import { lobbyJokerTargetOf } from "./quizshowJokerTarget";
import { phoneScoresOf } from "./quizshowPhoneScores";
import { entrantTotalOf } from "./quizshowRevealOutcome";

/**
 * The phone's scores and leaderboard: the wheel bonus moment on top (it folds
 * in when a bonus was awarded), then the player's place, then the table.
 */
export function QuizshowPlayerScores({
  player,
  controller,
}: {
  player: QuizshowPlayerState;
  controller: QuizshowSessionController;
}): ReactNode {
  const { t, language } = useTranslation();
  const { myScores } = player;
  // The top ten, plus the viewer's own row when they rank below it.
  const scores = phoneScoresOf(player);
  // On a leaderboard the joker can be played for the round or wheel up next.
  const jokerTarget = lobbyJokerTargetOf(player);
  return (
    <>
      <QuizshowPhoneWheelBonus
        bonus={player.wheelBonus}
        rounds={player.rounds}
        me={player.me}
        playMode={player.playMode}
        language={language}
      />
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
      <Collapse isOpen={jokerTarget.kind === "round"}>
        {jokerTarget.kind === "round" && (
          <QuizshowJokerButton
            controller={controller}
            roundIndex={jokerTarget.round.roundIndex}
          />
        )}
      </Collapse>
      <QuizshowJokerWheelHint
        isOpen={
          jokerTarget.kind === "wheel" && player.me?.hasUsedJoker === false
        }
      />
    </>
  );
}
