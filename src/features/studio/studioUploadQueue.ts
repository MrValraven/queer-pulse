/** Upload stages that may hold a slot at once. A presigned PUT URL lasts
 *  300 s, so a file presigns only when its slot opens. */
export const UPLOAD_SLOT_COUNT = 3;

/** The shortest gap between two progress updates of one row. */
export const PROGRESS_INTERVAL_MS = 250;

export interface SlotQueue {
  /** Resolves when a slot is free, with the function that frees it again. */
  acquire: () => Promise<() => void>;
}

/** At most `limit` holders at once; the rest wait in arrival order. */
export function createSlotQueue(limit: number): SlotQueue {
  let activeCount = 0;
  const waiting: (() => void)[] = [];

  function release() {
    const next = waiting.shift();
    // A waiting holder takes the freed slot over, so the count stays.
    if (next) next();
    else activeCount -= 1;
  }

  return {
    acquire: () =>
      new Promise((resolve) => {
        const grant = () => {
          let isReleased = false;
          resolve(() => {
            if (isReleased) return;
            isReleased = true;
            release();
          });
        };
        if (activeCount < limit) {
          activeCount += 1;
          grant();
        } else {
          waiting.push(grant);
        }
      }),
  };
}

export interface SerialChain {
  run: <Result>(task: () => Promise<Result>) => Promise<Result>;
}

/** Runs tasks one after another in the order they arrive; a failed task
 *  hands its turn on to the next. */
export function createSerialChain(): SerialChain {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    run: <Result>(task: () => Promise<Result>) => {
      const result = tail.then(task);
      tail = result.catch(() => undefined);
      return result;
    },
  };
}

/** Reports whole percents at most once per interval; 100 always reports. */
export function createProgressReporter(
  report: (percent: number) => void,
  intervalMs: number = PROGRESS_INTERVAL_MS,
  now: () => number = Date.now,
): (percent: number) => void {
  let lastPercent = -1;
  let lastReportedAt = Number.NEGATIVE_INFINITY;
  return (percent) => {
    const wholePercent = Math.max(0, Math.min(100, Math.floor(percent)));
    if (wholePercent === lastPercent) return;
    const reportedAt = now();
    if (wholePercent !== 100 && reportedAt - lastReportedAt < intervalMs)
      return;
    lastPercent = wholePercent;
    lastReportedAt = reportedAt;
    report(wholePercent);
  };
}

export interface LatestSender<Value> {
  /** Sends now when idle; while a send runs, keeps only the newest value. */
  submit: (value: Value) => void;
}

/**
 * One request in flight at a time. Values submitted meanwhile collapse into
 * the newest, sent once the current request settles. `send` resolves false
 * to drop whatever is waiting (after a failure the caller restores state).
 */
export function createLatestSender<Value>(
  send: (value: Value) => Promise<boolean>,
): LatestSender<Value> {
  let isSending = false;
  let pending: { value: Value } | null = null;

  function takePending() {
    const next = pending;
    pending = null;
    return next;
  }

  async function drain() {
    isSending = true;
    try {
      for (let next = takePending(); next; next = takePending()) {
        const shouldContinue = await send(next.value);
        if (!shouldContinue) {
          pending = null;
          break;
        }
      }
    } finally {
      isSending = false;
    }
  }

  return {
    submit: (value) => {
      pending = { value };
      if (!isSending) void drain();
    },
  };
}
