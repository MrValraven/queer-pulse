import { useParams } from "react-router-dom";
import { useQuizshowGameSession } from "../screen/useQuizshowGameSession";
import { QuizshowRemoteView } from "./QuizshowRemotePage";

/** The host's remote for one game, mounted at `/play/games/:gameId/remote`. */
export function QuizshowGameRemotePage() {
  const params = useParams();
  const hostSession = useQuizshowGameSession(params.gameId);
  return <QuizshowRemoteView hostSession={hostSession} />;
}
