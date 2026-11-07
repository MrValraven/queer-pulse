/**
 * Synced server time as React state, re-read every `intervalMs` (default
 * 250) while enabled. Rings, countdowns and "live for" labels read it; the
 * beat dots use `useVjBeatTicker` for frame accuracy.
 */
import { useEffect, useState } from "react";
import type { VjRemoteClock } from "./useVjRemoteClock";

export const VJ_SYNCED_NOW_INTERVAL_MS = 250;

export interface VjSyncedNowOptions {
  intervalMs?: number;
  isEnabled?: boolean;
}

export function useVjSyncedNow(
  clock: VjRemoteClock,
  options: VjSyncedNowOptions = {},
): number {
  const { intervalMs = VJ_SYNCED_NOW_INTERVAL_MS, isEnabled = true } = options;
  const [syncedNow, setSyncedNow] = useState(() => clock.serverNow());

  useEffect(() => {
    if (!isEnabled) return;
    const readClock = () => setSyncedNow(clock.serverNow());
    // The first read lands at once, so a value held while disabled never shows stale.
    const firstRead = setTimeout(readClock, 0);
    const interval = setInterval(readClock, intervalMs);
    return () => {
      clearTimeout(firstRead);
      clearInterval(interval);
    };
  }, [clock, intervalMs, isEnabled]);

  return syncedNow;
}
