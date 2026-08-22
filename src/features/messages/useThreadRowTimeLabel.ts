// src/features/messages/useThreadRowTimeLabel.ts
import { useEffect, useReducer } from "react";
import { timeLabel } from "./api/messages.adapters";

const RECOMPUTE_INTERVAL_MS = 60_000;

/**
 * The inbox row's displayed time label, self-healing the staleness that
 * `time` alone cannot fix.
 *
 * `Conversation.time` is baked once, at fetch or live-patch time, and never
 * changes again on its own: a row sitting in a long-lived tab keeps saying
 * "Today" long after real midnight, and a clock time ("21:14") stays frozen
 * instead of rolling into "Yesterday" and then a weekday as days pass.
 *
 * `updatedAt` (ISO, LIVE mode only, see `Conversation.updatedAt`) is the
 * machine-readable instant behind that label, so this hook re-derives the
 * label from the CURRENT time. `patchConversationPreview` advances
 * `updatedAt` alongside `preview`/`time` on every live patch, so the instant
 * stays authoritative for a chatty conversation as well as a quiet one, and
 * this hook needs no special case for either.
 *
 * Demo rows carry no `updatedAt` (their buckets are hand-authored), so they
 * fall through to the baked label unchanged.
 *
 * Recomputes on `visibilitychange` (a backgrounded tab regaining focus) and
 * on a 60s interval. Rows without `updatedAt` register neither.
 */
export function useThreadRowTimeLabel(
  time: string,
  updatedAt: string | undefined,
): string {
  const [, forceRecompute] = useReducer((tick: number) => tick + 1, 0);

  useEffect(() => {
    if (!updatedAt) return;
    function recompute() {
      // Recomputing behind a hidden tab would re-render every inbox row for a
      // label nobody can read; the visibilitychange listener catches up the
      // moment the tab is looked at again.
      if (document.visibilityState === "visible") forceRecompute();
    }
    document.addEventListener("visibilitychange", recompute);
    const interval = window.setInterval(recompute, RECOMPUTE_INTERVAL_MS);
    return () => {
      document.removeEventListener("visibilitychange", recompute);
      window.clearInterval(interval);
    };
  }, [updatedAt]);

  if (!updatedAt) return time;
  return timeLabel(updatedAt);
}
