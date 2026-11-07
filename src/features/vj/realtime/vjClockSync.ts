import type { VjClockSample } from "../../../shared/contracts/vj";
import {
  VJ_CLOCK_SYNC_BURST_COUNT,
  VJ_CLOCK_SYNC_BURST_SPACING_MS,
  VJ_CLOCK_SYNC_INTERVAL_MS,
} from "../vj.constants";

/** performance.timeOrigin + performance.now(); Date.now() where performance is missing (C 3.6). */
export function vjLocalNow(): number {
  const hasPerformanceClock =
    typeof performance !== "undefined" &&
    typeof performance.now === "function" &&
    typeof performance.timeOrigin === "number";
  if (!hasPerformanceClock) return Date.now();
  return performance.timeOrigin + performance.now();
}

/** A sample from an ack, or null when the ack carries no finite serverNow. */
export function vjClockSampleOf(
  sentAt: number,
  receivedAt: number,
  ack: unknown,
): VjClockSample | null {
  if (typeof ack !== "object" || ack === null) return null;
  const serverNow = (ack as { serverNow?: unknown }).serverNow;
  if (typeof serverNow !== "number" || !Number.isFinite(serverNow)) {
    return null;
  }
  return { sentAt, receivedAt, serverNow };
}

export interface VjClockSyncSchedule {
  start(): void;
  stop(): void;
}

/**
 * C 7.3: VJ_CLOCK_SYNC_BURST_COUNT sends VJ_CLOCK_SYNC_BURST_SPACING_MS apart
 * from start(), then one every VJ_CLOCK_SYNC_INTERVAL_MS. start() restarts the
 * burst. The first send goes out inside start().
 */
export function createVjClockSyncSchedule(
  sendSync: () => void,
): VjClockSyncSchedule {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let sentInBurst = 0;

  const clearTimer = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const sendAndScheduleNext = (): void => {
    timer = null;
    sendSync();
    const isBursting = sentInBurst < VJ_CLOCK_SYNC_BURST_COUNT;
    if (isBursting) sentInBurst += 1;
    const isBurstDone = sentInBurst >= VJ_CLOCK_SYNC_BURST_COUNT;
    const delayMs = isBurstDone
      ? VJ_CLOCK_SYNC_INTERVAL_MS
      : VJ_CLOCK_SYNC_BURST_SPACING_MS;
    timer = setTimeout(sendAndScheduleNext, delayMs);
  };

  return {
    start() {
      clearTimer();
      sentInBurst = 0;
      sendAndScheduleNext();
    },
    stop() {
      clearTimer();
      sentInBurst = 0;
    },
  };
}
