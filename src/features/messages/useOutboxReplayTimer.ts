import { useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "./data";
import { earliestDueAt } from "./outboxReplay.helpers";

interface OutboxReplayTimerDeps {
  sent: Record<string, ChatMessage[]>;
  demoMode: boolean;
  /** From `useMessageDeliverCore`'s `isDeliveryInFlight`, so the earliest-due
   *  computation skips a conversation whose first eligible entry is already
   *  mid-delivery, the same way the actual replay loop does. Read via a ref
   *  internally, so a fresh function identity on every render never
   *  resubscribes anything. */
  isInFlight: (localId: string) => boolean;
  /** Called when the timer fires: the caller decides what "replay now" means
   *  (`useMessageOutbox`'s `replayOutbox`). Read via a ref internally, so a
   *  fresh function identity on every render never resubscribes anything. */
  onDue: () => void;
}

export interface OutboxReplayTimer {
  /** Recompute the earliest due moment from the CURRENT `sent` and (re)arm
   *  the timer for it, always replacing whatever was scheduled before so
   *  timers never stack. Call this explicitly after a replay pass completes,
   *  even one that changed nothing: the automatic `sent`-change trigger below
   *  only fires when `sent` itself changes, which a pass that found nothing
   *  due yet never does. */
  scheduleReplayTimer: () => void;
}

/**
 * ENG-208: the Messages-page outbox's backoff timer, split out of
 * `useMessageOutbox.ts` to keep that file from growing further. Schedules
 * exactly ONE `window.setTimeout` for the earliest moment any still-eligible
 * outbox entry becomes due, and clears it on unmount. Two things call
 * `scheduleReplayTimer`:
 *   - automatically here, whenever `sent` itself changes (a replay attempt's
 *     `markAutoReplayAttempt`, a failed delivery, a fresh optimistic send, a
 *     manual retry, migration onto a real conversation id, ...);
 *   - explicitly, from `useMessageOutbox`'s own `replayOutbox`, after EVERY
 *     pass completes, so a pass that found nothing due yet (everything still
 *     backing off) still gets a fresh timer regardless of whether `sent`
 *     itself changed.
 */
export function useOutboxReplayTimer({
  sent,
  demoMode,
  isInFlight,
  onDue,
}: OutboxReplayTimerDeps): OutboxReplayTimer {
  const sentRef = useRef(sent);
  useEffect(() => {
    sentRef.current = sent;
  }, [sent]);
  const isInFlightRef = useRef(isInFlight);
  useEffect(() => {
    isInFlightRef.current = isInFlight;
  }, [isInFlight]);
  const onDueRef = useRef(onDue);
  useEffect(() => {
    onDueRef.current = onDue;
  }, [onDue]);

  const replayTimerRef = useRef<number | null>(null);
  const clearScheduledReplay = useCallback(() => {
    if (replayTimerRef.current !== null) {
      window.clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
  }, []);

  const scheduleReplayTimer = useCallback(() => {
    clearScheduledReplay();
    if (demoMode) return;
    // Offline: nothing would succeed anyway, and `useMessageOutbox`'s own
    // `online` listener already re-triggers a full replay (which reschedules
    // this timer) the moment connectivity returns, so scheduling here would
    // just burn a doomed attempt at the computed delay while still offline.
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    const dueAt = earliestDueAt(sentRef.current, (localId) =>
      isInFlightRef.current(localId),
    );
    if (dueAt === null) return;
    const delay = Math.max(0, dueAt - Date.now());
    replayTimerRef.current = window.setTimeout(() => {
      replayTimerRef.current = null;
      onDueRef.current();
    }, delay);
  }, [clearScheduledReplay, demoMode]);

  useEffect(() => {
    scheduleReplayTimer();
    return clearScheduledReplay;
  }, [sent, scheduleReplayTimer, clearScheduledReplay]);

  return { scheduleReplayTimer };
}
