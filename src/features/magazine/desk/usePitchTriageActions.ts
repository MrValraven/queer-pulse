/**
 * Immediate (no-note) pitch triage: the per-row "Maybe" action, the keyboard
 * y/n shortcuts, and bulk maybe/pass from the selection bar. "Pass with a
 * note" goes through `useDeskModals`'s pass modal; this hook covers the
 * decisions that need no composed message. Mirrors the fade-before-commit
 * pattern the old dashboard used, respecting `prefers-reduced-motion`.
 *
 * A pitch is decided once per press: from the first press, a second decision
 * on the same pitch is dropped while the first is still landing. The y/n
 * keys always act on the top pitch, which stays on top through the fade, the
 * request and the list refetch, so a quick double tap would otherwise send
 * two verdicts for one pitch. The hold ends as soon as one of these happens:
 * - the request fails, so the editor can retry at once;
 * - the pitch leaves the inbox list (live mode, once the refetch lands);
 * - `DECIDED_HOLD_MS` passes after a success. Demo mode's list is static
 *   and never drops a decided pitch, so without this bound the top pitch
 *   would stay held and every later y/n on it would be swallowed.
 */

import { useEffect, useRef, useState } from "react";
import type { PitchVerdict } from "../api/pieces.api";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import type { usePitchMutations } from "../api/usePitchMutations";
import { usePitches } from "../api/usePitches";

/** How long a successfully decided pitch stays held when it is still in the
 *  list: long enough to cover a live refetch, short enough that demo mode's
 *  static list feels responsive to a deliberate second decision. */
export const DECIDED_HOLD_MS = 1500;

export interface UsePitchTriageActionsParams {
  pitchMutations: ReturnType<typeof usePitchMutations>;
  selectedPitchIds: string[];
  clearSelectedPitchIds: () => void;
}

export function usePitchTriageActions({
  pitchMutations,
  selectedPitchIds,
  clearSelectedPitchIds,
}: UsePitchTriageActionsParams) {
  const reducedMotion = usePrefersReducedMotion();
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());

  function runTriage(ids: string[], commit: () => void): void {
    if (reducedMotion || ids.length === 0) {
      commit();
      return;
    }
    setLeavingIds((current) => new Set([...current, ...ids]));
    window.setTimeout(() => {
      commit();
      setLeavingIds((current) => {
        const next = new Set(current);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, 220);
  }

  // Held in a ref so a second press in the same tick already sees the first.
  const decidingIdsRef = useRef<Set<string>>(new Set());
  // One bounded hold timer per decided pitch, cleared on release and unmount.
  const holdTimersRef = useRef<Map<string, number>>(new Map());
  // The same inbox query the desk reads (react-query shares the request), so
  // a pitch the refetch removed is released without waiting for its timer.
  const { pitches } = usePitches();

  function releasePitch(id: string): void {
    decidingIdsRef.current.delete(id);
    const holdTimer = holdTimersRef.current.get(id);
    if (holdTimer !== undefined) {
      window.clearTimeout(holdTimer);
      holdTimersRef.current.delete(id);
    }
  }

  function holdDecidedPitch(id: string): void {
    // A pitch the list already dropped needs no hold.
    if (!decidingIdsRef.current.has(id)) return;
    const holdTimer = window.setTimeout(
      () => releasePitch(id),
      DECIDED_HOLD_MS,
    );
    holdTimersRef.current.set(id, holdTimer);
  }

  // Release every held pitch the inbox no longer lists.
  useEffect(() => {
    const listedIds = new Set(pitches.map((pitch) => pitch.id));
    for (const id of [...decidingIdsRef.current]) {
      if (!listedIds.has(id)) releasePitch(id);
    }
  }, [pitches]);

  useEffect(() => {
    const holdTimers = holdTimersRef.current;
    return () => {
      holdTimers.forEach((holdTimer) => window.clearTimeout(holdTimer));
      holdTimers.clear();
    };
  }, []);

  function decide(
    ids: string[],
    verdict: PitchVerdict,
    afterCommit?: () => void,
  ): void {
    const freshIds = ids.filter((id) => !decidingIdsRef.current.has(id));
    if (freshIds.length === 0) {
      afterCommit?.();
      return;
    }
    freshIds.forEach((id) => decidingIdsRef.current.add(id));
    runTriage(freshIds, () => {
      freshIds.forEach((id) => {
        // `mutateAsync` settles per call (a per-call callback fires only for
        // the last of several), so each id is held or released on its own.
        // The mutation's own error handling already tells the editor.
        void pitchMutations.triage.mutateAsync({ id, body: { verdict } }).then(
          () => holdDecidedPitch(id),
          () => releasePitch(id),
        );
      });
      afterCommit?.();
    });
  }

  function maybe(id: string): void {
    decide([id], "maybe");
  }
  function pass(id: string): void {
    decide([id], "pass");
  }
  function bulkMaybe(): void {
    decide(selectedPitchIds, "maybe", clearSelectedPitchIds);
  }
  function bulkPass(): void {
    decide(selectedPitchIds, "pass", clearSelectedPitchIds);
  }

  return { leavingIds, maybe, pass, bulkMaybe, bulkPass };
}
