import type { ReactNode } from "react";
import { Collapse } from "../../../shared/components/ui";
import type { QuizshowPlayerState } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowLeaderboard } from "../stage/QuizshowLeaderboard";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import styles from "./QuizshowPlayer.module.css";
import { QuizshowJokerButton } from "./QuizshowJokerButton";
import { QuizshowJokerWheelHint } from "./QuizshowJokerWheelHint";
import { QuizshowPhaseHeading } from "./QuizshowPhaseHeading";
import { QuizshowPhoneWheelBonus } from "./QuizshowPhoneWheelBonus";
import {
  QuizshowPlaceLine,
  QuizshowStandingFacts,
} from "./QuizshowPlayerReveal";
import { lobbyJokerTargetOf } from "./quizshowJokerTarget";
import { phoneScoresOf } from "./quizshowPhoneScores";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";

/**
 * The phone's scores and leaderboard: the wheel bonus moment on top (it folds
 * in when a bonus was awarded), then the player's place with how it moved and
 * the gap to the entrant above (item 14), then the table. The place line is the
 * heading and takes focus once the player's rank is in; until then, and for a
 * player with no rank, a hidden heading carries the phase's own announcement.
 */
export function QuizshowPlayerScores({
  player,
  controller,
}: {
  player: QuizshowPlayerState;
  controller: QuizshowSessionController;
}): ReactNode {
  const { language } = useTranslation();
  const { myScores } = player;
  const hasPlace = myScores !== null;
  const headingRef = useQuizshowHeadingFocus(
    `${player.cursor.phaseId}:${hasPlace ? "place" : "pending"}`,
  );
  // The top ten, plus the viewer's own row when they rank below it.
  const scores = phoneScoresOf(player);
  // On a leaderboard the joker can be played for the round or wheel up next.
  const jokerTarget = lobbyJokerTargetOf(player);
  return (
    <>
      {!hasPlace && (
        <QuizshowPhaseHeading
          headingRef={headingRef}
          phase={player.cursor.phase}
        />
      )}
      <QuizshowPhoneWheelBonus
        bonus={player.wheelBonus}
        rounds={player.rounds}
        me={player.me}
        playMode={player.playMode}
        language={language}
      />
      <Collapse isOpen={hasPlace}>
        {myScores !== null && (
          <h1 ref={headingRef} tabIndex={-1} className={styles.subheading}>
            <QuizshowPlaceLine
              state={player}
              rank={myScores.rank}
              total={scores?.entrantCount}
            />
          </h1>
        )}
      </Collapse>
      <QuizshowStandingFacts
        state={player}
        ownRanks={controller.state.ownRanks}
        rank={myScores?.rank ?? null}
        ownScore={myScores?.score ?? 0}
        variant="list"
      />
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
