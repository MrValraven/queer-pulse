/**
 * The triage overlay's answers, wrapped around the desk's own callbacks. Each
 * one ignores a pitch already on its way out, so a double press cannot answer
 * it twice, and the immediate answers (maybe, the bulk pair) tell the queue
 * straight away so the next pitch shows without waiting for a refetch. Pass
 * and commission only open their dialogs; the queue hears about those through
 * `leavingPitchIds`, `answeredPitchIds` or the refetched list.
 */

import type { Pitch } from "../data/desk.data";

export interface UsePitchTriageAnswersParams {
  leavingPitchIds: string[];
  selectedPitchIds: string[];
  /** The queue's `markAnswered`. */
  markAnswered: (pitchIds: string[]) => void;
  onCommission: (pitch: Pitch) => void;
  onMaybe: (pitchId: string) => void;
  onPass: (pitch: Pitch) => void;
  onBulkMaybe: () => void;
  onBulkPass: () => void;
}

export function usePitchTriageAnswers({
  leavingPitchIds,
  selectedPitchIds,
  markAnswered,
  onCommission,
  onMaybe,
  onPass,
  onBulkMaybe,
  onBulkPass,
}: UsePitchTriageAnswersParams) {
  const isLeaving = (pitch: Pitch) => leavingPitchIds.includes(pitch.id);

  function answerMaybe(pitch: Pitch | null): void {
    if (!pitch || isLeaving(pitch)) return;
    markAnswered([pitch.id]);
    onMaybe(pitch.id);
  }
  function answerPass(pitch: Pitch | null): void {
    if (pitch && !isLeaving(pitch)) onPass(pitch);
  }
  function answerCommission(pitch: Pitch): void {
    if (!isLeaving(pitch)) onCommission(pitch);
  }
  function answerSelection(bulkAnswer: () => void): void {
    markAnswered(selectedPitchIds);
    bulkAnswer();
  }

  return {
    isLeaving,
    answerMaybe,
    answerPass,
    answerCommission,
    answerSelectionMaybe: () => answerSelection(onBulkMaybe),
    answerSelectionPass: () => answerSelection(onBulkPass),
  };
}
