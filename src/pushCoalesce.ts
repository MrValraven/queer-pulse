/**
 * Pure decision helper for SP5 DM push coalescing — extracted so `sw.ts`'s
 * push handler (which has to call the unmockable `registration.getNotifications()`)
 * stays a thin wrapper around a testable function.
 *
 * WhatsApp/Telegram/Signal all fold a burst of DMs from the same conversation
 * into one calm notification instead of stacking N separate ones. Every DM
 * push is tagged with its conversation id and sets `renotify: true`, so at
 * most one live notification exists per conversation at a time — `sw.ts`
 * looks it up via `registration.getNotifications({ tag })` before deciding
 * how to render the incoming push. This module holds that decision: given
 * whatever existing notification was found (if any), how many messages does
 * the notification now represent, and should it render as the coalesced
 * "{count} new messages from {name}" summary instead of the single message?
 */

/** The shape this module reads off a live `Notification` (or a test double). */
export interface ExistingCoalescedNotification {
  data?: { count?: unknown } | null;
}

export interface CoalesceDecision {
  /** Running count of messages folded into this notification (always >= 1). */
  count: number;
  /** True once there IS a prior notification to fold into — render the
   *  coalesced summary body instead of the single message's own body. */
  coalesced: boolean;
}

/**
 * `existing` is whatever `registration.getNotifications({ tag })` returned
 * for this push's conversation tag — normally 0 or 1 entries, since
 * `renotify: true` replaces rather than stacks a same-tag notification.
 *
 * No prior notification: this is the first message in the burst, count is 1,
 * and the caller should render the single-message copy as usual.
 *
 * A prior notification: reads its `data.count` (defaulting to 1, e.g. if an
 * older un-coalesced notification is still showing) and increments it — the
 * caller should render `push:messages.coalesced` with that new count.
 */
export function decideCoalesce(
  existing: ExistingCoalescedNotification[],
): CoalesceDecision {
  const previous = existing[0];
  if (!previous) return { count: 1, coalesced: false };
  const previousCount = readCount(previous);
  return { count: previousCount + 1, coalesced: true };
}

function readCount(notification: ExistingCoalescedNotification): number {
  const raw = notification.data?.count;
  return typeof raw === "number" && Number.isFinite(raw) && raw >= 1 ? raw : 1;
}
