import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { Appeal, ModReport, ResolvedItem } from "./adminModeration.data";

/**
 * Age handling for the moderation queue (FE-ADM-26 / FE-ADM-29).
 *
 * `ModReport.age` / `Appeal.age` are pre-baked compact strings ("26m", "3h")
 * that only exist because the demo seed in `adminModeration.data.ts` ships
 * them. They are English and they cannot be re-rendered when the locale
 * changes, so live rows carry the raw `createdAt` timestamp through instead and
 * the components format it with `Intl` at render time. The `age` string stays
 * as the demo-only fallback, exactly like the rest of the dual-mode contract.
 */

/** A live open-queue row: the existing view model plus the raw timestamp the
 *  DTO already carries. Optional, so the demo seed's plain `ModReport` rows
 *  stay assignable. */
export type ModReportView = ModReport & { createdAt?: string };

/** The appeal-side mirror of `ModReportView`. */
export type AppealView = Appeal & { createdAt?: string };

/**
 * The resolved-tab mirror of `ModReportView`. `ResolvedItem.closed` is a
 * pre-baked "Closed 2 min ago" string the demo seed ships; live rows carry the
 * raw close timestamp instead so `closedLabelOf` can render it per locale.
 */
export type ResolvedItemView = ResolvedItem & { closedAt?: string };

/** Anything the queue can age: a live row with `createdAt`, or a demo row that
 *  only has the pre-baked `age` string. */
export interface AgedRow {
  createdAt?: string;
  age: string;
}

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_DAY = 86_400_000;

/**
 * "3 hours ago" / "há 3 horas" from an ISO timestamp — fully `Intl`-localized
 * via `fmt`, no catalog strings needed since `Intl.RelativeTimeFormat` already
 * carries the locale (and `numeric: "auto"` gives "now" / "agora" for a report
 * that just landed). Mirrors `contributionWhen` in
 * `api/adminMembers.adapters.ts`. Returns "" when the timestamp doesn't parse,
 * so callers can fall back.
 */
export function relativeAgeLabel(
  isoTimestamp: string,
  fmt: Formatters,
): string {
  const atMs = Date.parse(isoTimestamp);
  if (Number.isNaN(atMs)) return "";
  const elapsedMs = Math.max(0, Date.now() - atMs);
  const elapsedMinutes = Math.round(elapsedMs / MILLISECONDS_PER_MINUTE);
  if (elapsedMinutes < 60) return fmt.relativeTime(-elapsedMinutes, "minute");
  const elapsedHours = Math.round(elapsedMs / MILLISECONDS_PER_HOUR);
  if (elapsedHours < 24) return fmt.relativeTime(-elapsedHours, "hour");
  const elapsedDays = Math.round(elapsedMs / MILLISECONDS_PER_DAY);
  return fmt.relativeTime(-elapsedDays, "day");
}

/** The localized age for one queue row, falling back to the demo seed's own
 *  compact `age` string when the row carries no real timestamp. */
export function ageLabelOf(row: AgedRow, fmt: Formatters): string {
  if (!row.createdAt) return row.age;
  return relativeAgeLabel(row.createdAt, fmt) || row.age;
}

/**
 * The "Closed …" line under a resolved row. The adapter used to compose
 * `"Closed 3h ago"` in English at map time (FE-ADM-26); it now passes the raw
 * `closedAt` through and this resolves a catalog phrase around an
 * `Intl`-localized age. Demo rows carry no timestamp, so they keep the seed's
 * own pre-baked `closed` string.
 */
export function closedLabelOf(
  item: ResolvedItemView,
  t: TFunction,
  fmt: Formatters,
): string {
  if (!item.closedAt) return item.closed;
  const age = relativeAgeLabel(item.closedAt, fmt);
  if (!age) return item.closed;
  return t("admin:moderation.resolved.closedAt", { age });
}

/**
 * The genuinely oldest row (FE-ADM-29). The open queue is fetched with
 * `sort: "priority"`, so the last row is the LOWEST-PRIORITY one and reading
 * its age as "the oldest" is wrong: a three-day-old medium-severity report sits
 * mid-list while the caption claims "2h". Compares the raw `createdAt`
 * timestamps instead. Demo rows have none, so they keep the seed's own
 * oldest-last ordering.
 */
export function oldestRowOf<Row extends AgedRow>(rows: Row[]): Row | undefined {
  let oldestRow: Row | undefined;
  let oldestAtMs = Number.POSITIVE_INFINITY;
  rows.forEach((row) => {
    if (!row.createdAt) return;
    const atMs = Date.parse(row.createdAt);
    if (Number.isNaN(atMs) || atMs >= oldestAtMs) return;
    oldestAtMs = atMs;
    oldestRow = row;
  });
  return oldestRow ?? rows[rows.length - 1];
}
