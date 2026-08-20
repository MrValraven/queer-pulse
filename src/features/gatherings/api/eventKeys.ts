import type { EventFilter } from "./events.api";

/**
 * Per-domain react-query key factory for the events domain.
 *
 * `demoMode` sits **LAST** in every key (audit P1-10 recommendation), so a bare
 * root prefix — `["event"]` / `["events"]` / `["attendees"]` — invalidates every
 * variant regardless of demo/live, and the read site (where the query is
 * defined) and the write site (where a mutation invalidates) can never drift out
 * of position. The previous bug was invalidating `["event", slug]`, which put an
 * identifier where the query held `demoMode`, so it matched nothing and edits /
 * cancels / RSVPs / cohost changes never refreshed the UI.
 *
 * Use `.detail` / `.list` / `.attendees` where a query is DEFINED; use the
 * `*Root` prefixes to INVALIDATE every matching query after a mutation.
 */
export const eventKeys = {
  /** Prefix matching every single-event detail query (any slug, any mode). */
  detailRoot: ["event"] as const,
  detail: (param: string | undefined, demoMode: boolean) =>
    ["event", param, demoMode] as const,

  /** Prefix matching every events-list query (any filter, any mode). */
  listRoot: ["events"] as const,
  list: (filter: EventFilter | undefined, demoMode: boolean) =>
    ["events", filter, demoMode] as const,

  /** Prefix matching every attendees query (any slug, any mode). */
  attendeesRoot: ["attendees"] as const,
  attendees: (slug: string | undefined, demoMode: boolean) =>
    ["attendees", slug, demoMode] as const,

  /** Prefix matching every event-lineup query (any slug, any mode). */
  lineupRoot: ["event-lineup"] as const,
  lineup: (slug: string | undefined, demoMode: boolean) =>
    ["event-lineup", slug, demoMode] as const,

  /** Prefix matching every cohost-invite query (any id, any mode). */
  cohostInviteRoot: ["cohost-invite"] as const,
  cohostInvite: (id: string | undefined, demoMode: boolean) =>
    ["cohost-invite", id, demoMode] as const,

  /** Prefix matching every "my RSVP details" query (any slug, any mode). */
  rsvpDetailsRoot: ["rsvp-details"] as const,
  rsvpDetails: (slug: string | undefined, demoMode: boolean) =>
    ["rsvp-details", slug, demoMode] as const,
};
