import type { Dispatch, SetStateAction } from "react";
import type { ChatMessage } from "./data";
import { isServerConversationId } from "./useMessagesController.helpers";

// Shared offline-outbox replay primitives.
// Split out of useMessageOutbox.ts (ENG-214) so the Messages-page replay loop
// (`useMessageOutbox`) and the app-level background replay
// (`useBackgroundOutboxReplay`, mounted once from `AppChrome`) share exactly
// one copy of the auto-replay eligibility rules, the backoff schedule, and the
// permanent-failure classification. A member who queues a send offline gets
// the same retry behaviour whether or not the Messages page happens to be
// open when the network returns; two independently-tuned copies would drift.

/** How many times the outbox may automatically re-send a still-failing entry
 *  (mount, `online`, reconnect, or the ENG-208 backoff timer) before giving up
 *  on ever auto-replaying it again. It stays visible as `"failed"` and a
 *  MANUAL `retrySend` still works past this cap: only the unattended replay
 *  loop stops. Bounds a transient failure (network blip, 5xx, 429, timeout)
 *  that never recovers from silently reburning the 60/min send throttle on
 *  every connectivity flap for the rest of the entry's localStorage lifetime. */
export const MAX_AUTO_REPLAY_ATTEMPTS = 5;

/** Exponential backoff between automatic replay attempts for one entry (2s,
 *  4s, 8s, 16s, capped at 30s), the same order of magnitude as the socket
 *  layer's own reconnect backoff, so a burst of `online`/reconnect events
 *  close together can't hammer a still-cooling-down send. */
export function backoffDelayMs(retryCount: number): number {
  return Math.min(2000 * 2 ** retryCount, 30_000);
}

/** HTTP statuses the server will never reconcile by re-POSTing the SAME
 *  payload: a blocked pair (403), a thread that no longer accepts replies
 *  (403, e.g. a housing enquiry thread the recipient closed), a deleted
 *  conversation (404/409), a payload too large (413), or one the validator
 *  rejects (400/422). Neither replay path (the Messages-page outbox nor the
 *  background replay) may ever resend one of these automatically; a MANUAL
 *  `retrySend` still can, since the member may have fixed the underlying
 *  cause (unblocked, reworded, etc). Everything else, network errors with no
 *  `ApiError` at all, 5xx, 429, and 408 timeouts, is transient and stays
 *  eligible for automatic replay, bounded by `MAX_AUTO_REPLAY_ATTEMPTS`. */
export const PERMANENT_FAILURE_STATUS_CODES = new Set([
  400, 403, 404, 409, 413, 422,
]);

/** True when `message` is a candidate for automatic replay at all, ignoring
 *  its backoff window: has a client id, is still `sending`/`failed`, was
 *  never classified a PERMANENT failure, and hasn't exhausted
 *  `MAX_AUTO_REPLAY_ATTEMPTS`. Shared by `isDueForAutoReplay` (adds the
 *  backoff-window check) and `earliestDueAt` (computes each conversation's
 *  first eligible entry's own due time instead of checking "due now"). */
function isAutoReplayEligible(
  message: ChatMessage,
): message is ChatMessage & { localId: string } {
  if (!message.localId) return false;
  if (message.status !== "sending" && message.status !== "failed") {
    return false;
  }
  if (message.isRetryable === false) return false;
  const retryCount = message.retryCount ?? 0;
  return retryCount < MAX_AUTO_REPLAY_ATTEMPTS;
}

/** True when the outbox may automatically replay `message` right now: it's
 *  `isAutoReplayEligible` AND has cleared its backoff window since the last
 *  attempt. A manual `retrySend` bypasses this entirely: this gate only
 *  governs the unattended mount / `online` / reconnect / timer replay loops. */
export function isDueForAutoReplay(
  message: ChatMessage,
): message is ChatMessage & { localId: string } {
  if (!isAutoReplayEligible(message)) return false;
  const retryCount = message.retryCount ?? 0;
  const lastAttemptAt = message.lastAttemptAt ?? 0;
  return Date.now() - lastAttemptAt >= backoffDelayMs(retryCount);
}

/** Record that the outbox itself (not a manual retry) just spent one
 *  automatic-replay attempt on `localId`, BEFORE firing `deliver`, so two
 *  replay triggers landing in the same tick (e.g. `online` and a socket
 *  reconnect firing together) can't both see the same stale `retryCount` and
 *  double-spend the budget on one connectivity flap. Shared by
 *  `useMessageOutbox` (the Messages-page replay loop) and, via the same
 *  contract, `useBackgroundOutboxReplay`'s own storage-backed bookkeeping. */
export function markAutoReplayAttempt(
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>,
  conversationId: string,
  localId: string,
): void {
  setSent((previous) => ({
    ...previous,
    [conversationId]: (previous[conversationId] ?? []).map((item) =>
      item.localId === localId
        ? {
            ...item,
            retryCount: (item.retryCount ?? 0) + 1,
            lastAttemptAt: Date.now(),
          }
        : item,
    ),
  }));
}

