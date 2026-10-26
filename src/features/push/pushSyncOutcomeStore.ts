import { useSyncExternalStore } from "react";
import type { PushSyncOutcome } from "./pushResyncDecision";

/**
 * The latest subscription health outcome for the signed-in member, in memory
 * only: it describes this page load's pass and must start empty on every load.
 * Written by `usePushSubscriptionSync`, read by the recovery prompt.
 */
interface PushSyncOutcomeSnapshot {
  memberId: string;
  outcome: PushSyncOutcome;
}

let snapshot: PushSyncOutcomeSnapshot | null = null;
const listeners = new Set<() => void>();

export function reportPushSyncOutcome(
  memberId: string,
  outcome: PushSyncOutcome,
): void {
  if (snapshot?.memberId === memberId && snapshot.outcome === outcome) return;
  snapshot = { memberId, outcome };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The outcome for `memberId`, or `null` when none was reported for them. */
export function usePushSyncOutcome(
  memberId: string | null,
): PushSyncOutcome | null {
  const current = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  );
  return memberId !== null && current?.memberId === memberId
    ? current.outcome
    : null;
}

/** Test seam: forget any reported outcome. */
export function resetPushSyncOutcomeForTests(): void {
  snapshot = null;
  listeners.forEach((listener) => listener());
}
