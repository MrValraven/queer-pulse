import {
  gatheringIsUnderWay,
  type CalendarEvent,
  type GatheringSpan,
} from "../data";

export type TimeBucket = "now" | "tonight" | "weekend" | "week" | "later";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Which "when" bucket a gathering falls into relative to `now`.
 *
 * A gathering that has started and has not ended gets its own bucket. It used
 * to be read from its start day alone, so an overnight party rolled past
 * midnight into a negative day difference and fell through to "later", and the
 * poster ribbon called a gathering happening right at that moment "Coming up".
 *
 * A gathering with no stated end is never under way, so everything the demo
 * registry carries buckets exactly as it did before.
 */
export function timeBucketOf(event: GatheringSpan, now: Date): TimeBucket {
  if (gatheringIsUnderWay(event, now)) return "now";
  const today = startOfDay(now);
  const day = startOfDay(event.date);
  const diffDays = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "tonight";
  const dayOfWeek = event.date.getDay(); // 0 Sun … 6 Sat
  if (
    diffDays > 0 &&
    diffDays <= 7 &&
    (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)
  )
    return "weekend";
  if (diffDays > 0 && diffDays <= 7) return "week";
  return "later";
}

export function timeBucketLabelKey(bucket: TimeBucket): string {
  return `gatherings:hub.bucket.${bucket}`;
}

const BUCKET_SCORE: Record<TimeBucket, number> = {
  now: 4,
  tonight: 3,
  weekend: 2,
  week: 1,
  later: 0,
};

/** Curated highlights: upcoming, weighted toward soon + popular, soonest first. */
export function pickHighlights(
  events: CalendarEvent[],
  now: Date,
  opts: { count?: number } = {},
): CalendarEvent[] {
  const count = opts.count ?? 7;
  const today = startOfDay(now).getTime();
  // Anything starting today or later, plus anything still running. The second
  // clause is what keeps an overnight party in Highlights (and in the Featured
  // card above them) after midnight, and puts a festival on its second day back
  // on the hub's front page. The first clause is untouched, so a gathering with
  // no stated end is curated exactly as it was before.
  const upcoming = events.filter(
    (event) => gatheringIsUnderWay(event, now) || event.date.getTime() >= today,
  );
  const scored = upcoming
    .map((event) => ({
      event,
      score:
        BUCKET_SCORE[timeBucketOf(event, now)] +
        Math.min((event.attendeeCount ?? 0) / 20, 2),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || a.event.date.getTime() - b.event.date.getTime(),
    );
  return scored.slice(0, count).map((s) => s.event);
}
