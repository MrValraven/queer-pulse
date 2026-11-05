import { useState } from "react";

/**
 * Every value `current` has held since mount, in first-seen order, so a
 * sidebar vocabulary only ever grows.
 *
 * The persona directory builds its Profession and Tags rows from the cards in
 * hand, and a search term reshapes those cards: a term matching nobody used to
 * empty both rows and fold their sections away, leaving the sidebar with
 * Availability alone. The house rule on /members and /communities is that a
 * section stays and its options stay, reading 0 and dimmed, because an option
 * that disappears makes the vocabulary feel unstable. This is that rule for a
 * vocabulary drawn from a fetched set: once seen, a value stays, and only its
 * count moves.
 *
 * Adjusted during render (the `StudioAccountMenu` shape), so the row never
 * paints a frame without a value it showed a moment ago. A value already seen
 * keeps its place, and a new one joins at the end, so nothing shifts under a
 * pointer.
 */
export function useSeenVocabulary<Value>(
  current: readonly Value[],
): readonly Value[] {
  const [seenValues, setSeenValues] = useState<readonly Value[]>(current);
  const unseenValues = current.filter((value) => !seenValues.includes(value));
  if (unseenValues.length === 0) return seenValues;
  const nextSeenValues = [...seenValues, ...unseenValues];
  setSeenValues(nextSeenValues);
  return nextSeenValues;
}

/** True from the first render `isTrueNow` holds onwards, for a section that
 *  should stay once it has had something to show. */
export function useLatchedFlag(isTrueNow: boolean): boolean {
  const [hasBeenTrue, setHasBeenTrue] = useState(isTrueNow);
  if (isTrueNow && !hasBeenTrue) setHasBeenTrue(true);
  return hasBeenTrue || isTrueNow;
}
