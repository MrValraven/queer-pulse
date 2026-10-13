import type { EventCommunityInviteDetailDTO } from "./api/eventCommunities.api";

export type CollabInviteResolvedKind =
  "notFound" | "cancelled" | "past" | "accepted" | "declined";

/**
 * Why a collab invite can no longer be answered, or `null` while it can.
 * A cancelled or past gathering reads first: that is what closed the
 * invite, whatever answer it holds.
 */
export function collabInviteResolvedKind(
  invite: EventCommunityInviteDetailDTO,
): Exclude<CollabInviteResolvedKind, "notFound"> | null {
  if (invite.event.isCancelled) return "cancelled";
  if (invite.event.isPast) return "past";
  if (invite.status === "accepted") return "accepted";
  if (invite.status === "declined") return "declined";
  return null;
}
