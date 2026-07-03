import { useEffect } from "react";
import type { TriageVerdict } from "./editorDashboard.data";

/**
 * Keyboard navigation for the editor dashboard. Ignores keystrokes while the
 * user is typing in a field, and is disabled while a modal is open. j/k move
 * the focused piece; o/c act on it; y/n/m triage the top pitch; / focuses
 * search; ? opens the shortcut help.
 */
export function useEditorKeyboard({
  enabled,
  pieceIds,
  focusedId,
  setFocusedId,
  onOpen,
  onChase,
  topPitchId,
  onTriage,
  onShortcuts,
}: {
  enabled: boolean;
  pieceIds: string[];
  focusedId: string | null;
  setFocusedId: (id: string) => void;
  onOpen: (id: string) => void;
  onChase: (id: string) => void;
  topPitchId: string | null;
  onTriage: (id: string, verdict: TriageVerdict) => void;
  onShortcuts: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (/^(input|textarea|select)$/i.test(tag)) return;
      if (!enabled) return;

      switch (e.key) {
        case "/":
          e.preventDefault();
          document.getElementById("editor-search")?.focus();
          return;
        case "?":
          onShortcuts();
          return;
        case "j":
        case "k": {
          if (!pieceIds.length) return;
          const idx = focusedId ? pieceIds.indexOf(focusedId) : -1;
          const next = Math.max(
            0,
            Math.min(pieceIds.length - 1, idx + (e.key === "j" ? 1 : -1)),
          );
          const id = pieceIds[next];
          if (!id) return;
          setFocusedId(id);
          document
            .querySelector(`[data-piece-id="${id}"]`)
            ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          return;
        }
        case "o":
          if (focusedId) onOpen(focusedId);
          return;
        case "c":
          if (focusedId) onChase(focusedId);
          return;
        case "y":
        case "n":
        case "m":
          if (topPitchId) {
            const verdict: TriageVerdict =
              e.key === "y" ? "yes" : e.key === "n" ? "no" : "maybe";
            onTriage(topPitchId, verdict);
          }
          return;
        default:
          return;
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [
    enabled,
    pieceIds,
    focusedId,
    setFocusedId,
    onOpen,
    onChase,
    topPitchId,
    onTriage,
    onShortcuts,
  ]);
}
