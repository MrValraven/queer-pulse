import type {
  QuizshowLanguage,
  QuizshowPlayerState,
  QuizshowRoundCard,
} from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRoundCard as QuizshowRoundCardView } from "../stage/QuizshowRoundCard";
import { QuizshowJokerButton } from "./QuizshowJokerButton";
import { QuizshowPhaseHeading } from "./QuizshowPhaseHeading";
import { lobbyJokerTargetOf } from "./quizshowJokerTarget";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";

/** The round intro on the phone: the round card and, while a joker can still go on the round, its
 *  button. The phase's own heading takes focus, so a new round lands on its card. */
export function QuizshowPlayerRoundIntro({
  controller,
  player,
  round,
  language,
}: {
  controller: QuizshowSessionController;
  player: QuizshowPlayerState;
  round: QuizshowRoundCard;
  language: QuizshowLanguage;
}) {
  const headingRef = useQuizshowHeadingFocus(player.cursor.phaseId);
  const jokerTarget = lobbyJokerTargetOf(player);
  return (
    <>
      <QuizshowPhaseHeading headingRef={headingRef} phase="round_intro" />
      <QuizshowRoundCardView
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
}
