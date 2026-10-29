import { MEMBERS } from "../members/data/members";
import type { EventHostDTO } from "./api/events.api";
import type { GatheringDetail } from "./data";

/**
 * Demo-only fallback for MSG-12's "who else is going" preview and its
 * expanded list. No mock gathering in `gatheringDetails` carries a real
 * going-attendee list (the registry predates this feature), so rather than
 * hand-author one per entry, this derives a stable list from the real member
 * registry, leaving out the gathering's own host so the demo stays a glance
 * at the guests (live can list the host, who holds a Going RSVP, with a
 * "Host" chip). Live mode never touches this file; it reads
 * `gathering.goingAttendeesPreview` and the paged attendees route straight
 * off the server, which already filters both for privacy and blocks (see
 * `GoingAttendeesPreview.tsx`).
 */
const PREVIEW_POOL = Object.values(MEMBERS).filter((member) => member.photo);

/** How many faces the collapsed preview shows in demo. */
const DEMO_PREVIEW_SIZE = 6;

/** Small string hash so the same gathering slug always picks the same faces
 *  (stable across renders/reloads) without a shared seeded-random dependency. */
function hashSlug(slug: string): number {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/** The gathering's numeric "N going" count, or `undefined` when it has none.
 *  "Open to all"/ticketed-with-no-headcount carries no count at all, and a
 *  "N seats/spots LEFT" framing (`spots.key` is `seatsLeft`/`spotsLeft`) is
 *  remaining capacity rather than attendees, so treating it as a going total
 *  would overstate (or misrepresent) who's actually in the event. */
function demoGoingTotal(gathering: GatheringDetail): number | undefined {
  // A house event shows "N spots left" and carries its going count apart, so
  // the row reads that count instead of dropping out.
  if (typeof gathering.goingCount === "number" && gathering.goingCount > 0) {
    return gathering.goingCount;
  }
  const isGoingCount = gathering.spots.key.startsWith("gatherings:spots.going");
  const total = isGoingCount ? gathering.spots.values?.count : undefined;
  return typeof total === "number" && total > 0 ? total : undefined;
}

/**
 * Everyone the demo shows as going, in a fixed order: `Math.min(total,
 * pool.length)` members from the registry, starting at the same hashed
 * offset every time, so the preview's faces are always this list's first
 * ones. Backs the expanded "Who's going" list in demo, which has no paged
 * roster of its own (the manage page's mock roster holds other people).
 * Whatever `total` counts beyond this list reads as "going privately".
 * Returns `null` when the gathering has no going count to list against.
 */
export function demoGoingAttendees(
  gathering: GatheringDetail,
): { attendees: EventHostDTO[]; total: number } | null {
  const total = demoGoingTotal(gathering);
  const pool = PREVIEW_POOL.filter(
    (member) => member.slug !== gathering.hostSlug,
  );
  if (total === undefined || !pool.length) return null;

  const listSize = Math.min(total, pool.length);
  const offset = hashSlug(gathering.slug) % pool.length;
  const attendees: EventHostDTO[] = Array.from(
    { length: listSize },
    (_, position) => {
      const member = pool[(offset + position) % pool.length]!;
      return {
        slug: member.slug,
        firstName: member.first,
        lastName: member.last,
        avatarUrl: member.photo ?? null,
      };
    },
  );
  return { attendees, total };
}

/**
 * A deterministic (same gathering, same faces) small preview, sized to the
 * gathering's own "N going" count when it has one: the first six people of
 * `demoGoingAttendees`. Returns `null` when the gathering has no numeric
 * going count to preview against (see `demoGoingTotal`).
 */
export function demoGoingAttendeesPreview(
  gathering: GatheringDetail,
): { attendees: EventHostDTO[]; total: number } | null {
  const everyone = demoGoingAttendees(gathering);
  if (!everyone) return null;
  return {
    attendees: everyone.attendees.slice(0, DEMO_PREVIEW_SIZE),
    total: everyone.total,
  };
}
