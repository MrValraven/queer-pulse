import { useState } from "react";
import type { QuizshowQuizResponse } from "../../../shared/contracts/quizshow";
import type { QuizshowScope } from "../quizshowScope";
import type { QuizshowDraft } from "./quizshowDraft";

/** The 1-based numbers of the rounds that carry the adults label. */
export function adultsRoundNumbersOf(draft: QuizshowDraft): number[] {
  return draft.rounds.flatMap((round, roundIndex) =>
    round.contentLabel === "adults" ? [roundIndex + 1] : [],
  );
}

/**
 * A game's 18+ switch as part of the draft. It starts at the saved flag and
 * follows the response on a discard, a save, an import and Load their
 * version. An event
 * reads its flag from the event's own details, so it has nothing to draft.
 */
export function useQuizshowAdultsDraft(options: {
  scope: QuizshowScope;
  data: QuizshowQuizResponse;
  draft: QuizshowDraft;
}) {
  const { scope, data, draft } = options;
  const isGame = scope.kind === "game";
  // `baseline` is the saved flag the draft last started from.
  const [adultsState, setAdultsState] = useState({
    draft: data.isAdultsEvent,
    baseline: data.isAdultsEvent,
  });
  // A newer saved switch (another tab or device) replaces a clean draft,
  // the way useQuizshowDraft adopts a newer quiz; an edited draft stays.
  if (
    data.isAdultsEvent !== adultsState.baseline &&
    adultsState.draft === adultsState.baseline
  ) {
    setAdultsState({ draft: data.isAdultsEvent, baseline: data.isAdultsEvent });
  }
  const isAdultsOnlyDraft = adultsState.draft;
  return {
    /** What the builder reads as "18+": the draft on a game, the event's flag on an event. */
    isAdultsEvent: isGame ? isAdultsOnlyDraft : data.isAdultsEvent,
    /** The save body's switch, null on an event. */
    isAdultsOnlyToSave: isGame ? isAdultsOnlyDraft : null,
    isUnsaved: isGame && isAdultsOnlyDraft !== data.isAdultsEvent,
    adultsRoundNumbers: adultsRoundNumbersOf(draft),
    setIsAdultsOnly: (isOn: boolean) => {
      setAdultsState((current) => ({ ...current, draft: isOn }));
    },
    resetTo: (response: QuizshowQuizResponse | null) => {
      const savedFlag = (response ?? data).isAdultsEvent;
      setAdultsState({ draft: savedFlag, baseline: savedFlag });
    },
  };
}
