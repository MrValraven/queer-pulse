import { useState, type Dispatch, type SetStateAction } from "react";
import type { EventGuestCommunityView } from "./api/eventCommunities.api";
import { guestDraftEntries } from "./api/eventCommunities.adapters";
import { useEventGuestCommunities } from "./api/useEventGuestCommunities";
import type { GatheringState } from "./manageGatheringState";
import type { GuestListStatus } from "./savedGuestListContext";

/**
 * Seeds `gatheringState.guestCommunities` from the organisers' guest list
 * (`GET /events/:slug/communities`, every status), and again each time a
 * refetch brings a new answer, which is how the baseline catches up after a
 * save's invites and removals. Adjusted during render, the pattern
 * `useManageGatheringState` uses for the cover.
 *
 * `guestListStatus` and `retryGuestList` feed the edit modal's guest field
 * while the list is on its way or has failed (see `SavedGuestListContext`).
 * Only organiser surfaces call this.
 *
 * `isEnabled: false` (a house event, which has no guest communities) fetches
 * nothing and reports the list as ready, so the edit modal never waits on it.
 */
export function useSeedGuestCommunities({
  slug,
  setGatheringState,
  isEnabled = true,
}: {
  slug: string;
  setGatheringState: Dispatch<SetStateAction<GatheringState>>;
  /** False skips the request; the list then reads as ready. */
  isEnabled?: boolean;
}): { guestListStatus: GuestListStatus; retryGuestList: () => void } {
  const guestQuery = useEventGuestCommunities(slug, { enabled: isEnabled });
  const guestViews = guestQuery.data;
  const [seededViews, setSeededViews] = useState<
    EventGuestCommunityView[] | undefined
  >(undefined);
  if (guestViews !== undefined && guestViews !== seededViews) {
    setSeededViews(guestViews);
    setGatheringState((current) => ({
      ...current,
      guestCommunities: guestDraftEntries(guestViews),
    }));
  }
  // A refetch that fails keeps the rows it already had, so data wins over
  // the error flag. A retry after a failure reads as loading again while it
  // runs (the error flag stays up until it answers).
  const guestListStatus: GuestListStatus =
    !isEnabled || guestViews !== undefined
      ? "ready"
      : guestQuery.isError && !guestQuery.isFetching
        ? "failed"
        : "loading";
  return {
    guestListStatus,
    retryGuestList: () => void guestQuery.refetch(),
  };
}
