/**
 * Desk keyboard shortcuts: j/k move focus through the visible pieces (and,
 * while the peek panel is open, open the newly focused piece there too, so
 * the panel follows the cursor), o opens the focused piece, x toggles its
 * selection, c chases it, w starts a piece you write yourself, p opens the
 * pitch triage panel, / focuses the search field, ? opens the shortcuts
 * sheet, and y/n triage the top pitch. Every key here is a no-op while any
 * dialog sits on the shared modal stack, so a letter typed at a confirm
 * dialog or the peek panel's mobile sheet never reaches the table
 * underneath, and while any popup (a date popover, a menu) is open. Escape belongs to whichever dialog is open (the peek panel,
 * `usePiecePeekDialog.ts`, owns its own); this hook does not handle it.
 * ⌘K is handled by the shell.
 *
 * A key pressed with Cmd, Ctrl or Alt belongs to the browser or the OS
 * (copy, redo, print, the palette), so it never reaches the desk, and a key
 * held down fires once. The single-character keys can be switched off from
 * the shortcut sheet (`deskLetterShortcuts.ts`); `?` stays live so the sheet,
 * and the switch in it, can always be opened again.
 */

import { useEffect } from "react";
import { hasOpenModal } from "../../../shared/components/ui/modalStack";
import type { Piece } from "../data/desk.data";
import { useDeskLetterShortcutsEnabled } from "./deskLetterShortcuts";

export interface UseDeskKeyboardParams {
  visiblePieces: Piece[];
  focusId: string | null;
  setFocusId: (id: string) => void;
  onOpen: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
  onWrite: () => void;
  onShortcuts: () => void;
  topPitchId: string | null;
  onTriageTop: (verdict: "maybe" | "no") => void;
  enabled: boolean;
  /** x: toggles the focused piece's row selection, for the bulk action bar. */
  onToggleSelect?: (piece: Piece) => void;
  /** /: focuses the toolbar's search field. */
  onFocusSearch?: () => void;
  /** True while the peek panel is open: j/k then also call `onOpen` for the
   *  newly focused piece, so the panel's contents follow the cursor instead
   *  of moving focus underneath it unnoticed. */
  isPeekOpen?: boolean;
  /** p: opens the pitch triage panel. */
  onOpenTriage?: () => void;
}

const EDITABLE_TARGET_TAG_NAMES = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (EDITABLE_TARGET_TAG_NAMES.has(target.tagName)) return true;
  return target.isContentEditable;
}

/** The two punctuation keys some layouts type with AltGr (the Brazilian
 *  ABNT2 keyboard puts "/" on AltGr+Q and "?" on AltGr+W). */
const ALT_GRAPH_PUNCTUATION_KEYS = new Set(["/", "?"]);

/**
 * True for a chord with Cmd, Ctrl or Alt. Windows reports AltGr as Ctrl+Alt
 * and reads a physical Ctrl+Alt as AltGr on most European layouts, so AltGr
 * passes only for "/" and "?": on the Portuguese layout AltGr+N types
 * nothing and arrives as a plain "n", which must stay blocked.
 */
function isModifiedKeyPress(event: KeyboardEvent): boolean {
  if (event.metaKey) return true;
  const isPunctuationViaAltGraph =
    event.getModifierState("AltGraph") &&
    ALT_GRAPH_PUNCTUATION_KEYS.has(event.key);
  if (isPunctuationViaAltGraph) return false;
  return event.ctrlKey || event.altKey;
}

/** An open popup, in ARIA terms: a trigger that declares one
 *  (`aria-haspopup`) and says it is showing (`aria-expanded="true"`). */
const OPEN_POPUP_TRIGGER_SELECTOR =
  '[aria-haspopup]:not([aria-haspopup="false"])[aria-expanded="true"]';

/**
 * True while any popup layer is open on the page: a date popover, a menu, a
 * select's list. Those layers are non-modal, so they never join the modal
 * stack, yet a letter typed in them belongs to them. Reading the trigger's
 * ARIA state covers every popup built on the pattern, wherever focus is,
 * while the desk's own non-modal peek panel (opened from a row, with no
 * popup trigger) keeps j/k.
 */
function hasOpenPopup(): boolean {
  return document.querySelector(OPEN_POPUP_TRIGGER_SELECTOR) !== null;
}

/** The one key that stays live while the single-character shortcuts are off:
 *  it opens the sheet that turns them back on. */
const ALWAYS_ON_KEY = "?";

export function useDeskKeyboard(params: UseDeskKeyboardParams): void {
  const {
    visiblePieces,
    focusId,
    setFocusId,
    onOpen,
    onChase,
    onWrite,
    onShortcuts,
    topPitchId,
    onTriageTop,
    enabled,
    onToggleSelect,
    onFocusSearch,
    isPeekOpen,
    onOpenTriage,
  } = params;
  const isLetterShortcutsEnabled = useDeskLetterShortcutsEnabled();

  useEffect(() => {
    if (!enabled) return undefined;

    function handleKeyDown(event: KeyboardEvent): void {
      // Any dialog on the shared modal stack owns the keyboard while it is
      // open: a confirm dialog, the chase/pass/commission modals, and the
      // peek panel's mobile sheet all push themselves onto it. Without this,
      // typing "n" to dismiss a confirm's own prompt could also triage the
      // desk's top pitch underneath it.
      if (hasOpenModal() || hasOpenPopup()) return;
      if (isEditableEventTarget(event.target)) return;
      if (isModifiedKeyPress(event) || event.repeat) return;
      if (!isLetterShortcutsEnabled && event.key !== ALWAYS_ON_KEY) return;

      const focusedIndex = visiblePieces.findIndex(
        (piece) => piece.id === focusId,
      );

      switch (event.key) {
        case "j": {
          const nextIndex = Math.min(
            focusedIndex + 1,
            visiblePieces.length - 1,
          );
          const nextPiece = visiblePieces[nextIndex < 0 ? 0 : nextIndex];
          if (nextPiece) {
            setFocusId(nextPiece.id);
            if (isPeekOpen) onOpen(nextPiece);
          }
          break;
        }
        case "k": {
          const previousIndex = Math.max(focusedIndex - 1, 0);
          const previousPiece = visiblePieces[previousIndex];
          if (previousPiece) {
            setFocusId(previousPiece.id);
            if (isPeekOpen) onOpen(previousPiece);
          }
          break;
        }
        case "o": {
          const focusedPiece = visiblePieces.find(
            (piece) => piece.id === focusId,
          );
          if (focusedPiece) onOpen(focusedPiece);
          break;
        }
        case "x": {
          if (!onToggleSelect) break;
          const focusedPiece = visiblePieces.find(
            (piece) => piece.id === focusId,
          );
          if (focusedPiece) onToggleSelect(focusedPiece);
          break;
        }
        case "c": {
          const focusedPiece = visiblePieces.find(
            (piece) => piece.id === focusId,
          );
          if (focusedPiece) onChase(focusedPiece);
          break;
        }
        case "w":
          onWrite();
          break;
        case "p":
          onOpenTriage?.();
          break;
        case "/":
          if (!onFocusSearch) break;
          event.preventDefault();
          onFocusSearch();
          break;
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
  }, [
    visiblePieces,
    focusId,
    setFocusId,
    onOpen,
    onChase,
    onWrite,
    onShortcuts,
    topPitchId,
    onTriageTop,
    enabled,
    onToggleSelect,
    onFocusSearch,
    isPeekOpen,
    onOpenTriage,
    isLetterShortcutsEnabled,
  ]);
}
