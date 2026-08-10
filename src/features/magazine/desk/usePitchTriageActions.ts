/**
 * Immediate (no-note) pitch triage: the per-row "Maybe" action, the keyboard
 * y/n shortcuts, and bulk maybe/pass from the selection bar. "Pass with a
 * note" goes through `useDeskModals`'s pass modal instead — this hook only
 * covers the decisions that don't need a composed message. Mirrors the
 * fade-before-commit pattern the old dashboard used, respecting
 * `prefers-reduced-motion`.
 */

import { useState } from "react";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import type { usePitchMutations } from "../api/usePitchMutations";

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

  function maybe(id: string): void {
    runTriage([id], () => pitchMutations.triage.mutate({ id, body: { verdict: "maybe" } }));
  }
  function pass(id: string): void {
    runTriage([id], () => pitchMutations.triage.mutate({ id, body: { verdict: "pass" } }));
  }
  function bulkMaybe(): void {
    runTriage(selectedPitchIds, () => {
      selectedPitchIds.forEach((id) => pitchMutations.triage.mutate({ id, body: { verdict: "maybe" } }));
      clearSelectedPitchIds();
    });
  }
  function bulkPass(): void {
    runTriage(selectedPitchIds, () => {
      selectedPitchIds.forEach((id) => pitchMutations.triage.mutate({ id, body: { verdict: "pass" } }));
      clearSelectedPitchIds();
    });
  }

  return { leavingIds, maybe, pass, bulkMaybe, bulkPass };
}
