/**
 * The C 7.4 client queue as a hook: received stage frames and ack states go
 * through the pure frame queue, and one timer releases the waiting frames at
 * their applyAt on the synced clock. Timer jitter is a few ms; the engine
 * reveals from `upcoming` on its own animation frame when it needs frame
 * accuracy.
 */
import { useEffect, useMemo, useState } from "react";
import type { VjStageFrame, VjStageState } from "../../../shared/contracts/vj";
import { vjLocalNow } from "../realtime/vjClockSync";
import type { VjClock } from "./vjClock";
import {
  EMPTY_VJ_FRAME_QUEUE,
  nextVjFrameDueAt,
  receiveVjAckState,
  receiveVjFrame,
  releaseDueVjFrames,
  upcomingVjFrameOf,
  type VjFrameQueue,
  type VjQueuedFrame,
  type VjUpcomingFrame,
} from "./vjFrameQueue";

export interface VjFrameQueueHook {
  applied: VjQueuedFrame | null;
  latest: VjQueuedFrame | null;
  upcoming: VjUpcomingFrame | null;
  receiveFrame: (frame: VjStageFrame) => void;
  receiveAckState: (state: VjStageState) => void;
  reset: () => void;
}

interface VjFrameQueueRunner {
  receiveFrame: (frame: VjStageFrame) => void;
  receiveAckState: (state: VjStageState) => void;
  reset: () => void;
  /** Applies what is due now, then arms the timer for the next waiting frame. */
  releaseDue: () => void;
  /** Clears the timer; the queue itself stays. */
  stop: () => void;
}

/** A frame's applyAt as a number or null (a v1 demo frame carries none). */
function applyAtOf(frame: VjStageFrame): number | null {
  return typeof frame.applyAt === "number" && Number.isFinite(frame.applyAt)
    ? frame.applyAt
    : null;
}

/** Holds the queue and its one timer; every change goes to onChange. */
function createVjFrameQueueRunner(
  clock: VjClock,
  onChange: (queue: VjFrameQueue) => void,
): VjFrameQueueRunner {
  let queue = EMPTY_VJ_FRAME_QUEUE;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clearTimer(): void {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function commit(next: VjFrameQueue): void {
    if (next !== queue) {
      queue = next;
      onChange(next);
    }
    armTimer();
  }

  function armTimer(): void {
    clearTimer();
    const dueAt = nextVjFrameDueAt(queue);
    if (dueAt === null) return;
    const delayMs = Math.max(0, clock.toLocalTime(dueAt) - vjLocalNow());
    timer = setTimeout(releaseDue, delayMs);
  }

  function releaseDue(): void {
    timer = null;
    commit(releaseDueVjFrames(queue, clock.serverNow()));
  }

  return {
    receiveFrame(frame) {
      const serverNow = clock.serverNow();
      const queuedFrame: VjQueuedFrame = {
        state: frame.state,
        cause: frame.cause,
        sourceClientId: frame.sourceClientId,
        applyAt: applyAtOf(frame),
      };
      // Frames already due go first, so a throttled timer never holds them back.
      const released = releaseDueVjFrames(queue, serverNow);
      commit(receiveVjFrame(released, queuedFrame, serverNow));
    },
    receiveAckState(state) {
      const serverNow = clock.serverNow();
      const released = releaseDueVjFrames(queue, serverNow);
      commit(receiveVjAckState(released, state, serverNow));
    },
    reset() {
      clearTimer();
      if (queue === EMPTY_VJ_FRAME_QUEUE) return;
      queue = EMPTY_VJ_FRAME_QUEUE;
      onChange(EMPTY_VJ_FRAME_QUEUE);
    },
    releaseDue,
    stop: clearTimer,
  };
}

/** One queue per mount over a per-mount clock (the clock never changes for a mount). */
export function useVjFrameQueue(clock: VjClock): VjFrameQueueHook {
  const [queue, setQueue] = useState<VjFrameQueue>(EMPTY_VJ_FRAME_QUEUE);
  const [runner] = useState(() => createVjFrameQueueRunner(clock, setQueue));

  useEffect(() => {
    // A moved offset moves every local due time; a tab back in view may have
    // missed its throttled timer.
    const unsubscribeClock = clock.subscribe(() => runner.releaseDue());
    const handleVisibility = () => {
      if (document.visibilityState === "visible") runner.releaseDue();
    };
    const hasDocument = typeof document !== "undefined";
    if (hasDocument) {
      document.addEventListener("visibilitychange", handleVisibility);
    }
    runner.releaseDue();
    return () => {
      unsubscribeClock();
      if (hasDocument) {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
      runner.stop();
    };
  }, [clock, runner]);

  const upcoming = useMemo(() => upcomingVjFrameOf(queue), [queue]);

  return {
    applied: queue.applied,
    latest: queue.latest,
    upcoming,
    receiveFrame: runner.receiveFrame,
    receiveAckState: runner.receiveAckState,
    reset: runner.reset,
  };
}
