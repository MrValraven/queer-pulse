import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";

// ── Feed source mutes (SOC-18) ───────────────────────────────────────────────
// "Show me less of this" is a reader's preference about their own home screen.
// It never touches membership: the member keeps their place in the community,
// their access and their notifications, and the community is never told. The
// routes live under `/feed/mutes` rather than under the community for exactly
// that reason.

/** What a member can turn down. A person is deliberately absent: muting a
 *  PERSON already exists as `SocialProvider`'s mute, and giving the same
 *  relationship two stores would make them disagree. */
export type FeedSourceKind = "community" | "forum_thread";

export interface FeedMutedSource {
  sourceKind: FeedSourceKind;
  sourceId: string;
  /** The community's or thread's own name, so the managed list reads as
   *  places rather than ids. */
  name: string;
  /** Where to open it, so a member can see what they're missing before
   *  deciding to unmute. */
  link: string;
  mutedAt: string;
}

/** GET /feed/mutes — the managed list, newest mute first. */
export const getFeedMutes = () =>
  apiGet<FeedMutedSource[]>("/feed/mutes").then((rows) => rows ?? []);

/** POST /feed/mutes — idempotent; a second tap re-affirms the same row. */
export const muteFeedSource = (sourceKind: FeedSourceKind, sourceId: string) =>
  apiPost<{ muted: true }>("/feed/mutes", { sourceKind, sourceId });

/** DELETE /feed/mutes/:kind/:id — also idempotent. Unmuting something that
 *  was never muted is a no-op, since the member's intent is already met. */
export const unmuteFeedSource = (
  sourceKind: FeedSourceKind,
  sourceId: string,
) => apiDelete<{ muted: false }>(`/feed/mutes/${sourceKind}/${sourceId}`);
