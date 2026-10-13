import type {
  EventCommunityStatus,
  GuestCommunityChanges,
  GuestCommunityDraftEntry,
} from "./api/eventCommunities.api";

/** The most guest communities one gathering can hold, pending and joined
 *  counted together (spec decision 6). The server answers 400 past it. */
export const MAX_GUEST_COMMUNITIES = 5;

/** How many communities the search offers at once. */
export const GUEST_COMMUNITY_RESULT_LIMIT = 6;

/** How long the search waits after the last keystroke before it asks. */
export const GUEST_COMMUNITY_SEARCH_DEBOUNCE_MS = 300;

/** The status label of each saved row. A row added in this edit takes the
 *  label its surface passes in ("Sends when you save" or "Sends when you
 *  publish"). */
export const GUEST_STATUS_LABEL_KEYS: Record<EventCommunityStatus, string> = {
  pending: "gatherings:guestCommunities.status.pending",
  accepted: "gatherings:guestCommunities.status.accepted",
  declined: "gatherings:guestCommunities.status.declined",
};

/** The rows that hold a place under the cap: everything except a decline. */
export function countActiveGuests(
  guests: readonly GuestCommunityDraftEntry[],
): number {
  return guests.filter((guest) => guest.status !== "declined").length;
}

/**
 * The guest list after the lead community changes. A guest that becomes the
 * lead leaves the list (the server deletes that row in the same PATCH).
 * Clearing the lead drops the rows that never went out, since an invite
 * needs a lead; saved rows stay, as they do on the server.
 */
export function guestsForLead(
  guests: readonly GuestCommunityDraftEntry[],
  leadSlug: string,
): GuestCommunityDraftEntry[] {
  if (leadSlug === "") {
    return guests.filter((guest) => guest.status !== "unsent");
  }
  return guests.filter((guest) => guest.slug !== leadSlug);
}

/**
 * What a save sends for the guest list: an invite for each row the saved
 * list lacks, and a removal for each saved row the draft dropped. The new
 * lead is skipped both ways, because the PATCH already moved it, and no
 * invite goes out while the gathering has no lead. A declined row is final
 * and never queues a removal.
 */
export function diffGuestCommunities(
  saved: readonly GuestCommunityDraftEntry[],
  draft: readonly GuestCommunityDraftEntry[],
  leadSlug: string,
): GuestCommunityChanges {
  const savedSlugs = new Set(saved.map((guest) => guest.slug));
  const draftSlugs = new Set(draft.map((guest) => guest.slug));
  return {
    invites:
      leadSlug === ""
        ? []
        : draft.filter(
            (guest) => !savedSlugs.has(guest.slug) && guest.slug !== leadSlug,
          ),
    removeSlugs: saved
      .filter((guest) => guest.status !== "declined")
      .map((guest) => guest.slug)
      .filter((slug) => !draftSlugs.has(slug) && slug !== leadSlug),
  };
}

export function hasGuestCommunityChanges(
  changes: GuestCommunityChanges,
): boolean {
  return changes.invites.length > 0 || changes.removeSlugs.length > 0;
}
