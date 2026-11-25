import type { QuizshowPlayerState } from "../../../shared/contracts/quizshow";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { QuizshowWinToEarn } from "./QuizshowWinToEarn";
import { useQuizshowWinBadgesPreview } from "./useQuizshowWinBadgesPreview";

interface QuizshowLobbyWinToEarnProps {
  /** Only the three fields the gate reads, so a full player state fits. */
  session: Pick<QuizshowPlayerState, "kind" | "eventSlug" | "isPractice">;
}

/**
 * Win to earn in the phone lobby of a real event game. A practice game, a
 * game outside an event, a failed read and an event with no badges all leave
 * it closed. While it folds away the `Collapse` keeps the last block it drew.
 */
export function QuizshowLobbyWinToEarn({
  session,
}: QuizshowLobbyWinToEarnProps) {
  const isEnabled =
    session.kind === "event" &&
    !session.isPractice &&
    session.eventSlug !== null;
  const query = useQuizshowWinBadgesPreview(
    isEnabled ? session.eventSlug : null,
    { isEnabled },
  );
  const preview = query.isError ? null : (query.data?.preview ?? null);
  return (
    <Collapse isOpen={isEnabled && preview !== null}>
      {preview !== null ? (
        <QuizshowWinToEarn preview={preview} tone="phone" />
      ) : null}
    </Collapse>
  );
}
