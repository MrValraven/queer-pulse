import type {
  EventGuestCommunityDTO,
  EventGuestCommunityView,
  GatheringGuestCommunity,
  GuestCommunityChanges,
  GuestCommunityDraftEntry,
} from "./eventCommunities.api";

/** The organisers' guest list as editor rows, each with its saved status. */
export function guestDraftEntries(
  views: readonly EventGuestCommunityView[],
): GuestCommunityDraftEntry[] {
  return views.map((view) => ({
    slug: view.community.slug,
    name: view.community.name,
    accessTier: view.community.accessTier,
    status: view.status,
  }));
}

/** The detail's accepted guests with the avatar normalised to a URL or null
 *  (an older server omits the field). */
export function guestCommunitiesFromDetail(
  guests: readonly EventGuestCommunityDTO[] | undefined,
): GatheringGuestCommunity[] {
  return (guests ?? []).map((guest) => ({
    ...guest,
    avatarImageUrl: guest.avatarImageUrl ?? null,
  }));
}

/**
 * Demo mode's stand-in for the server: removals first, then each invite as
 * a new row. A community the viewer runs joins at once (the server's
 * auto-accept), any other waits as pending. A slug already listed is kept
 * once.
 */
export function applyDemoGuestChanges(
  current: readonly EventGuestCommunityView[],
  changes: GuestCommunityChanges,
  isStaffOf: (communitySlug: string) => boolean,
): EventGuestCommunityView[] {
  const removedSlugs = new Set(changes.removeSlugs);
  const kept = current.filter((view) => !removedSlugs.has(view.community.slug));
  const keptSlugs = new Set(kept.map((view) => view.community.slug));
  const added: EventGuestCommunityView[] = changes.invites
    .filter((entry) => !keptSlugs.has(entry.slug))
    .map((entry) => ({
      id: `demo-collab-${entry.slug}`,
      status: isStaffOf(entry.slug) ? "accepted" : "pending",
      community: {
        slug: entry.slug,
        name: entry.name,
        accessTier: entry.accessTier,
      },
    }));
  return [...kept, ...added];
}
