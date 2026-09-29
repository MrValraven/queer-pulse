/**
 * The pitch triage overlay's queue and cursor. The overlay has to move on the
 * moment an editor answers a pitch, and the desk's pitch list cannot be
 * trusted to do that alone: demo mode refetches the same static pitches, and
 * a live refetch lands some time after the exit animation ends. So the hook
 * remembers, for as long as the overlay is open, every pitch it has seen
 * answered (marked here directly, seen passing through `leavingPitchIds`, or
 * reported in `answeredPitchIds` by a stacked dialog) and drops it from the
 * queue once its exit animation is over.
 *
 * The cursor follows a pitch by id, and keeps its position as a fallback: when
 * the current pitch leaves, the one that slid into its place becomes current,
 * or the new last one when the answered pitch was the last.
 */

import { useState } from "react";
import type { Pitch } from "../data/desk.data";

export interface UsePitchTriageQueueParams {
  pitches: Pitch[];
  /** Ids fading out after a decision (from `usePitchTriageActions`). */
  leavingPitchIds: string[];
  /** Ids answered in a dialog stacked on the overlay (pass note, commission). */
  answeredPitchIds?: string[];
  /** Opens the overlay on this pitch instead of the first one. */
  initialPitchId?: string | null;
}

interface TriageCursor {
  pitchId: string | null;
  index: number;
}

/** While the list is still loading the requested id is kept as it is, so the
 *  cursor lands on it once the pitches arrive. */
function initialCursor(
  pitches: Pitch[],
  initialPitchId: string | null | undefined,
): TriageCursor {
  if (pitches.length === 0) {
    return { pitchId: initialPitchId ?? null, index: 0 };
  }
  const requestedIndex = initialPitchId
    ? pitches.findIndex((pitch) => pitch.id === initialPitchId)
    : 0;
  const startIndex = Math.max(0, requestedIndex);
  return { pitchId: pitches[startIndex]?.id ?? null, index: startIndex };
}

export function usePitchTriageQueue({
  pitches,
  leavingPitchIds,
  answeredPitchIds = [],
  initialPitchId,
}: UsePitchTriageQueueParams) {
  const [recordedPitchIds, setRecordedPitchIds] = useState<string[]>([]);
  const [cursor, setCursor] = useState<TriageCursor>(() =>
    initialCursor(pitches, initialPitchId),
  );
  const [hasHadPitches, setHasHadPitches] = useState(pitches.length > 0);

  // A pitch that starts leaving has been answered, whichever control did it
  // (a bulk action, a shortcut, a row button, a stacked dialog). Recorded
  // during render, the React pattern for state derived from a changing prop.
  const unrecordedPitchIds = [...leavingPitchIds, ...answeredPitchIds].filter(
    (pitchId, position, allIds) =>
      !recordedPitchIds.includes(pitchId) &&
      allIds.indexOf(pitchId) === position,
  );
  if (unrecordedPitchIds.length > 0) {
    setRecordedPitchIds([...recordedPitchIds, ...unrecordedPitchIds]);
  }

  // A leaving pitch stays in the queue until its exit animation finishes.
  const queue = pitches.filter(
    (pitch) =>
      !recordedPitchIds.includes(pitch.id) ||
      leavingPitchIds.includes(pitch.id),
  );

  // An empty queue means "all answered" only when this opening had pitches to
  // answer. It is tracked by presence: a live pass or commission made in a
  // stacked dialog drops the pitch through a refetch, without being recorded.
  if (!hasHadPitches && queue.length > 0) setHasHadPitches(true);

  const foundIndex =
    cursor.pitchId === null
      ? -1
      : queue.findIndex((pitch) => pitch.id === cursor.pitchId);
  const currentIndex =
    foundIndex >= 0 ? foundIndex : Math.min(cursor.index, queue.length - 1);
  const currentPitch = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null;

  if (
    currentPitch &&
    (currentPitch.id !== cursor.pitchId || currentIndex !== cursor.index)
  ) {
    setCursor({ pitchId: currentPitch.id, index: currentIndex });
  }

  function moveBy(offset: number): void {
    const targetIndex = currentIndex + offset;
    const targetPitch = queue[targetIndex];
    if (targetPitch) setCursor({ pitchId: targetPitch.id, index: targetIndex });
  }

  /** Drops these pitches from the queue once they are no longer leaving. */
  function markAnswered(pitchIds: string[]): void {
    setRecordedPitchIds((current) => [
      ...current,
      ...pitchIds.filter((pitchId) => !current.includes(pitchId)),
    ]);
  }

  return {
    queue,
    currentPitch,
    currentIndex,
    /** True once this opening has shown at least one pitch. */
    hasHadPitches,
    hasPrevious: currentIndex > 0,
    hasNext: currentIndex >= 0 && currentIndex < queue.length - 1,
    goToPrevious: () => moveBy(-1),
    goToNext: () => moveBy(1),
    markAnswered,
  };
}
