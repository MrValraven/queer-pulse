import { useCallback, useEffect, useRef } from "react";
import type { SubprofileDTO } from "./api/subprofiles.api";

/**
 * Holds a saved type change until the confirm dialog and the type list have
 * folded away, because applying it re-seeds the editor and remounts the Type
 * field mid-animation. `hold` takes the change and how many exits to wait
 * for; each exit calls `release`, and the last one applies the change. If the
 * field unmounts first, the cleanup applies it so a saved switch is never
 * lost. A held change applies once at most.
 */
export function useHeldKindChange(
  applyKindChange: (saved: SubprofileDTO) => void,
) {
  const heldChangeRef = useRef<SubprofileDTO | null>(null);
  const remainingExitsRef = useRef(0);
  const applyKindChangeRef = useRef(applyKindChange);
  useEffect(() => {
    applyKindChangeRef.current = applyKindChange;
  }, [applyKindChange]);

  const applyHeldChange = useCallback(() => {
    const saved = heldChangeRef.current;
    if (saved === null) return;
    heldChangeRef.current = null;
    applyKindChangeRef.current(saved);
  }, []);
  useEffect(() => applyHeldChange, [applyHeldChange]);

  const release = useCallback(() => {
    if (heldChangeRef.current === null) return;
    remainingExitsRef.current -= 1;
    if (remainingExitsRef.current <= 0) applyHeldChange();
  }, [applyHeldChange]);

  const hold = useCallback((saved: SubprofileDTO, exitCount: number) => {
    heldChangeRef.current = saved;
    remainingExitsRef.current = exitCount;
  }, []);
  return { hold, release };
}
