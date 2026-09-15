// src/features/messages/EmojiGrid.tsx
import { useRef, useState, type CSSProperties } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Language } from "../../shared/i18n/types";
import { EMOJI_SECTION_LABEL_KEY, type EmojiGridItem } from "./emojiSections";
import type { EmojiGridRow } from "./useEmojiGridVirtualizer";
import styles from "./EmojiPicker.module.css";

interface EmojiGridProps {
  /** A CALLBACK ref (not a plain object ref) — see
   *  `useEmojiGridVirtualizer`'s own doc for why. */
  containerRef: (node: HTMLDivElement | null) => void;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  rows: EmojiGridRow[];
  /** The measured column count `rows` were chunked with, published to CSS as
   *  `--emoji-columns` so `.gridRow`'s tracks and this chunking can never
   *  disagree — see `.gridRow` in `EmojiPicker.module.css`. */
  columnCount: number;
  /** The current UI language, for each button's accessible name — see
   *  `emojiAccessibleName`. */
  language: Language;
  onPick: (item: EmojiGridItem) => void;
}

function emojiAccessibleName(item: EmojiGridItem, language: Language): string {
  return language === "pt" ? item.labelPt : item.label;
}

/**
 * The virtualized emoji grid — windows 1,914+ possible buttons to only the
 * visible rows (+ overscan), same shape as `useMessageRowVirtualizer` windows
 * the message log. Every cell is one glyph in a fixed 36px-tall track, so
 * (unlike a message bubble) row height never varies with content and needs
 * no `measureElement` correction. Cell WIDTH is the row's `1fr` track rather
 * than a fixed 36px, so the columns finish flush with `.grid`'s right inset
 * instead of leaving the measurement's remainder as dead space there.
 *
 * Keyboard model is a roving-tabindex grid: only the active cell is a real
 * tab stop (`tabIndex 0`), arrow keys move it, and moving past the mounted
 * window calls `scrollToIndex` first so the target row actually exists in the
 * DOM before the next frame tries to focus it. Enter/Space pick natively —
 * these are real `<button>`s, so no extra key handling is needed for that.
 *
 * A header row (the section label band `useEmojiGridVirtualizer` now
 * interleaves ahead of each section's cells) carries no cells and is never a
 * legal keyboard stop: `moveTo` always walks straight over one in the
 * direction of travel, so ArrowDown from a section's last cell row lands on
 * the NEXT section's first cell row (skipping that section's own header),
 * and ArrowUp mirrors it landing on the PREVIOUS section's last cell row.
 */
