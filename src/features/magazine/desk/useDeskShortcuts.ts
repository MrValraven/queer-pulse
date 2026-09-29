/**
 * Wires the desk's keyboard layer (`useDeskKeyboard`) to the page: j/k walk
 * the rows in the order the table draws them, o and j/k drive the peek
 * panel, x selects, / focuses search, p opens pitch triage.
 *
 * The layer is off while ANY dialog is open: the desk's own overlay slot,
 * the pitch triage overlay, the issue pickers, a publish confirm, the command
 * palette, and the peek panel whenever it is the phone's full-screen sheet.
 * `useDeskKeyboard` also checks the shared modal stack on every key, so a
 * dialog this list misses still wins.
 */

import type { RefObject } from "react";
import { useMagazineShellOverlay } from "../../../shared/components/layout";
import { useMediaQuery } from "../../../shared/hooks";
import { mediaMax } from "../../../shared/theme/breakpoints";
import type { Piece, Pitch } from "../data/desk.data";
import { useDeskKeyboard } from "./useDeskKeyboard";
import type { DeskPeek } from "./useDeskPeek";

/** Below this the peek panel is a modal sheet (see `PiecePeekPanel`). */
const PEEK_SHEET_QUERY = mediaMax(767);

export interface UseDeskShortcutsParams {
  /** The rows in the order the table draws them (folded groups left out). */
  keyboardPieces: Piece[];
  focusId: string | null;
  setFocusId: (pieceId: string) => void;
  peek: DeskPeek;
  pitches: Pitch[];
  onChase: (piece: Piece) => void;
  onWrite: () => void;
  onShortcuts: () => void;
  onToggleSelect: (piece: Piece) => void;
  onOpenTriage: () => void;
  onTriageTop: (verdict: "maybe" | "no") => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  /** True while a page-level dialog is open (desk modal, triage, pickers,
   *  publish confirm). */
  hasOpenDialog: boolean;
}

export function useDeskShortcuts({
  keyboardPieces,
  focusId,
  setFocusId,
  peek,
  pitches,
  onChase,
  onWrite,
  onShortcuts,
  onToggleSelect,
  onOpenTriage,
  onTriageTop,
  searchInputRef,
  hasOpenDialog,
}: UseDeskShortcutsParams): void {
  const { isPaletteOpen } = useMagazineShellOverlay();
  const isPeekSheet = useMediaQuery(PEEK_SHEET_QUERY);
  const isPeekOpen = peek.peekPiece !== null;

  useDeskKeyboard({
    visiblePieces: keyboardPieces,
    focusId,
    setFocusId,
    onOpen: peek.openPiece,
    onChase,
    onWrite,
    onShortcuts,
    topPitchId: pitches[0]?.id ?? null,
    onTriageTop,
    enabled: !hasOpenDialog && !isPaletteOpen && !(isPeekOpen && isPeekSheet),
    onToggleSelect,
    onFocusSearch: () => searchInputRef.current?.focus(),
    isPeekOpen,
    // "p" only means something with a pitch waiting.
    onOpenTriage: pitches.length > 0 ? onOpenTriage : undefined,
  });
}
