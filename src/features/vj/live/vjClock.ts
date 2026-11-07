/**
 * The synced clock (contract 3.6): server epoch time read on this device.
 * Transports hand it one sample per ack and per clock:sync answer; it keeps
 * the last few, takes the contract's median offset, and smooths small moves
 * so a beat-synced effect never jumps by a few ms on every ack (plan call 2).
 */
import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  VJ_CLOCK_SAMPLES_KEPT,
  vjClockOffsetMs,
  type VjClockSample,
} from "../../../shared/contracts/vj";
import { vjLocalNow } from "../realtime/vjClockSync";
import {
  VJ_CLOCK_NOTIFY_MIN_DELTA_MS,
  VJ_CLOCK_SLEW_THRESHOLD_MS,
} from "../vj.constants";

export interface VjClock {
  /** Feeds one sample from any ack or clock:sync answer. */
  addSample(sample: VjClockSample): void;
  /** Uses a saved offset (an offline reload) until the first live sample. */
  seedOffset(offsetMs: number | null): void;
  /** Server minus local ms; null with no sample and no seed. */
  offsetMs(): number | null;
  /** True once a live sample arrived. */
  isSynced(): boolean;
  /** Synced server epoch ms now. */
  serverNow(): number;
  /** The local clock (vjLocalNow) time of a server epoch ms. */
  toLocalTime(serverMs: number): number;
  toServerTime(localMs: number): number;
  /** Fires when offsetMs() moves by VJ_CLOCK_NOTIFY_MIN_DELTA_MS or more, or isSynced() flips. */
  subscribe(listener: () => void): () => void;
}

export interface VjClockOptions {
  /** The local clock samples are measured on; defaults to vjLocalNow. */
  localNow?: () => number;
  /** The wall clock a clock without an offset follows; defaults to Date.now. */
  wallNow?: () => number;
}

/** Where the offset goes after a live target: the first one and a far one are taken at once, a near one halfway. */
function nextOffsetMs(
  currentOffsetMs: number | null,
  targetOffsetMs: number,
  isFirstLiveTarget: boolean,
): number {
  if (isFirstLiveTarget || currentOffsetMs === null) return targetOffsetMs;
  const distanceMs = targetOffsetMs - currentOffsetMs;
  if (Math.abs(distanceMs) > VJ_CLOCK_SLEW_THRESHOLD_MS) return targetOffsetMs;
  return currentOffsetMs + distanceMs / 2;
}

export function createVjClock(options: VjClockOptions = {}): VjClock {
  const localNow = options.localNow ?? vjLocalNow;
  const wallNow = options.wallNow ?? (() => Date.now());
  const listeners = new Set<() => void>();
  let samples: VjClockSample[] = [];
  let currentOffsetMs: number | null = null;
  let hasLiveSample = false;
  let notifiedOffsetMs: number | null = null;
  let notifiedIsSynced = false;

  function notifyWhenMoved(): void {
    const hasSyncFlipped = notifiedIsSynced !== hasLiveSample;
    const hasOffsetMoved =
      notifiedOffsetMs === null || currentOffsetMs === null
        ? notifiedOffsetMs !== currentOffsetMs
        : Math.abs(currentOffsetMs - notifiedOffsetMs) >=
          VJ_CLOCK_NOTIFY_MIN_DELTA_MS;
    if (!hasSyncFlipped && !hasOffsetMoved) return;
    notifiedOffsetMs = currentOffsetMs;
    notifiedIsSynced = hasLiveSample;
    for (const listener of [...listeners]) listener();
  }

  /** The offset every conversion uses: with none yet, the gap that makes serverNow read the wall clock. */
  function effectiveOffsetMs(): number {
    return currentOffsetMs ?? wallNow() - localNow();
  }

  return {
    addSample(sample) {
      samples = [...samples, sample].slice(-VJ_CLOCK_SAMPLES_KEPT);
      const targetOffsetMs = vjClockOffsetMs(samples);
      if (targetOffsetMs === null) return;
      currentOffsetMs = nextOffsetMs(
        currentOffsetMs,
        targetOffsetMs,
        !hasLiveSample,
      );
      hasLiveSample = true;
      notifyWhenMoved();
    },
    seedOffset(offsetMs) {
      if (hasLiveSample) return;
      currentOffsetMs =
        offsetMs !== null && Number.isFinite(offsetMs) ? offsetMs : null;
      notifyWhenMoved();
    },
    offsetMs: () => currentOffsetMs,
    isSynced: () => hasLiveSample,
    serverNow: () => localNow() + effectiveOffsetMs(),
    toLocalTime: (serverMs) => serverMs - effectiveOffsetMs(),
    toServerTime: (localMs) => localMs + effectiveOffsetMs(),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export interface VjClockOffsetSnapshot {
  offsetMs: number | null;
  isSynced: boolean;
}

/** A snapshot reader for one clock: a new object only when a value changed, so
 *  useSyncExternalStore sees a stable snapshot between notifications. */
function createVjClockSnapshotReader(
  clock: VjClock,
): () => VjClockOffsetSnapshot {
  let cachedSnapshot: VjClockOffsetSnapshot = {
    offsetMs: clock.offsetMs(),
    isSynced: clock.isSynced(),
  };
  return () => {
    const offsetMs = clock.offsetMs();
    const isSynced = clock.isSynced();
    if (
      cachedSnapshot.offsetMs !== offsetMs ||
      cachedSnapshot.isSynced !== isSynced
    ) {
      cachedSnapshot = { offsetMs, isSynced };
    }
    return cachedSnapshot;
  };
}

/** Re-renders on offset and sync changes; returns { offsetMs, isSynced }. */
export function useVjClockOffset(clock: VjClock): VjClockOffsetSnapshot {
  const subscribe = useCallback(
    (listener: () => void) => clock.subscribe(listener),
    [clock],
  );
  const getSnapshot = useMemo(
    () => createVjClockSnapshotReader(clock),
    [clock],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
