/**
 * Send throttles for streamed controls (contract 7.12): the crossfader,
 * effect amount sliders and MIDI CC streams send at most one frame per
 * VJ_DRAG_THROTTLE_MS while moving, trailing, and always send the final
 * value. The v1 VJ_FADE_SLIDER_THROTTLE_MS (100) stands for the transition
 * length slider. Both constants live in ../../vj.constants.
 */

export interface VjSendGate {
  shouldSend(now: number): boolean;
  markSent(now: number): void;
  reset(): void;
}

export function createVjSendGate(intervalMs: number): VjSendGate {
  let lastSentAt: number | null = null;
  return {
    shouldSend(now) {
      return lastSentAt === null || now - lastSentAt >= intervalMs;
    },
    markSent(now) {
      lastSentAt = now;
    },
    reset() {
      lastSentAt = null;
    },
  };
}

/**
 * Trailing send: the first value goes at once, then at most one per
 * interval, and the last value of a stream always goes once the interval
 * after the previous send runs out.
 */
export interface VjTrailingSender<Value> {
  push(value: Value, now: number): void;
  flushNow(): void;
  cancel(): void;
}

interface VjPendingValue<Value> {
  value: Value;
}

export function createVjTrailingSender<Value>(options: {
  intervalMs: number;
  send: (value: Value) => void;
  setTimer?: typeof setTimeout;
  clearTimer?: typeof clearTimeout;
}): VjTrailingSender<Value> {
  const { intervalMs, send } = options;
  const setTimer = options.setTimer ?? setTimeout;
  const clearTimer = options.clearTimer ?? clearTimeout;
  const gate = createVjSendGate(intervalMs);
  let lastSentAt = 0;
  let lastPushedAt = 0;
  let pending: VjPendingValue<Value> | null = null;
  let timerId: ReturnType<typeof setTimeout> | null = null;

  function stopTimer(): void {
    if (timerId !== null) {
      clearTimer(timerId);
      timerId = null;
    }
  }

  function sendNow(value: Value, sentAt: number): void {
    pending = null;
    gate.markSent(sentAt);
    lastSentAt = sentAt;
    send(value);
  }

  function sendPendingAt(sentAt: number): void {
    stopTimer();
    if (pending !== null) {
      sendNow(pending.value, sentAt);
    }
  }

  return {
    push(value, now) {
      lastPushedAt = now;
      if (gate.shouldSend(now)) {
        stopTimer();
        sendNow(value, now);
        return;
      }
      pending = { value };
      if (timerId === null) {
        // The timer fires on the interval boundary of the caller's clock.
        const dueAt = lastSentAt + intervalMs;
        timerId = setTimer(() => {
          timerId = null;
          sendPendingAt(dueAt);
        }, dueAt - now);
      }
    },
    flushNow() {
      sendPendingAt(lastPushedAt);
    },
    cancel() {
      stopTimer();
      pending = null;
      gate.reset();
    },
  };
}
