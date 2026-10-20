import type { ManagedListingDTO } from "../api/listings.api";

/**
 * Whether invites and approvals can land: the listing is live and shown in
 * the directory. Declining, cancelling and removing stay available either way.
 */
export function isListingTeamOpen(listing: ManagedListingDTO): boolean {
  return (
    listing.status === "live" &&
    listing.directoryVisibility?.isHiddenByOwner !== true
  );
}

/** The member ids with one member moved a step; an edge move changes nothing. */
export function moveMemberId(
  memberIds: string[],
  memberId: string,
  direction: "up" | "down",
): string[] {
  const fromIndex = memberIds.indexOf(memberId);
  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  if (fromIndex === -1 || toIndex < 0 || toIndex >= memberIds.length) {
    return [...memberIds];
  }
  const moved = [...memberIds];
  const [member] = moved.splice(fromIndex, 1);
  if (member === undefined) return moved;
  moved.splice(toIndex, 0, member);
  return moved;
}