export function EmojiGrid({
  containerRef,
  rowVirtualizer,
  rows,
  columnCount,
  language,
  onPick,
}: EmojiGridProps) {
  const { t } = useTranslation();
  const [activeRow, setActiveRow] = useState(0);
  const [activeCol, setActiveCol] = useState(0);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());

  // Walks from `startIndex` in `direction` until a cells row is found (or the
  // list runs out), skipping any header row along the way. Shared by the
  // reshape clamp below and by `moveTo`, since both need the same "never
  // land on a header" rule: a header only ever precedes at least one cells
  // row (it's emitted solely for non-empty sections), so in practice this
  // never has to skip more than one row, but it's written as a walk rather
  // than a single peek so it also degrades correctly (returns `null`, i.e.
  // "nothing found") at either end of the list.
  function findNearestCellsRowIndex(
    startIndex: number,
    direction: 1 | -1,
  ): number | null {
    let index = startIndex;
    while (index >= 0 && index < rows.length) {
      if (rows[index]?.kind === "cells") return index;
      index += direction;
    }
    return null;
  }

  // Clamp whenever the row list reshapes (a search swapped results in, or the
  // dataset just finished loading) so a stale coordinate never points past
  // the new end — adjusted directly during render (React's sanctioned
  // "adjust state while rendering" idiom, same shape `MessageArea.tsx`'s
  // `useReactionNewness` already uses) rather than in a follow-up effect, so
  // this render's own output never briefly points at a row that's gone. The
  // plain length-clamp can land exactly on a header row after a reshape, so
  // it's nudged forward (then backward, then to 0 as a last resort) to the
  // nearest real cells row: the roving coordinate must never point at a
  // header, the same rule `moveTo` enforces during keyboard navigation.
  const lengthClampedActiveRow = Math.min(
    activeRow,
    Math.max(rows.length - 1, 0),
  );
  const clampedActiveRow =
    rows.length === 0
      ? 0
      : (findNearestCellsRowIndex(lengthClampedActiveRow, 1) ??
        findNearestCellsRowIndex(lengthClampedActiveRow, -1) ??
        0);
  if (clampedActiveRow !== activeRow) {
    setActiveRow(clampedActiveRow);
  }

  function focusCell(row: number, col: number) {
    requestAnimationFrame(() => {
      buttonRefs.current.get(`${row}-${col}`)?.focus();
    });
  }

  function moveTo(nextRow: number, nextCol: number) {
    if (rows.length === 0) return;
    const rowDelta = nextRow - clampedActiveRow;
    let resolvedRow = clampedActiveRow;
    if (rowDelta !== 0) {
      // ArrowUp/Down cross rows and must resolve to a cells row, walking
      // past a header in the direction of travel rather than landing on it.
      // Running off either end of the list is a deliberate no-op ("stay
      // put") rather than a clamp to the nearest row: clamping here would
      // silently teleport focus past a whole section when the user is
      // already at the very first or last cell row.
      const direction = rowDelta > 0 ? 1 : -1;
      const found = findNearestCellsRowIndex(nextRow, direction);
      if (found === null) return;
      resolvedRow = found;
    }
    const targetRow = rows[resolvedRow];
    const rowItemCount =
      targetRow?.kind === "cells" ? targetRow.items.length : 1;
    const clampedCol = Math.max(0, Math.min(nextCol, rowItemCount - 1));
    setActiveRow(resolvedRow);
    setActiveCol(clampedCol);
    rowVirtualizer.scrollToIndex(resolvedRow, { align: "auto" });
    focusCell(resolvedRow, clampedCol);
  }

  // Attached to each individual `<button>` below, not the wrapping div: the
  // buttons are the real interactive units (a native element jsx-a11y is
  // happy to see a keydown listener on), and the arrow keys only ever fire
  // while one of them already has DOM focus anyway.
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveTo(clampedActiveRow, activeCol + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveTo(clampedActiveRow, activeCol - 1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTo(clampedActiveRow + 1, activeCol);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTo(clampedActiveRow - 1, activeCol);
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.grid}
      style={{ "--emoji-columns": columnCount } as CSSProperties}
    >
      <div
        style={{ position: "relative", height: rowVirtualizer.getTotalSize() }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;
          const positionStyle: React.CSSProperties = {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${virtualRow.start}px)`,
          };
          if (row.kind === "header") {
            const labelKey =
              EMOJI_SECTION_LABEL_KEY[row.sectionKey] ??
              "messages:emoji.categorySmileys";
            return (
              <div
                key={virtualRow.key}
                className={styles.sectionHeader}
                style={positionStyle}
              >
                {t(labelKey)}
              </div>
            );
          }
          return (
            <div
              key={virtualRow.key}
              className={styles.gridRow}
              style={positionStyle}
            >
              {row.items.map((item, columnIndex) => {
                const isActive =
                  virtualRow.index === clampedActiveRow &&
                  columnIndex === activeCol;
                const cellKey = `${virtualRow.index}-${columnIndex}`;
                return (
                  <button
                    key={item.glyph}
                    ref={(node) => {
                      if (node) buttonRefs.current.set(cellKey, node);
                      else buttonRefs.current.delete(cellKey);
                    }}
                    type="button"
                    className={styles.emojiBtn}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={emojiAccessibleName(item, language)}
                    onFocus={() => {
                      setActiveRow(virtualRow.index);
                      setActiveCol(columnIndex);
                    }}
                    onKeyDown={handleKeyDown}
                    onClick={() => onPick(item)}
                  >
                    {/* The glyph is the visible content; `aria-label` above
                        (not this text) is what a screen reader announces. */}
                    {item.glyph}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
