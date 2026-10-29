import type { GuestPreviewRole } from "../guestPreview/guestPreview";
import { eventKeySegment, type EventApiTarget } from "./eventApiTarget";
import type { EventBrowseFilters, EventFilter } from "./events.api";

/**
 * Per-domain react-query key factory for the events domain.
 *
 * `demoMode` sits **LAST** among the identifying parts of every key (audit
 * P1-10 recommendation), so a bare root prefix (`["event"]`, `["events"]` or `["attendees"]`) invalidates every
 * variant regardless of demo/live, and the read site (where the query is
 * defined) and the write site (where a mutation invalidates) can never drift out
 * of position. The previous bug was invalidating `["event", slug]`, which put an
 * identifier where the query held `demoMode`, so it matched nothing and edits /
 * cancels / RSVPs / cohost changes never refreshed the UI.
 *
 * The one thing that may follow `demoMode` is the `"musicAdmin"` segment a
 * music admin read adds (`eventKeySegment`), so it never shares a cache entry
 * with the member read of the same slug. A member key has no such segment and
 * ends at `demoMode`.
 *
 * Use `.detail` / `.list` / `.attendees` where a query is DEFINED; use the
 * `*Root` prefixes to INVALIDATE every matching query after a mutation.
 */
export const eventKeys = {
  /** Prefix matching every single-event detail query (any slug, any mode). */
  detailRoot: ["event"] as const,
  detail: (
    param: string | undefined,
    demoMode: boolean,
    apiTarget?: EventApiTarget,
  ) => ["event", param, demoMode, ...eventKeySegment(apiTarget)] as const,
  /**
   * A host's guest preview (`?viewAs=`). Its own root on purpose: an RSVP
   * patch or invalidation aimed at the host's real detail (`detailRoot`)
   * reaches no preview, and a preview never stands in for the real one.
   */
  detailPreviewRoot: ["event-preview"] as const,
  detailPreview: (
    param: string | undefined,
    viewAs: GuestPreviewRole,
    demoMode: boolean,
  ) => ["event-preview", param, viewAs, demoMode] as const,

  /** Prefix matching every events-list query (any filter, any mode). */
  listRoot: ["events"] as const,
  /**
   * The browse filters (LOC-17) are part of the key because they change WHICH
   * rows the server returns: a change has to start a fresh infinite query
   * rather than append a differently-filtered page 2 onto pages fetched under
   * the old filter. An unfiltered call produces the same key it always did, so
   * the hub's own `filter=upcoming` fetch and an unfiltered browse still share
   * one request.
   *
   * `includeHidden` (the create wizard's clash notes, the mention picker)
   * asks for the upcoming list with the member's hidden communities left in.
   * It lands in the key only when true, so every default key is unchanged.
   */
  list: (
    filter: EventFilter | undefined,
    demoMode: boolean,
    browse?: EventBrowseFilters,
    includeHidden?: boolean,
  ) =>
    [
      "events",
      filter,
      demoMode,
      ...(browse && Object.values(browse).some(Boolean) ? [browse] : []),
      ...(includeHidden ? ["includeHidden"] : []),
    ] as const,
  /**
   * The events a member hosts or co-hosts, for their profile's Events section
   * (`useProfileEvents`). It sits under `["events"]` so every mutation that
   * refreshes the event lists refreshes it too. `"byMember"` holds the filter
   * position, so the `["events", "upcoming"]` patches never reach it.
   */
  byMember: (slug: string, demoMode: boolean) =>
    ["events", "byMember", slug, demoMode] as const,

  /**
   * The member's hidden event communities. These keys sit outside
   * `["events"]` on purpose (the lesson recorded in `useFeedMutes.ts`): hiding
   * a community invalidates the whole events tree, and a hidden list living
   * under that prefix would be refetched by its own mutation. In demo mode that
   * refetch resolves the empty seed and silently undoes the hide.
   */
  hiddenCommunitiesRoot: ["hidden-event-communities"] as const,
  hiddenCommunities: (demoMode: boolean) =>
    ["hidden-event-communities", demoMode] as const,

  /** Prefix of `useMoreFromHost`'s literal key, so a hide can refresh it. */
  moreFromHostRoot: ["more-from-host"] as const,
  /** `useHomepageGatherings`'s literal key, so a hide can refresh it. */
  homepageGatheringsRoot: ["homepage-gatherings"] as const,

  /** Prefix matching every announcements query (any slug, any mode). */
  announcementsRoot: ["event-announcements"] as const,
  announcements: (
    slug: string | undefined,
    demoMode: boolean,
    apiTarget?: EventApiTarget,
  ) =>
    [
      "event-announcements",
      slug,
      demoMode,
      ...eventKeySegment(apiTarget),
    ] as const,

  /** Prefix matching every event-bans query (any slug, any mode). */
  bansRoot: ["event-bans"] as const,
  bans: (
    slug: string | undefined,
    demoMode: boolean,
    apiTarget?: EventApiTarget,
  ) => ["event-bans", slug, demoMode, ...eventKeySegment(apiTarget)] as const,

  /** Prefix matching every attendees query (any slug, any mode). */
  attendeesRoot: ["attendees"] as const,
  attendees: (
    slug: string | undefined,
    demoMode: boolean,
    apiTarget?: EventApiTarget,
  ) => ["attendees", slug, demoMode, ...eventKeySegment(apiTarget)] as const,

  /** Prefix matching every event-lineup query (any slug, any mode). */
  lineupRoot: ["event-lineup"] as const,
  lineup: (
    slug: string | undefined,
    demoMode: boolean,
    apiTarget?: EventApiTarget,
  ) => ["event-lineup", slug, demoMode, ...eventKeySegment(apiTarget)] as const,
  /** The lineup as a guest preview reads it. Its own root, as above. */
  lineupPreviewRoot: ["event-lineup-preview"] as const,
  lineupPreview: (
    slug: string | undefined,
    viewAs: GuestPreviewRole,
    demoMode: boolean,
  ) => ["event-lineup-preview", slug, viewAs, demoMode] as const,
  /** Prefix matching every lineup-invite query (any id, any mode). */
  lineupInviteRoot: ["lineup-invite"] as const,
  lineupInvite: (id: string | undefined, demoMode: boolean) =>
    ["lineup-invite", id, demoMode] as const,

  /** Prefix matching every cohost-invite query (any id, any mode). */
  cohostInviteRoot: ["cohost-invite"] as const,
  cohostInvite: (id: string | undefined, demoMode: boolean) =>
    ["cohost-invite", id, demoMode] as const,

  /** Prefix matching every "my RSVP details" query (any slug, any mode). */
  rsvpDetailsRoot: ["rsvp-details"] as const,
  rsvpDetails: (slug: string | undefined, demoMode: boolean) =>
    ["rsvp-details", slug, demoMode] as const,

  /** Prefix matching every "invites I sent from my RSVP" query. */
  rsvpInvitesRoot: ["event-rsvp-invites"] as const,
  rsvpInvites: (slug: string | undefined, demoMode: boolean) =>
    ["event-rsvp-invites", slug, demoMode] as const,

  /** Prefix matching every organiser "invite requests" query. */
  inviteRequestsRoot: ["event-invite-requests"] as const,
  inviteRequests: (
    slug: string | undefined,
    demoMode: boolean,
    apiTarget?: EventApiTarget,
  ) =>
    [
      "event-invite-requests",
      slug,
      demoMode,
      ...eventKeySegment(apiTarget),
    ] as const,
};
