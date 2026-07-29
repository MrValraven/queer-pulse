import type { CalendarEvent } from "../data";

export type TimeBucket = "tonight" | "weekend" | "week" | "later";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Which "when" bucket an event falls into relative to `now`. */
export function timeBucketOf(date: Date, now: Date): TimeBucket {
  const today = startOfDay(now);
  const day = startOfDay(date);
  const diffDays = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "tonight";
  const dow = date.getDay(); // 0 Sun … 6 Sat
  if (diffDays > 0 && diffDays <= 7 && (dow === 5 || dow === 6 || dow === 0))
    return "weekend";
  if (diffDays > 0 && diffDays <= 7) return "week";
  return "later";
}

export function timeBucketLabelKey(bucket: TimeBucket): string {
  return `gatherings:hub.bucket.${bucket}`;
}

const BUCKET_SCORE: Record<TimeBucket, number> = {
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
  const upcoming = events.filter((e) => e.date.getTime() >= today);
  const scored = upcoming
    .map((event) => ({
      event,
      score:
        BUCKET_SCORE[timeBucketOf(event.date, now)] +
        Math.min((event.attendeeCount ?? 0) / 20, 2),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || a.event.date.getTime() - b.event.date.getTime(),
    );
  return scored.slice(0, count).map((s) => s.event);
}
