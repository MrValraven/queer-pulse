import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";

// Hidden event communities: a member's own preference about which
// communities' events reach their Highlights, Browse and calendar. It never
// touches membership, and the hidden community is never told. The routes live
// under `/me` because the list belongs to the member, beside `/me/communities`.

/** One community the member hid from their events lists, newest first. */
export interface HiddenEventCommunityDTO {
  communityId: string;
  slug: string;
  name: string;
  /** Resolved avatar URL, or null when the community has none. */
  avatarImageUrl: string | null;
  /** When the member hid it, ISO 8601. */
  hiddenAt: string;
}

const HIDDEN_EVENT_COMMUNITIES_PATH = "/me/hidden-event-communities";

/** GET /me/hidden-event-communities: the member's hidden list. */
export const getHiddenEventCommunities = () =>
  apiGet<HiddenEventCommunityDTO[]>(HIDDEN_EVENT_COMMUNITIES_PATH).then(
    (rows) => rows ?? [],
  );

/**
 * POST /me/hidden-event-communities. Keyed by slug because every surface that
 * offers a hide (the card menu, the Browse refine search) has the slug, and the
 * community search results carry no id. Idempotent: hiding a community twice
 * returns the existing row.
 */
export const hideEventCommunity = (communitySlug: string) =>
  apiPost<HiddenEventCommunityDTO>(HIDDEN_EVENT_COMMUNITIES_PATH, {
    communitySlug,
  });

/** DELETE /me/hidden-event-communities/:communityId. Idempotent as well:
 *  showing a community that was never hidden already meets the intent. */
export const unhideEventCommunity = (communityId: string) =>
  apiDelete<{ hidden: false }>(
    `${HIDDEN_EVENT_COMMUNITIES_PATH}/${encodeURIComponent(communityId)}`,
  );

/** The row shown until the server answers a hide. Without a known id it
 *  carries a slug-based stand-in that `withSavedRow` replaces by slug. */
export function placeholderRowFor(
  target: { slug: string; name: string; avatarImageUrl?: string | null },
  communityId: string | undefined,
): HiddenEventCommunityDTO {
  return {
    communityId: communityId ?? `pending-${target.slug}`,
    slug: target.slug,
    name: target.name,
    avatarImageUrl: target.avatarImageUrl ?? null,
    hiddenAt: new Date().toISOString(),
  };
}

/** The hidden list with the saved row first. It replaces the placeholder and
 *  any older row for the same community. */
export function withSavedRow(
  rows: readonly HiddenEventCommunityDTO[],
  savedRow: HiddenEventCommunityDTO,
): HiddenEventCommunityDTO[] {
  return [
    savedRow,
    ...rows.filter(
      (row) =>
        row.slug !== savedRow.slug && row.communityId !== savedRow.communityId,
    ),
  ];
}
