import { useListingTeam } from "../api/useListingTeam";
import type { ListingEditorSectionKey } from "./listingEditor.data";

const NO_BADGES: Partial<Record<ListingEditorSectionKey, number>> = {};

/**
 * Counts of answers waiting inside editor sections, for the jump nav's coral
 * pills. Team shows the requests from personas that wait for this business.
 */
export function useListingEditorSectionBadges(
  listingRef: string,
): Partial<Record<ListingEditorSectionKey, number>> {
  const { team } = useListingTeam(listingRef);
  const awaitingYouCount = team?.awaitingYouCount ?? 0;
  return awaitingYouCount > 0 ? { team: awaitingYouCount } : NO_BADGES;
}
