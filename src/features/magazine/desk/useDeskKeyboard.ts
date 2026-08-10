/**
 * Desk keyboard shortcuts: j/k move focus through the visible pieces,
 * o opens the focused piece, c chases it, ? opens the shortcuts sheet,
 * y/n triage the top pitch. ⌘K is handled by the page, not here.
 */

import { useEffect } from "react";
import type { Piece } from "../data/desk.data";

export interface UseDeskKeyboardParams {
  visiblePieces: Piece[];
  focusId: string | null;
  setFocusId: (id: string) => void;
  onOpen: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
  onShortcuts: () => void;
  topPitchId: string | null;
  onTriageTop: (verdict: "maybe" | "no") => void;
  enabled: boolean;
}

const EDITABLE_TARGET_TAG_NAMES = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (EDITABLE_TARGET_TAG_NAMES.has(target.tagName)) return true;
  return target.isContentEditable;
}

export function useDeskKeyboard(params: UseDeskKeyboardParams): void {
  const {
    visiblePieces,
    focusId,
    setFocusId,
    onOpen,
    onChase,
    onShortcuts,
    topPitchId,
    onTriageTop,
    enabled,
  } = params;

  useEffect(() => {
    if (!enabled) return undefined;

    function handleKeyDown(event: KeyboardEvent): void {
      if (isEditableEventTarget(event.target)) return;

      const focusedIndex = visiblePieces.findIndex((piece) => piece.id === focusId);

      switch (event.key) {
        case "j": {
          const nextIndex = Math.min(focusedIndex + 1, visiblePieces.length - 1);
          const nextPiece = visiblePieces[nextIndex < 0 ? 0 : nextIndex];
          if (nextPiece) setFocusId(nextPiece.id);
          break;
        }
        case "k": {
          const previousIndex = Math.max(focusedIndex - 1, 0);
          const previousPiece = visiblePieces[previousIndex];
          if (previousPiece) setFocusId(previousPiece.id);
          break;
        }
        case "o": {
          const focusedPiece = visiblePieces.find((piece) => piece.id === focusId);
          if (focusedPiece) onOpen(focusedPiece);
          break;
        }
        case "c": {
          const focusedPiece = visiblePieces.find((piece) => piece.id === focusId);
          if (focusedPiece) onChase(focusedPiece);
          break;
        }
        case "?":
          onShortcuts();
          break;
        case "y":
          if (topPitchId) onTriageTop("maybe");
          break;
        case "n":
          if (topPitchId) onTriageTop("no");
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visiblePieces, focusId, setFocusId, onOpen, onChase, onShortcuts, topPitchId, onTriageTop, enabled]);
}
