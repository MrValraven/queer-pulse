import type { Formatters } from "../../shared/i18n/format";
import { relativeAgeLabel } from "./moderationAge";

/**
 * The waiting-time clock every staff queue now carries (OPS-04).
 *
 * The moderation queue has had one since COM-8: `reports.sla_due_at`, an
 * overdue chip on the row, and an `overdue` filter. Invite requests,
 * verification requests, intakes and partner applications had nothing, so
 * nothing anywhere escalated on age and an application could sit for six weeks
 * looking exactly like one filed this morning.
 *
 * This is deliberately the SAME rule the moderation queue applies
 * (`isOverdue` in `AdminModerationCards.tsx`, `isReportOverdue` in
 * `moderationQueue.helpers.ts`), read from the queue-agnostic `dueAt` field
 * the four new DTOs carry, and it reuses `relativeAgeLabel` from
 * `moderationAge.ts` rather than introducing a second age formatter. That file
 * already lives in `features/admin/`, alongside every queue that needs it, so
 * nothing had to move out of the moderation feature to be shared.
 */

/** A queue row that carries the OPS-04 clock. Every field optional so a demo
 *  fixture predating the column, or a row from a queue that has no clock, is
 *  still assignable. */
export interface QueueClockRow {
  /** ISO 8601, or null when this row has no clock at all. */
  dueAt?: string | null;
}

/**
 * Whether a row is past its due date.
 *
 * A NULL, absent or unparseable `dueAt` is NOT overdue. That matters: rows
 * created before OPS-04 and already decided were deliberately left with no
 * clock by the migration, and reading "no promise was made" as "the promise
 * was broken" would paint a historical queue red for no reason.
 *
 * Callers should ask only about rows that are still open, the same way the
 * moderation queue only checks its open tab: a decided row's clock has stopped.
 */
export function isQueueRowOverdue(dueAt: string | null | undefined): boolean {
  if (!dueAt) return false;
  const dueAtMs = Date.parse(dueAt);
  if (Number.isNaN(dueAtMs)) return false;
  return dueAtMs < Date.now();
}

/**
 * "2 days ago" / "há 2 dias" for how far past due a row is — fully
 * `Intl`-localized through `relativeAgeLabel`, so no catalog string carries a
 * duration. Returns "" when the row is not overdue (or has no clock), letting
 * a caller render the chip's bare label instead of an empty phrase.
 */
export function overdueByLabel(
  dueAt: string | null | undefined,
  fmt: Formatters,
): string {
  if (!isQueueRowOverdue(dueAt)) return "";
  return relativeAgeLabel(dueAt as string, fmt);
}

/** How urgently a still-open row's wait should read. */
export type QueueRowUrgency = "neutral" | "approaching" | "overdue";

/** How long before the due date a row starts reading as "approaching". */
const APPROACHING_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * The urgency tint for a still-open row, derived from the SERVER's due date.
 *
 * This replaced a local `daysWaiting >= 3` in `JoinRequestCard`, which was the
 * last place in the admin surfaces that restated a review window the backend
 * already owns (`join-request-sla.ts`). It sat directly beside
 * `QueueOverdueChip`, which reads `dueAt`, so one card could show a
 * server-owned due date and a client-computed urgency that disagreed with it
 * the moment the window moved.
 *
 * The boundaries are the same ones that local rule produced against the shipped
 * three-day window, so no row changes colour today: past due is overdue, the
 * last day before due is approaching. The one deliberate difference is a row
 * with NO clock, which now reads neutral rather than red. That is this module's
 * standing rule (see `isQueueRowOverdue`): rows predating OPS-04 carry no due
 * date, and no promise was made about them to break.
 */
export function queueRowUrgency(
  dueAt: string | null | undefined,
): QueueRowUrgency {
  if (!dueAt) return "neutral";
  const dueAtMs = Date.parse(dueAt);
  if (Number.isNaN(dueAtMs)) return "neutral";
  const now = Date.now();
  if (dueAtMs < now) return "overdue";
  return dueAtMs - now <= APPROACHING_WINDOW_MS ? "approaching" : "neutral";
}

/** How many rows in a set are past due — the count behind a queue header's
 *  "3 overdue" line. */
export function overdueCountOf(rows: QueueClockRow[]): number {
  return rows.filter((row) => isQueueRowOverdue(row.dueAt)).length;
}
