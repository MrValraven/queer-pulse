import type { TFunction } from "../i18n/types";
import type { Formatters } from "../i18n/format";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The two non-numeric idioms a bucketed "time ago" needs, as i18n keys. */
export interface RelativeAgoKeys {
  /** Shown for a timestamp under a minute old. */
  justNow: string;
  /** Shown for an unparseable timestamp, rather than throwing or guessing. */
  unknown: string;
}

/**
 * "4 hours ago" / "8 days ago" from an ISO timestamp, relative to `now`
 * (injectable so callers stay clock-independent in tests). Deliberately
 * coarse — this is a "when did this last happen" hint, not an audit log.
 *
 * Shared by every "list of my devices" surface (`SessionsPage.tsx`'s
 * `signedInAgo`, `PushDevicesPage.tsx`'s device timestamps) so the bucketing
 * and locale-aware formatting stay in one place.
 *
 * i18n note: the numeric distance goes through `fmt.relativeTime` (locale's
 * own `Intl.RelativeTimeFormat`, e.g. pt-PT's "há 4 horas"), never a
 * hand-rolled `${n} ${n === 1 ? "hour" : "hours"} ago` — that hard-codes
 * English pluralization rules. The two non-numeric idioms resolve through the
 * catalog via `t` and the caller's own keys.
 */
export function relativeAgo(
  iso: string,
  t: TFunction,
  fmt: Formatters,
  keys: RelativeAgoKeys,
  now: number = Date.now(),
): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return t(keys.unknown);
  const delta = Math.max(0, now - then);
  if (delta < MINUTE) return t(keys.justNow);
  if (delta < HOUR) return fmt.relativeTime(-Math.floor(delta / MINUTE), "minute");
  if (delta < DAY) return fmt.relativeTime(-Math.floor(delta / HOUR), "hour");
  return fmt.relativeTime(-Math.floor(delta / DAY), "day");
}