/** ENG-208: the earliest epoch ms at which any conversation's first eligible
 *  entry becomes due, or null when nothing is currently eligible right now
 *  (empty outbox, every entry permanently failed or budget-exhausted, every
 *  remaining conversation id still a just-picked recipient's placeholder id,
 *  or every first-eligible entry already in flight). Mirrors
 *  `replayConversationInOrder`'s own stop rule: only a conversation's FIRST
 *  eligible entry ever counts, since the chain stops there regardless of
 *  what any later entry's own due time might be, and a first-eligible entry
 *  that's `isInFlight` is left out of the computation entirely, the same
 *  way `replayConversationInOrder` stops on it, since its own settlement
 *  writes `sent` and reschedules this timer on its own. Used to schedule
 *  exactly ONE timer for the next automatic replay, so a still-backing-off
 *  entry always has a follow-up attempt scheduled, even when no
 *  `online`/reconnect event ever fires again. Placeholder conversation ids
 *  are skipped entirely: only `migrateOutboxConversation` drives those,
 *  immediately, once the real conversation exists, and neither
 *  `appendOptimistic` nor `runDeliver` ever stamps `lastAttemptAt` for one,
 *  since nothing is actually attempted there. */
export function earliestDueAt(
  sent: Record<string, ChatMessage[]>,
  isInFlight: (localId: string) => boolean,
): number | null {
  let earliest: number | null = null;
  for (const [conversationId, messages] of Object.entries(sent)) {
    if (!isServerConversationId(conversationId)) continue;
    for (const message of messages) {
      if (!isAutoReplayEligible(message)) continue;
      if (isInFlight(message.localId)) break;
      const retryCount = message.retryCount ?? 0;
      const lastAttemptAt = message.lastAttemptAt ?? 0;
      const dueAt = lastAttemptAt + backoffDelayMs(retryCount);
      if (earliest === null || dueAt < earliest) earliest = dueAt;
      break;
    }
  }
  return earliest;
}

/** ENG-213: replay `messages` (one conversation, oldest-first) SEQUENTIALLY.
 *  An entry `isAutoReplayEligible` rules out entirely (already sent,
 *  permanently failed, or budget exhausted) is skipped: it will never need
 *  another automatic attempt, so it can't block anything behind it either.
 *  Otherwise STOP the whole chain the moment the next entry is either in
 *  flight (a delivery already underway for that localId, most commonly the
 *  very send that just created it) or eligible but not yet due, so a later
 *  message can never overtake an earlier one that's still in progress or
 *  backing off. Three offline sends landing 2-3-1 was the original form of
 *  this bug; a later message racing ahead of an in-flight earlier one right
 *  after a manual retry was a second form of it. Shared by the Messages-page
 *  outbox (`useMessageOutbox`, which reacts via React state) and the
 *  app-level background replay (`useBackgroundOutboxReplay`, which reacts
 *  via a read-modify-write against localStorage): the ordering guarantee is
 *  identical either way; only how `attempt` records the outcome differs. */
export async function replayConversationInOrder(
  messages: ChatMessage[],
  isInFlight: (localId: string) => boolean,
  attempt: (message: ChatMessage & { localId: string }) => Promise<boolean>,
): Promise<void> {
  for (const message of messages) {
    if (!isAutoReplayEligible(message)) continue;
    if (isInFlight(message.localId)) break;
    if (!isDueForAutoReplay(message)) break;
    const succeeded = await attempt(message);
    if (!succeeded) break;
  }
}

// Background-replay mount gate (ENG-214).
// `useMessageOutbox` (the Messages page) increments this on mount and
// decrements it on unmount; `useBackgroundOutboxReplay` (mounted app-wide from
// `AppChrome`) checks it before every attempt and stays inert while it's > 0.
// The page's own replay loop already owns the outbox while it's open: two
// replay loops racing the same entries would double the send-throttle usage
// and let two concurrent deliveries of the same localId race each other's
// status writes (idempotent server-side, but wasteful and confusing to watch).
let messagesPageOutboxMountCount = 0;
const messagesPageOutboxFullyUnmountedListeners = new Set<() => void>();

export function markMessagesPageOutboxMounted(): void {
  messagesPageOutboxMountCount += 1;
}

/** On the 1→0 transition (the last Messages-page outbox instance
 *  unmounting), notify every subscriber so the background replayer can run
 *  a pass right away. Otherwise it stays dormant until its own next mount,
 *  `online`, reconnect, or timer trigger (ENG-214), and some of those may
 *  not fire again for a long time on an otherwise-steady connection. */
export function markMessagesPageOutboxUnmounted(): void {
  if (messagesPageOutboxMountCount === 0) return;
  messagesPageOutboxMountCount -= 1;
  if (messagesPageOutboxMountCount === 0) {
    for (const listener of messagesPageOutboxFullyUnmountedListeners) {
      listener();
    }
  }
}

export function isMessagesPageOutboxMounted(): boolean {
  return messagesPageOutboxMountCount > 0;
}

/** Subscribe to the mount counter's 1→0 transition (see
 *  `markMessagesPageOutboxUnmounted`). Returns an unsubscribe function. */
export function onMessagesPageOutboxFullyUnmounted(
  listener: () => void,
): () => void {
  messagesPageOutboxFullyUnmountedListeners.add(listener);
  return () => messagesPageOutboxFullyUnmountedListeners.delete(listener);
}
