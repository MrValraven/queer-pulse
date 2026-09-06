import { apiGet } from "../../../shared/api/client";

/**
 * `GET /communities/:slug/upcoming-gatherings` (PRD-145) — the gatherings a
 * PROSPECTIVE member may see on a community's Events tab.
 *
 * Its own narrow endpoint rather than a flag on `GET /communities/:slug/pulse`:
 * the pulse carries two member-only arms (discussion threads and the
 * community's volunteering board), and relaxing its membership gate would make
 * a stranger's view depend on a caller passing the right flag. This response
 * type has only gatherings on it, so there is no field a post could travel in.
 *
 * Signed in and NOT archived/taken down; a `private` community the caller is
 * not on the roster of answers 404 rather than 403, so existence is never
 * leaked. It never answers null, so a plain `apiGet` is correct here.
 */
export interface CommunityUpcomingGatheringDTO {
  slug: string;
  title: string;
  /** ISO 8601 on the wire. */
  startAt: string;
  /** ISO 8601, or null. */
  endAt: string | null;
  isOnline: boolean;
  /** Free-text venue name. Never the street address (that needs a "going" RSVP). */
  venue: string | null;
  neighbourhood: string | null;
  /** "Supper club", "Workshop / talk", … or null. */
  eventType: string | null;
  /** Display-only free text ("pay what you can at the door"), or null. */
  cost: string | null;
  coverImageUrl: string | null;
  /**
   * How many members are going, or NULL when the host turned "Show attendee
   * count" off. Note the null: this is not the pulse lane's non-nullable
   * `goingCount`. Render no count line at all when it is null, rather than
   * "0 going".
   */
  goingCount: number | null;
}

export interface CommunityUpcomingGatheringsDTO {
  items: CommunityUpcomingGatheringDTO[];
  page: number;
  hasMore: boolean;
}

/** Page size is fixed server-side at 10, ordered soonest first. `page` is
 *  clamped to 1..10 there, so there is no deep-paging escape hatch. */
export const getCommunityUpcomingGatherings = (slug: string, page: number) =>
  apiGet<CommunityUpcomingGatheringsDTO>(
    `/communities/${slug}/upcoming-gatherings?page=${page}`,
  );
