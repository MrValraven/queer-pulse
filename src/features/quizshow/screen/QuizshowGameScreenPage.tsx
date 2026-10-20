import { useParams } from "react-router-dom";
import { QuizshowScreenView } from "./QuizshowScreenPage";
import { useQuizshowGameSession } from "./useQuizshowGameSession";

/** The presenter screen for one game, mounted at `/play/games/:gameId/screen`. */
export function QuizshowGameScreenPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const hostSession = useQuizshowGameSession(gameId);
  return <QuizshowScreenView hostSession={hostSession} />;
}
