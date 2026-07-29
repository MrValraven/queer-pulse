import { useEffect } from "react";
import { useProfile } from "../../app/providers/useProfile";

/**
 * Discards the editor on Escape while `enabled` — used by the edit bar. Routes
 * through `requestCancel` so a dirty draft prompts a confirm before discarding.
 *
 * Split out of profileEditControls.tsx so that file only exports components
 * (react-refresh/only-export-components).
 */
export function useEscapeToCancel(enabled: boolean) {
  const { requestCancel } = useProfile();
  useEffect(() => {
    if (!enabled) return;
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") requestCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestCancel, enabled]);
}
