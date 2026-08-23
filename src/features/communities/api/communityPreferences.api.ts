import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";

/**
 * The caller's OWN per-community settings: `GET`/`PATCH
 * /communities/:slug/preferences`, `POST /communities/:slug/welcome-seen` and
 * `POST /communities/:slug/rules-acceptance`.
 *
 * Its own module rather than more calls in `communities.api.ts`, mirroring the
 * backend, where `CommunityPreferencesController` is a standalone controller
 * under the same `communities/:slug` path. Everything here is first-person: no
 * route in this file can address another member's row, and no response carries
 * anybody else's notification level.
 */

/** How much a member wants to hear from one community.
 *  - `all` — every post.
 *  - `announcements` — only what an owner or mod marks as an announcement.
 *  - `mentions` — only threads where the member is named.
 *  - `muted` — nothing from this community. */
export type CommunityNotificationLevel =
  "all" | "announcements" | "mentions" | "muted";

/** Every level, in the order the picker lists them (loudest to quietest). */
export const COMMUNITY_NOTIFICATION_LEVELS: CommunityNotificationLevel[] = [
  "all",
  "announcements",
  "mentions",
  "muted",
];

export interface CommunityPreferencesDTO {
  communitySlug: string;
  notificationLevel: CommunityNotificationLevel;
  /** The owner-authored greeting, or null when the community wrote none. */
  welcomeMessage: string | null;
  /** True while this member still owes a first read of `welcomeMessage`. The
   *  server has already made the whole decision (never stamped AND the
   *  community actually has a greeting), so the client never re-derives it. */
  shouldShowWelcome: boolean;
  /** ISO timestamp of the last time the welcome was shown, or null. */
  welcomeSeenAt: string | null;
  /** The community's current house-rules version. */
  rulesVersion: number;
  /** The version this member last accepted, null if they joined before
   *  acceptance was recorded. */
  rulesAcceptedVersion: number | null;
  /** True while this member owes a fresh read of rules that have changed.
   *  Decided server-side (the community has rules AND the member is behind),
   *  so the client never re-derives the rule and drifts from it. */
  shouldReacceptRules: boolean;
}

export const getCommunityPreferences = (slug: string) =>
  apiGet<CommunityPreferencesDTO>(`/communities/${slug}/preferences`);

export const setCommunityNotificationLevel = (
  slug: string,
  notificationLevel: CommunityNotificationLevel,
) =>
  apiPatch<CommunityPreferencesDTO>(`/communities/${slug}/preferences`, {
    notificationLevel,
  });

export const markCommunityWelcomeSeen = (slug: string) =>
  apiPost<CommunityPreferencesDTO>(`/communities/${slug}/welcome-seen`);

/**
 * Record that this member has read the community's house rules at
 * `acceptedRulesVersion`.
 *
 * The version is sent rather than implied: the server records consent to a
 * specific revision, so it refuses a stale number instead of coercing it. A
 * 400 here means the rules changed again mid-read.
 */
export const acceptCommunityRules = (
  slug: string,
  acceptedRulesVersion: number,
) =>
  apiPost<CommunityPreferencesDTO>(`/communities/${slug}/rules-acceptance`, {
    acceptedRulesVersion,
  });
