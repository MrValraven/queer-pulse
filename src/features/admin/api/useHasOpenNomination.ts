import { useAdminSafeSpaceNominations } from "../../safety/api/useAdminSafeSpaceNominations";

/** The endpoint's own ceiling (`AdminNominationsQuery.limit` is `@Max(100)`).
 *  The open queue is a moderator worklist, so this is generous for it. */
const OPEN_NOMINATION_SCAN_LIMIT = 100;

/**
 * Whether an undecided nomination is already open for this listing.
 *
 * The direct badge control and the reviewed nomination queue are two doors to
 * the same badge. Where a nomination exists, the reviewed route is the better
 * one: it decides the member's nomination rather than leaving it open, and it
 * tells the person who nominated the place. That is guidance rather than a
 * gate, though. A moderator correcting a listing has reasons a queue does not
 * know about, and blocking them here would only push the work somewhere with no
 * audit trail at all.
 *
 * Returns `false` while the queue is loading or if it fails, so an advisory
 * line never appears on a guess and a hiccup in an unrelated query never blocks
 * the editor. Demo mode is served by the same hook's fixture and never hits the
 * network.
 */
export function useHasOpenNomination(listingRef: string): boolean {
  const { nominations } = useAdminSafeSpaceNominations({
    scope: "open",
    assignedOnly: true,
    limit: OPEN_NOMINATION_SCAN_LIMIT,
  });
  return nominations.some(
    (nomination) =>
      nomination.listingRef === listingRef ||
      nomination.listing?.ref === listingRef,
  );
}
