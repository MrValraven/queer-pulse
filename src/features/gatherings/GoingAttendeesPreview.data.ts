import { MEMBERS } from "../members/data/members";
import type { EventHostDTO } from "./api/events.api";
import type { GatheringDetail } from "./data";

/**
 * Demo-only fallback for MSG-12's "who else is going" preview. No mock
 * gathering in `gatheringDetails` carries a real going-attendee list (the
 * registry predates this feature), so rather than hand-author one per entry,
 * this derives a small, stable preview from the real member registry —
 * excluding the gathering's own host, since a host doesn't RSVP to their own
 * gathering. Live mode never touches this file; it reads
 * `gathering.goingAttendeesPreview` straight off the server response, which
 * is already privacy/block-filtered — see `GoingAttendeesPreview.tsx`.
 */
const PREVIEW_POOL = Object.values(MEMBERS).filter((member) => member.photo);

/** Small string hash so the same gathering slug always picks the same faces
 *  (stable across renders/reloads) without a shared seeded-random dependency. */
function hashSlug(slug: string): number {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/**
 * A deterministic (same gathering → same faces) small preview, sized to the
 * gathering's own "N going" count when it has one. Returns `null` when the
 * gathering has no numeric going count to preview against: either "Open to
 * all"/ticketed-with-no-headcount (`spots.values.count` absent), or a
 * "N seats/spots LEFT" framing (`spots.key` is `seatsLeft`/`spotsLeft`) —
 * that count is remaining capacity, not attendees, so treating it as a going
 * total would overstate (or misrepresent) who's actually in the room.
 */
export function demoGoingAttendeesPreview(
  gathering: GatheringDetail,
): { attendees: EventHostDTO[]; total: number } | null {
  const isGoingCount = gathering.spots.key.startsWith("gatherings:spots.going");
  const total = isGoingCount ? gathering.spots.values?.count : undefined;
  const pool = PREVIEW_POOL.filter(
    (member) => member.slug !== gathering.hostSlug,
  );
  if (typeof total !== "number" || total <= 0 || !pool.length) return null;

  const previewSize = Math.min(6, total, pool.length);
  const offset = hashSlug(gathering.slug) % pool.length;
  const attendees: EventHostDTO[] = Array.from(
    { length: previewSize },
    (_, index) => {
      const member = pool[(offset + index) % pool.length]!;
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
